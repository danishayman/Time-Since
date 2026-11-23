/// <reference types="jest" />

import { buildBackup, parseBackup } from '@/utils/backup';
import type { Timer } from '@/types/timer';

const START = '2026-01-01T00:00:00.000Z';

function timer(overrides: Partial<Timer> = {}): Timer {
  return {
    id: 't1',
    label: 'No Smoking',
    color: '#E5484D',
    startDateTime: START,
    createdAt: START,
    isRunning: true,
    runningSince: START,
    accumulatedMs: 0,
    order: 0,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId: null,
    restarts: [],
    ...overrides,
  };
}

describe('parseBackup', () => {
  it('reads back what buildBackup writes', () => {
    const { timers } = parseBackup(buildBackup([timer()], []));
    expect(timers).toHaveLength(1);
    expect(timers[0].runningSince).toBe(START);
  });

  it('accepts a stopped timer with no runningSince', () => {
    const raw = buildBackup([timer({ isRunning: false, runningSince: null })], []);
    expect(parseBackup(raw).timers[0].runningSince).toBeNull();
  });

  it('rejects a runningSince that is not a date, rather than showing NaN', () => {
    const raw = buildBackup([timer({ runningSince: 'yesterday-ish' })], []);
    expect(() => parseBackup(raw)).toThrow('cannot read');
  });

  it('rejects files that are not JSON', () => {
    expect(() => parseBackup('not json')).toThrow('not valid JSON');
  });
});
