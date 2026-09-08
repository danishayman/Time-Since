import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';

/** One heading's worth of the home list. A `null` category is the uncategorised bucket. */
export type CategorySection = {
  category: Category | null;
  timers: Timer[];
};

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

/**
 * Splits timers into one section per category, in category order, with the
 * uncategorised ones last. Empty sections are left out entirely, so a category
 * nothing has been filed under does not leave a bare heading on the list.
 *
 * The timers within each section keep the order they arrived in, so whatever
 * sorting the caller applied still holds.
 */
export function groupTimers(timers: Timer[], categories: Category[]): CategorySection[] {
  const sections: CategorySection[] = [];

  for (const category of categories) {
    const members = timers.filter((timer) => categoryOf(timer, categories)?.id === category.id);
    if (members.length > 0) {
      sections.push({ category, timers: members });
    }
  }

  const loose = timers.filter((timer) => !categoryOf(timer, categories));
  if (loose.length > 0) {
    sections.push({ category: null, timers: loose });
  }

  return sections;
}
