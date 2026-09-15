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
import { AppState } from 'react-native';

import { loadTimers, saveTimers } from '@/store/storage';
import type { Timer, TimerDraft, TimerFormat } from '@/types/timer';
import { DEFAULT_FORMAT } from '@/utils/format-duration';
import { applyRestart } from '@/utils/restarts';
import { currentTick } from '@/utils/ticker';
import { refreshTimerWidgets } from '@/widgets/refresh';

type State = {
  timers: Timer[];
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; timers: Timer[] }
  | { type: 'reload'; timers: Timer[] }
  | { type: 'add'; draft: TimerDraft }
  | { type: 'update'; id: string; draft: TimerDraft }
  | { type: 'remove'; id: string }
  | { type: 'restart'; id: string }
  | { type: 'stop'; id: string }
  | { type: 'resume'; id: string }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'setNotifications'; id: string; enabled: boolean }
  | { type: 'setCategory'; id: string; categoryId: string | null }
  | { type: 'setFormat'; id: string; format: TimerFormat }
  | { type: 'import'; timers: Timer[]; mode: ImportMode }
  | { type: 'clearCategory'; categoryId: string }
  | { type: 'clearRestarts'; id: string }
  | { type: 'clear' };

/** Whether an imported backup is appended to the list or replaces it. */
export type ImportMode = 'merge' | 'replace';

const initialState: State = { timers: [], hydrated: false };

function sortByOrder(timers: Timer[]): Timer[] {
  return [...timers].sort((a, b) => a.order - b.order);
}

/** Rewrites `order` to match array position so the stored order stays dense. */
function reindex(timers: Timer[]): Timer[] {
  return timers.map((timer, index) => (timer.order === index ? timer : { ...timer, order: index }));
}

function mapTimer(state: State, id: string, update: (timer: Timer) => Timer): State {
  return {
    ...state,
    timers: state.timers.map((timer) => (timer.id === id ? update(timer) : timer)),
  };
}

function createTimer(draft: TimerDraft, order: number): Timer {
  const nowIso = new Date().toISOString();
  return {
    id: Crypto.randomUUID(),
    label: draft.label.trim(),
    color: draft.color,
    startDateTime: draft.startDateTime,
    createdAt: nowIso,
    isRunning: true,
    // Running "since" the event itself, so a past date starts already elapsed
    // and a future date starts negative and counts down.
    runningSince: draft.startDateTime,
    accumulatedMs: 0,
    order,
    notificationsEnabled: false,
    format: DEFAULT_FORMAT,
    categoryId: draft.categoryId,
    restarts: [],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { timers: reindex(sortByOrder(action.timers)), hydrated: true };

    case 'reload':
      // Storage is the authority again. A restart tapped on a home screen
      // widget writes straight to `timesince.timers.v1` from a headless task,
      // so whatever this reducer is still holding from before the app was
      // backgrounded is stale and would overwrite it on the next save.
      return { timers: reindex(sortByOrder(action.timers)), hydrated: true };

    case 'add':
      return { ...state, timers: [...state.timers, createTimer(action.draft, state.timers.length)] };

    case 'update':
      return mapTimer(state, action.id, (timer) => {
        if (timer.startDateTime === action.draft.startDateTime) {
          return {
            ...timer,
            label: action.draft.label.trim(),
            color: action.draft.color,
            categoryId: action.draft.categoryId,
          };
        }
        // Moving the event date re-bases the elapsed time on the new date, so
        // any time accrued against the old one is discarded rather than added.
        return {
          ...timer,
          label: action.draft.label.trim(),
          color: action.draft.color,
          categoryId: action.draft.categoryId,
          startDateTime: action.draft.startDateTime,
          accumulatedMs: 0,
          runningSince: timer.isRunning ? action.draft.startDateTime : null,
        };
      });

    case 'remove':
      return { ...state, timers: reindex(state.timers.filter((timer) => timer.id !== action.id)) };

    case 'restart':
      // The ticker's value, not the wall clock, so the badge reads a clean zero
      // rather than a fraction of a second short of it, and the logged run
      // matches the reading the user was looking at when they tapped. The home
      // screen widget calls the same helper with the wall clock.
      return mapTimer(state, action.id, (timer) => applyRestart(timer, currentTick()));

    case 'stop':
      return mapTimer(state, action.id, (timer) => {
        if (!timer.isRunning) {
          return timer;
        }
        // Freeze exactly what the badge is showing. Reading the wall clock
        // here instead would bank up to a tick of time the badge had not shown
        // yet, and the reading would jump forward as it froze.
        const accrued = timer.runningSince ? currentTick() - Date.parse(timer.runningSince) : 0;
        return {
          ...timer,
          isRunning: false,
          runningSince: null,
          accumulatedMs: timer.accumulatedMs + accrued,
        };
      });

    case 'resume':
      return mapTimer(state, action.id, (timer) =>
        timer.isRunning
          ? timer
          : // Same basis as Stop, or resuming would drop the reading back by
            // the part of a tick that had already elapsed.
            { ...timer, isRunning: true, runningSince: new Date(currentTick()).toISOString() }
      );

    case 'reorder': {
      const next = [...state.timers];
      const [moved] = next.splice(action.from, 1);
      if (!moved) {
        return state;
      }
      next.splice(action.to, 0, moved);
      return { ...state, timers: reindex(next) };
    }

    case 'setNotifications':
      return mapTimer(state, action.id, (timer) => ({
        ...timer,
        notificationsEnabled: action.enabled,
      }));

    case 'setCategory':
      return mapTimer(state, action.id, (timer) => ({ ...timer, categoryId: action.categoryId }));

    case 'setFormat':
      return mapTimer(state, action.id, (timer) => ({ ...timer, format: action.format }));

    case 'import':
      // Merged rows arrive already re-identified by `reidentifyBackup`, which
      // has to mint the ids itself so it can remap `categoryId` at the same
      // time. This reducer only decides where they land.
      return action.mode === 'replace'
        ? { ...state, timers: reindex(sortByOrder(action.timers)) }
        : { ...state, timers: reindex([...state.timers, ...sortByOrder(action.timers)]) };

    case 'clearCategory':
      // Housekeeping only: an unresolvable id already reads as uncategorised,
      // so this just stops deleted ids lingering in storage.
      return {
        ...state,
        timers: state.timers.map((timer) =>
          timer.categoryId === action.categoryId ? { ...timer, categoryId: null } : timer
        ),
      };

    case 'clearRestarts':
      return mapTimer(state, action.id, (timer) => ({ ...timer, restarts: [] }));

    case 'clear':
      return { ...state, timers: [] };
  }
}

