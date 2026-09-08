import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Category } from '@/types/category';
import { DEFAULT_SETTINGS, type Settings } from '@/types/settings';
import type { Timer } from '@/types/timer';
import { normalizeFormat } from '@/utils/format-duration';

const TIMERS_KEY = 'timesince.timers.v1';
const SETTINGS_KEY = 'timesince.settings.v1';
const CATEGORIES_KEY = 'timesince.categories.v1';

/**
 * Reads persisted timers. A corrupt or unreadable payload resolves to an empty
 * list rather than throwing — losing the list is bad, but refusing to start is
 * worse, and the next mutation rewrites the key cleanly.
 */
export async function loadTimers(): Promise<Timer[]> {
  try {
    const raw = await AsyncStorage.getItem(TIMERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // `format` used to be a single string. `normalizeFormat` maps those onto
    // the equivalent unit selection, so an upgrade keeps every badge reading
    // the way its owner left it. `categoryId` predates categories entirely.
    return (parsed as Timer[]).map((timer) => ({
      ...timer,
      format: normalizeFormat(timer.format),
      categoryId: timer.categoryId ?? null,
      restarts: Array.isArray(timer.restarts) ? timer.restarts : [],
    }));
  } catch (error) {
    console.warn('[time-since] failed to load timers', error);
    return [];
  }
}

export async function saveTimers(timers: Timer[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  } catch (error) {
    console.warn('[time-since] failed to save timers', error);
  }
}

/**
 * Reads persisted settings, spread over the defaults rather than returned raw.
 * A payload written by an older build is missing whatever keys were added
 * since, and the merge fills those in instead of leaving them `undefined`.
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...(parsed as Partial<Settings>) };
  } catch (error) {
    console.warn('[time-since] failed to load settings', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[time-since] failed to save settings', error);
  }
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Category[]) : [];
  } catch (error) {
    console.warn('[time-since] failed to load categories', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.warn('[time-since] failed to save categories', error);
  }
}
