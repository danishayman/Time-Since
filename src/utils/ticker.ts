import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * A single app-wide one-second clock.
 *
 * Every duration badge subscribes to this instead of owning an interval, and
 * because only the badges subscribe, a tick re-renders just the badge text —
 * the timer rows and the list itself never re-render on the clock.
 *
 * The interval runs only while there is at least one subscriber and the app is
 * foregrounded; returning from the background republishes the current time
 * immediately so the first painted frame is already correct.
 */

type Listener = () => void;

const TICK_MS = 1000;

const listeners = new Set<Listener>();
let interval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let snapshot = floorToSecond(Date.now());

function floorToSecond(ms: number): number {
  return ms - (ms % TICK_MS);
}

function publish() {
  const next = floorToSecond(Date.now());
  if (next === snapshot) {
    return;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function startInterval() {
  if (interval === null) {
    interval = setInterval(publish, TICK_MS);
  }
}

function stopInterval() {
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
  }
}

function handleAppStateChange(status: AppStateStatus) {
  if (status === 'active') {
    publish();
    startInterval();
  } else {
    stopInterval();
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    publish();
    startInterval();
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopInterval();
      appStateSubscription?.remove();
      appStateSubscription = null;
    }
  };
}

function getSnapshot(): number {
  return snapshot;
}

/** Current time in milliseconds, updated once per second. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
