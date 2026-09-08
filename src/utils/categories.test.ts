/// <reference types="jest" />

import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';
import { categoryOf, countByCategory, resolveFilter } from '@/utils/categories';

function category(id: string, name: string, order: number): Category {
  return { id, name, color: '#BDE3FA', order };
}

function timer(id: string, categoryId: string | null): Timer {
  return {
    id,
    label: id,
    color: '#BDE3FA',
    startDateTime: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    isRunning: true,
    runningSince: '2024-01-01T00:00:00.000Z',
    accumulatedMs: 0,
    order: 0,
    notificationsEnabled: false,
    format: ['days', 'time'],
    categoryId,
    restarts: [],
  };
}

const work = category('work', 'Work', 0);
const health = category('health', 'Health', 1);
const empty = category('empty', 'Empty', 2);
const categories = [work, health, empty];

const a = timer('a', 'work');
const b = timer('b', 'health');
const c = timer('c', null);
const orphan = timer('orphan', 'deleted-long-ago');

describe('categoryOf', () => {
  it('resolves an id to its category', () => {
    expect(categoryOf(a, categories)).toBe(work);
  });

  it('returns nothing for a timer with no category', () => {
    expect(categoryOf(c, categories)).toBeUndefined();
  });

  it('treats an id that no longer exists as uncategorised', () => {
    expect(categoryOf(orphan, categories)).toBeUndefined();
  });
});

describe('resolveFilter', () => {
  it('resolves a stored filter', () => {
    expect(resolveFilter('health', categories)).toBe(health);
  });

  it('falls back to all when the filter is null', () => {
    expect(resolveFilter(null, categories)).toBeUndefined();
  });

  it('falls back to all when the category has been deleted', () => {
    expect(resolveFilter('deleted-long-ago', categories)).toBeUndefined();
  });
});

describe('countByCategory', () => {
  it('counts timers per category, including empty ones', () => {
    expect(countByCategory([a, b, c, orphan], categories)).toEqual({
      work: 1,
      health: 1,
      empty: 0,
    });
  });
});
