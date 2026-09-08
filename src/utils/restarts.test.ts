/// <reference types="jest" />

import type { Restart } from '@/types/timer';
import { MAX_RESTARTS, appendRestart, longestRunMs } from '@/utils/restarts';

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
