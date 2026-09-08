import * as Crypto from 'expo-crypto';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { loadCategories, saveCategories } from '@/store/storage';
import type { Category, CategoryDraft } from '@/types/category';

type State = {
  categories: Category[];
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; categories: Category[] }
  | { type: 'add'; draft: CategoryDraft }
  | { type: 'update'; id: string; draft: CategoryDraft }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'import'; categories: Category[] };

const initialState: State = { categories: [], hydrated: false };

function sortByOrder(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

/** Rewrites `order` to match array position so the stored order stays dense. */
function reindex(categories: Category[]): Category[] {
  return categories.map((category, index) =>
    category.order === index ? category : { ...category, order: index }
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { categories: reindex(sortByOrder(action.categories)), hydrated: true };

    case 'add':
      return {
        ...state,
        categories: [
          ...state.categories,
          {
            id: Crypto.randomUUID(),
            name: action.draft.name.trim(),
            color: action.draft.color,
            order: state.categories.length,
          },
        ],
      };

    case 'update':
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.id
            ? { ...category, name: action.draft.name.trim(), color: action.draft.color }
            : category
        ),
      };

    case 'remove':
      return {
        ...state,
        categories: reindex(state.categories.filter((category) => category.id !== action.id)),
      };

    case 'reorder': {
      const next = [...state.categories];
      const [moved] = next.splice(action.from, 1);
      if (!moved) {
        return state;
      }
      next.splice(action.to, 0, moved);
      return { ...state, categories: reindex(next) };
    }

    case 'import':
      return { ...state, categories: reindex(sortByOrder(action.categories)) };
  }
}

type CategoriesContextValue = {
  categories: Category[];
  hydrated: boolean;
  addCategory: (draft: CategoryDraft) => void;
  updateCategory: (id: string, draft: CategoryDraft) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (from: number, to: number) => void;
  /** Replaces the whole set, used when a backup is restored. */
  importCategories: (categories: Category[]) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCategories().then((categories) => {
      if (!cancelled) {
        dispatch({ type: 'hydrate', categories });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Same gate as the other two stores: writing before hydration finishes
    // would clobber the stored list with an empty one on every launch.
    if (!state.hydrated) {
      return;
    }
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => saveCategories(state.categories), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state.categories, state.hydrated]);

  const value = useMemo<CategoriesContextValue>(
    () => ({
      categories: state.categories,
      hydrated: state.hydrated,
      addCategory: (draft) => dispatch({ type: 'add', draft }),
      updateCategory: (id, draft) => dispatch({ type: 'update', id, draft }),
      removeCategory: (id) => dispatch({ type: 'remove', id }),
      reorderCategories: (from, to) => dispatch({ type: 'reorder', from, to }),
      importCategories: (categories) => dispatch({ type: 'import', categories }),
    }),
    [state.categories, state.hydrated]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used inside a CategoriesProvider');
  }
  return context;
}

export function useCategory(id: string | undefined): Category | undefined {
  const { categories } = useCategories();
  return categories.find((category) => category.id === id);
}
