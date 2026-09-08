import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Timer } from '@/types/timer';

const STORAGE_KEY = 'timesince.timers.v1';

/**
 * Reads persisted timers. A corrupt or unreadable payload resolves to an empty
 * list rather than throwing — losing the list is bad, but refusing to start is
 * worse, and the next mutation rewrites the key cleanly.
 */
export async function loadTimers(): Promise<Timer[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Timer[]) : [];
  } catch (error) {
    console.warn('[time-since] failed to load timers', error);
    return [];
  }
}

export async function saveTimers(timers: Timer[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch (error) {
    console.warn('[time-since] failed to save timers', error);
  }
}
