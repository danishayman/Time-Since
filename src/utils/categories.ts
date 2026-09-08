import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';

/**
 * The category a timer belongs to, or `undefined` when it has none — or when
 * the one it names no longer exists. Both cases render as uncategorised, which
 * is what keeps deleting a category from needing a cascade.
 */
export function categoryOf(timer: Timer, categories: Category[]): Category | undefined {
  if (!timer.categoryId) {
    return undefined;
  }
  return categories.find((category) => category.id === timer.categoryId);
}

/** Resolves a stored filter id, falling back to "all" when it no longer exists. */
export function resolveFilter(
  filter: string | null,
  categories: Category[]
): Category | undefined {
  if (!filter) {
    return undefined;
  }
  return categories.find((category) => category.id === filter);
}

/** How many timers sit in each category, keyed by category id. */
export function countByCategory(timers: Timer[], categories: Category[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of categories) {
    counts[category.id] = 0;
  }
  for (const timer of timers) {
    const category = categoryOf(timer, categories);
    if (category) {
      counts[category.id] += 1;
    }
  }
  return counts;
}
