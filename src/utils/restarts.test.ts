/// <reference types="jest" />

import type { Restart, Timer } from '@/types/timer';
import { signedElapsedMs } from '@/utils/elapsed';
import { MAX_RESTARTS, appendRestart, applyRestart, longestRunMs } from '@/utils/restarts';

const HOUR = 60 * 60 * 1000;

function restart(lastedMs: number): Restart {
  return { at: '2024-05-31T22:00:00.000Z', lastedMs };
}

describe('longestRunMs', () => {
  it('falls back to the current run when nothing has been logged', () => {
    expect(longestRunMs([], 2 * HOUR)).toBe(2 * HOUR);
  });

  it('picks the longest logged run when it beats the current one', () => {
    expect(longestRunMs([restart(HOUR), restart(9 * HOUR)], 2 * HOUR)).toBe(9 * HOUR);
  });

  it('lets the current run be the longest', () => {
    expect(longestRunMs([restart(HOUR)], 2 * HOUR)).toBe(2 * HOUR);
  });

  it('flips to the current run the moment it overtakes the record', () => {
    const log = [restart(3 * HOUR)];
    expect(longestRunMs(log, 3 * HOUR - 1)).toBe(3 * HOUR);
    expect(longestRunMs(log, 3 * HOUR + 1)).toBe(3 * HOUR + 1);
  });

  it('ranks a countdown by how far away it was, not by its sign', () => {
    expect(longestRunMs([restart(-9 * HOUR)], 2 * HOUR)).toBe(-9 * HOUR);
  });
});

describe('appendRestart', () => {
  it('adds the entry at the end, so the log stays oldest first', () => {
    const log = appendRestart([restart(1)], restart(2));
    expect(log.map((r) => r.lastedMs)).toEqual([1, 2]);
  });

  it('does not mutate the log it was given', () => {
    const original = [restart(1)];
    appendRestart(original, restart(2));
    expect(original).toHaveLength(1);
  });

  it('drops the oldest entry once the log is full', () => {
    const full = Array.from({ length: MAX_RESTARTS }, (_, i) => restart(i));
    const log = appendRestart(full, restart(9999));
    expect(log).toHaveLength(MAX_RESTARTS);
    expect(log[0].lastedMs).toBe(1);
    expect(log[log.length - 1].lastedMs).toBe(9999);
  });
});

describe('applyRestart', () => {
  const NOW = Date.parse('2024-06-01T12:00:00.000Z');

  function timer(overrides: Partial<Timer> = {}): Timer {
    return {
      id: 't1',
      label: 'Quit smoking',
      color: '#BDE3FA',
      startDateTime: '2024-06-01T10:00:00.000Z',
      createdAt: '2024-06-01T10:00:00.000Z',
      isRunning: true,
      runningSince: '2024-06-01T10:00:00.000Z',
      accumulatedMs: 0,
      order: 0,
      notificationsEnabled: false,
      format: ['days', 'time'],
      categoryId: null,
      restarts: [],
      ...overrides,
    };
  }

  it('rebases the timer on the instant it is given', () => {
    const restarted = applyRestart(timer(), NOW);
    expect(restarted.startDateTime).toBe('2024-06-01T12:00:00.000Z');
    expect(restarted.runningSince).toBe('2024-06-01T12:00:00.000Z');
    expect(restarted.accumulatedMs).toBe(0);
    expect(signedElapsedMs(restarted, NOW)).toBe(0);
  });

  it('logs how long the run that just ended lasted', () => {
    const restarted = applyRestart(timer(), NOW);
    expect(restarted.restarts).toEqual([
      { at: '2024-06-01T12:00:00.000Z', lastedMs: 2 * HOUR },
    ]);
  });

  it('resumes a stopped timer, because a restart is a fresh start', () => {
    const stopped = timer({ isRunning: false, runningSince: null, accumulatedMs: 5 * HOUR });
    const restarted = applyRestart(stopped, NOW);
    expect(restarted.isRunning).toBe(true);
    expect(restarted.restarts[0].lastedMs).toBe(5 * HOUR);
  });

  it('logs a countdown as the negative time that was left on it', () => {
    const countdown = timer({ runningSince: '2024-06-01T15:00:00.000Z' });
    expect(applyRestart(countdown, NOW).restarts[0].lastedMs).toBe(-3 * HOUR);
  });

  it('leaves everything the restart does not touch alone', () => {
    const restarted = applyRestart(timer({ label: 'Kept', order: 4 }), NOW);
    expect(restarted.label).toBe('Kept');
    expect(restarted.order).toBe(4);
    expect(restarted.color).toBe('#BDE3FA');
    expect(restarted.createdAt).toBe('2024-06-01T10:00:00.000Z');
  });

  it('caps the log the same way appendRestart does', () => {
    const full = timer({ restarts: Array.from({ length: MAX_RESTARTS }, () => restart(1)) });
    expect(applyRestart(full, NOW).restarts).toHaveLength(MAX_RESTARTS);
  });
});
