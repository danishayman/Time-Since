import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { loadSettings, saveSettings } from '@/store/storage';
import { DEFAULT_SETTINGS, type Settings } from '@/types/settings';

type State = {
  settings: Settings;
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; settings: Settings }
  | { type: 'set'; patch: Partial<Settings> }
  | { type: 'reset' };

const initialState: State = { settings: DEFAULT_SETTINGS, hydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { settings: action.settings, hydrated: true };

    case 'set':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'reset':
      return { ...state, settings: DEFAULT_SETTINGS };
  }
}

type SettingsContextValue = {
  settings: Settings;
  hydrated: boolean;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((settings) => {
      if (!cancelled) {
        dispatch({ type: 'hydrate', settings });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Same gate as the timers store: writing before hydration finishes would
    // overwrite the stored preferences with the defaults on every launch.
    if (!state.hydrated) {
      return;
    }
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => saveSettings(state.settings), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state.settings, state.hydrated]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings: state.settings,
      hydrated: state.hydrated,
      setSetting: (key, val) => dispatch({ type: 'set', patch: { [key]: val } as Partial<Settings> }),
      resetSettings: () => dispatch({ type: 'reset' }),
    }),
    [state.settings, state.hydrated]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a SettingsProvider');
  }
  return context;
}
