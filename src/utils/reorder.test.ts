/// <reference types="jest" />

import type { Timer } from '@/types/timer';
import { globalReorderIndices } from '@/utils/reorder';

function timer(id: string, order: number): Timer {
  return {
    id,
    label: id,
    color: '#BDE3FA',
    startDateTime: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    isRunning: true,
    runningSince: '2024-01-01T00:00:00.000Z',
    accumulatedMs: 0,
    order,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId: null,
    restarts: [],
  };
}

describe('globalReorderIndices', () => {
  // Mirrors the reducer's `reorder` case, so the assertions below check the
  // arrangement the store would actually end up with.
  function applyMove(list: Timer[], from: number, to: number): Timer[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  const w1 = timer('w1', 0);
  const h1 = timer('h1', 1);
  const w2 = timer('w2', 2);
  const h2 = timer('h2', 3);
  const w3 = timer('w3', 4);
  const stored = [w1, h1, w2, h2, w3];
  const work = [w1, w2, w3];

  it('maps a move within a filtered run onto stored positions', () => {
    expect(globalReorderIndices(stored, work, 0, 1)).toEqual({ from: 0, to: 2 });
  });

  it('reorders the run as dragged when the move is applied', () => {
    const indices = globalReorderIndices(stored, work, 0, 2)!;
    const next = applyMove(stored, indices.from, indices.to);
    expect(next.filter((t) => work.includes(t)).map((t) => t.id)).toEqual(['w2', 'w3', 'w1']);
  });

  it('leaves timers outside the run in the same relative order', () => {
    const indices = globalReorderIndices(stored, work, 2, 0)!;
    const next = applyMove(stored, indices.from, indices.to);
    expect(next.filter((t) => !work.includes(t)).map((t) => t.id)).toEqual(['h1', 'h2']);
  });

  it('maps an unfiltered drag straight through', () => {
    expect(globalReorderIndices(stored, stored, 1, 3)).toEqual({ from: 1, to: 3 });
  });

  it('returns null when an end of the drag cannot be located', () => {
    expect(globalReorderIndices(stored, work, 0, 9)).toBeNull();
    expect(globalReorderIndices([], work, 0, 1)).toBeNull();
  });
});
