/// <reference types="jest" />

import { timersReducer } from '@/store/timers-context';
import type { Timer, TimerDraft } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';

const mockNow = Date.parse('2026-06-01T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

// `mock` prefix: jest lets a hoisted factory read it.
jest.mock('@/utils/ticker', () => ({ currentTick: () => mockNow }));
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const OLD_START = new Date(mockNow - 10 * DAY).toISOString();

function timer(overrides: Partial<Timer> = {}): Timer {
  return {
    id: 't1',
    label: 'No Smoking',
    color: '#E5484D',
    startDateTime: OLD_START,
    createdAt: OLD_START,
    isRunning: true,
    runningSince: OLD_START,
    accumulatedMs: 0,
    order: 0,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId: null,
    restarts: [],
    ...overrides,
  };
}

function edit(current: Timer, draft: Partial<TimerDraft>): Timer {
  const state = { timers: [current], hydrated: true };
  const next = timersReducer(state, {
    type: 'update',
    id: current.id,
    draft: {
      label: current.label,
      color: current.color,
      startDateTime: current.startDateTime,
      categoryId: current.categoryId,
      ...draft,
    },
  });
  return next.timers[0];
}

describe('timersReducer update', () => {
  it('leaves the elapsed time alone when only the label changes', () => {
    const stopped = timer({ isRunning: false, runningSince: null, accumulatedMs: 3 * DAY });
    const next = edit(stopped, { label: '  Coffee  ' });
    expect(next.label).toBe('Coffee');
    expect(next.accumulatedMs).toBe(3 * DAY);
    expect(next.isRunning).toBe(false);
  });

  it('runs a running timer from the new date', () => {
    const newStart = new Date(mockNow - 2 * DAY).toISOString();
    const next = edit(timer(), { startDateTime: newStart });
    expect(next.isRunning).toBe(true);
    expect(next.runningSince).toBe(newStart);
    expect(signedElapsedMs(next, mockNow)).toBe(2 * DAY);
  });

  it('freezes a stopped timer at the time since the new date, not zero', () => {
    const stopped = timer({ isRunning: false, runningSince: null, accumulatedMs: 7 * DAY });
    const newStart = new Date(mockNow - 2 * DAY).toISOString();
    const next = edit(stopped, { startDateTime: newStart });
    expect(next.isRunning).toBe(false);
    expect(next.runningSince).toBeNull();
    expect(signedElapsedMs(next, mockNow)).toBe(2 * DAY);
    // Still frozen: the reading does not move as time passes.
    expect(signedElapsedMs(next, mockNow + DAY)).toBe(2 * DAY);
  });

  it('freezes a stopped timer moved to a future date as a countdown', () => {
    const stopped = timer({ isRunning: false, runningSince: null, accumulatedMs: 7 * DAY });
    const next = edit(stopped, { startDateTime: new Date(mockNow + DAY).toISOString() });
    expect(signedElapsedMs(next, mockNow)).toBe(-DAY);
  });
});