type TimersContextValue = {
  timers: Timer[];
  hydrated: boolean;
  addTimer: (draft: TimerDraft) => void;
  updateTimer: (id: string, draft: TimerDraft) => void;
  removeTimer: (id: string) => void;
  restartTimer: (id: string) => void;
  stopTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  reorderTimers: (from: number, to: number) => void;
  setNotificationsEnabled: (id: string, enabled: boolean) => void;
  setCategory: (id: string, categoryId: string | null) => void;
  setFormat: (id: string, format: TimerFormat) => void;
  importTimers: (timers: Timer[], mode: ImportMode) => void;
  clearCategory: (categoryId: string) => void;
  clearRestarts: (id: string) => void;
  clearTimers: () => void;
};

const TimersContext = createContext<TimersContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function TimersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTimers().then((timers) => {
      if (!cancelled) {
        dispatch({ type: 'hydrate', timers });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Never write before hydration finishes, or the first render would clobber
    // the stored list with an empty one.
    if (!state.hydrated) {
      return;
    }
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      // Widgets read the same key, so they are redrawn from the value that was
      // just written rather than from this component's state — one source of
      // truth, and no chance of painting a timer the store has not saved yet.
      saveTimers(state.timers).then(refreshTimerWidgets);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state.timers, state.hydrated]);

  useEffect(() => {
    // Only on the way back from the background: the app is the only writer
    // while it is in front, and re-reading on every foreground of an already
    // active app would just be churn.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        return;
      }
      loadTimers().then((timers) => dispatch({ type: 'reload', timers }));
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<TimersContextValue>(
    () => ({
      timers: state.timers,
      hydrated: state.hydrated,
      addTimer: (draft) => dispatch({ type: 'add', draft }),
      updateTimer: (id, draft) => dispatch({ type: 'update', id, draft }),
      removeTimer: (id) => dispatch({ type: 'remove', id }),
      restartTimer: (id) => dispatch({ type: 'restart', id }),
      stopTimer: (id) => dispatch({ type: 'stop', id }),
      resumeTimer: (id) => dispatch({ type: 'resume', id }),
      reorderTimers: (from, to) => dispatch({ type: 'reorder', from, to }),
      setNotificationsEnabled: (id, enabled) =>
        dispatch({ type: 'setNotifications', id, enabled }),
      setCategory: (id, categoryId) => dispatch({ type: 'setCategory', id, categoryId }),
      setFormat: (id, format) => dispatch({ type: 'setFormat', id, format }),
      importTimers: (timers, mode) => dispatch({ type: 'import', timers, mode }),
      clearCategory: (categoryId) => dispatch({ type: 'clearCategory', categoryId }),
      clearRestarts: (id) => dispatch({ type: 'clearRestarts', id }),
       clearTimers: () => dispatch({ type: 'clear' }),
    }),
    [state.timers, state.hydrated]
  );

  return <TimersContext.Provider value={value}>{children}</TimersContext.Provider>;
}

export function useTimers(): TimersContextValue {
  const context = useContext(TimersContext);
  if (!context) {
    throw new Error('useTimers must be used inside a TimersProvider');
  }
  return context;
}

export function useTimer(id: string | undefined): Timer | undefined {
  const { timers } = useTimers();
  return timers.find((timer) => timer.id === id);
}
