import type { Timer } from '@/types/timer';
import { globalReorderIndices, sortTimers } from '@/utils/sort-timers';

const NOW = Date.parse('2024-06-01T00:00:00.000Z');

function timer(overrides: Partial<Timer> & { id: string }): Timer {
  return {
    label: overrides.id,
    color: '#BDE3FA',
    startDateTime: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    isRunning: true,
    runningSince: '2024-01-01T00:00:00.000Z',
    accumulatedMs: 0,
    order: 0,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId: null,
    ...overrides,
  };
}

const a = timer({
  id: 'a',
  label: 'Banana',
  createdAt: '2024-03-01T00:00:00.000Z',
  runningSince: '2024-05-01T00:00:00.000Z',
  order: 0,
});
const b = timer({
  id: 'b',
  label: 'apple',
  createdAt: '2024-01-01T00:00:00.000Z',
  runningSince: '2024-02-01T00:00:00.000Z',
  order: 1,
});
const c = timer({
  id: 'c',
  label: 'Cherry',
  createdAt: '2024-05-01T00:00:00.000Z',
  // Still in the future at NOW, so its elapsed value is negative.
  runningSince: '2024-06-20T00:00:00.000Z',
  order: 2,
});

const timers = [a, b, c];

describe('sortTimers', () => {
  it('leaves the manual order untouched', () => {
    expect(sortTimers(timers, 'manual', NOW)).toBe(timers);
  });

  it('sorts by creation date, newest first', () => {
    expect(sortTimers(timers, 'newest', NOW).map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts by creation date, oldest first', () => {
    expect(sortTimers(timers, 'oldest', NOW).map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by label, ignoring case', () => {
    expect(sortTimers(timers, 'label', NOW).map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by absolute elapsed time so countdowns are ranked by distance', () => {
    expect(sortTimers(timers, 'longest', NOW).map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });

  it('does not mutate the input array', () => {
    const input = [...timers];
    sortTimers(input, 'label', NOW);
    expect(input).toEqual(timers);
  });
});

describe('globalReorderIndices', () => {
  // Mirrors the reducer's `reorder` case, so the assertions below check the
  // arrangement the store would actually end up with.
  function applyMove(list: Timer[], from: number, to: number): Timer[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  const w1 = timer({ id: 'w1', order: 0 });
  const h1 = timer({ id: 'h1', order: 1 });
  const w2 = timer({ id: 'w2', order: 2 });
  const h2 = timer({ id: 'h2', order: 3 });
  const w3 = timer({ id: 'w3', order: 4 });
  const stored = [w1, h1, w2, h2, w3];
  const work = [w1, w2, w3];

  it('maps a move within a section onto stored positions', () => {
    expect(globalReorderIndices(stored, work, 0, 1)).toEqual({ from: 0, to: 2 });
  });

  it('reorders the section as dragged when the move is applied', () => {
    const indices = globalReorderIndices(stored, work, 0, 2)!;
    const next = applyMove(stored, indices.from, indices.to);
    expect(next.filter((t) => work.includes(t)).map((t) => t.id)).toEqual(['w2', 'w3', 'w1']);
  });

  it('leaves timers outside the section in the same relative order', () => {
    const indices = globalReorderIndices(stored, work, 2, 0)!;
    const next = applyMove(stored, indices.from, indices.to);
    expect(next.filter((t) => !work.includes(t)).map((t) => t.id)).toEqual(['h1', 'h2']);
  });

  it('returns null when an end of the drag cannot be located', () => {
    expect(globalReorderIndices(stored, work, 0, 9)).toBeNull();
    expect(globalReorderIndices([], work, 0, 1)).toBeNull();
  });
});
