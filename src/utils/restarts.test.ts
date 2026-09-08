/// <reference types="jest" />

import type { Restart, Timer } from '@/types/timer';
import { MAX_RESTARTS, appendRestart, restartStats } from '@/utils/restarts';

const NOW = Date.parse('2024-06-01T00:00:00.000Z');
const HOUR = 60 * 60 * 1000;

function timer(restarts: Restart[], runningSince: string | null = '2024-05-31T22:00:00.000Z'): Timer {
  return {
    id: 't',
    label: 'Timer',
    color: '#BDE3FA',
    startDateTime: '2024-05-31T22:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    isRunning: runningSince !== null,
    runningSince,
    accumulatedMs: 0,
    order: 0,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId: null,
    restarts,
  };
}

function restart(lastedMs: number): Restart {
  return { at: '2024-05-31T22:00:00.000Z', lastedMs };
}

describe('restartStats', () => {
  it('counts the restarts', () => {
    expect(restartStats(timer([restart(HOUR), restart(HOUR)]), NOW).count).toBe(2);
  });

  it('reports the current run from the clock', () => {
    // Running since two hours before NOW.
    expect(restartStats(timer([]), NOW).currentMs).toBe(2 * HOUR);
  });

  it('falls back to the current run when there is no history', () => {
    expect(restartStats(timer([]), NOW).longestMs).toBe(2 * HOUR);
  });

  it('picks the longest past run when it beats the current one', () => {
    expect(restartStats(timer([restart(HOUR), restart(9 * HOUR)]), NOW).longestMs).toBe(9 * HOUR);
  });

  it('lets the current run be the longest', () => {
    expect(restartStats(timer([restart(HOUR)]), NOW).longestMs).toBe(2 * HOUR);
  });

  it('ranks a countdown by how far away it was, not by its sign', () => {
    const stats = restartStats(timer([restart(-9 * HOUR)]), NOW);
    expect(stats.longestMs).toBe(-9 * HOUR);
  });

  it('uses the frozen value while a timer is stopped', () => {
    expect(restartStats(timer([], null), NOW).currentMs).toBe(0);
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
