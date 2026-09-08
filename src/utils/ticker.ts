import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * A single app-wide clock.
 *
 * Every duration badge subscribes to this instead of owning an interval, and
 * because only the badges subscribe, a tick re-renders just the badge text —
 * the timer rows and the list itself never re-render on the clock.
 *
 * The interval runs only while there is at least one subscriber and the app is
 * foregrounded; returning from the background republishes the current time
 * immediately so the first painted frame is already correct.
 *
 * The period is settable: with seconds hidden the badges only change once a
 * minute, so waking up every second would be sixty times the work for the same
 * pixels. See `setTickMs`.
 */

type Listener = () => void;

const DEFAULT_TICK_MS = 1000;

const listeners = new Set<Listener>();
let tickMs = DEFAULT_TICK_MS;
let interval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let snapshot = floorToTick(Date.now());

function floorToTick(ms: number): number {
  return ms - (ms % tickMs);
}

function publish() {
  const next = floorToTick(Date.now());
  if (next === snapshot) {
    return;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function startInterval() {
  if (interval === null) {
    interval = setInterval(publish, tickMs);
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

/**
 * Changes the clock's period. A running interval is restarted so the new period
 * takes effect immediately rather than after one more tick of the old one.
 */
export function setTickMs(ms: number): void {
  if (ms === tickMs) {
    return;
  }
  tickMs = ms;
  // Re-floor to the new period before republishing, or the first tick after a
  // coarser period is chosen would still carry second-level precision.
  snapshot = floorToTick(Date.now());
  listeners.forEach((listener) => listener());
  if (interval !== null) {
    stopInterval();
    startInterval();
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

/**
 * The clock's value as the badges currently have it, for code that must agree
 * with what is on screen rather than with the wall clock.
 *
 * `Date.now()` is always at least as late as this and can be a whole tick
 * ahead, because the interval is not aligned to second boundaries. Freezing a
 * timer against the wall clock therefore snaps the reading forward the moment
 * it stops, which is why stopping, resuming and restarting all read from here.
 */
export function currentTick(): number {
  return snapshot;
}

/** Current time in milliseconds, updated once per tick period. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Keeps the clock running and reads its current value, but never re-renders on
 * a tick — the subscription hands the interval a listener of its own instead of
 * React's, so the caller only sees a fresh value when it re-renders anyway.
 *
 * This is what the home list uses to order timers by elapsed time. Calling
 * `Date.now()` in a render body would be impure, and `useNow` would re-render
 * every row every second for an ordering that barely changes.
 */
export function useNowSnapshot(): number {
  return useSyncExternalStore(subscribeIdle, getSnapshot, getSnapshot);
}

function subscribeIdle(): () => void {
  return subscribe(() => {});
}
