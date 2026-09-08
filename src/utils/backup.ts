import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Category } from '@/types/category';
import type { Timer } from '@/types/timer';
import { normalizeFormat } from '@/utils/format-duration';

/** Bumped only if the shape of an exported timer ever changes incompatibly. */
const BACKUP_VERSION = 1;

type Backup = {
  version: number;
  exportedAt: string;
  timers: Timer[];
  /** Absent in files written before categories existed. */
  categories?: Category[];
};

/** What a backup file contains once it has been read and checked. */
export type BackupContents = {
  timers: Timer[];
  categories: Category[];
};

function isTimer(value: unknown): value is Timer {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.label === 'string' &&
    typeof t.color === 'string' &&
    typeof t.startDateTime === 'string' &&
    !Number.isNaN(Date.parse(t.startDateTime)) &&
    typeof t.createdAt === 'string' &&
    !Number.isNaN(Date.parse(t.createdAt)) &&
    typeof t.isRunning === 'boolean' &&
    (t.runningSince === null || typeof t.runningSince === 'string') &&
    typeof t.accumulatedMs === 'number' &&
    Number.isFinite(t.accumulatedMs) &&
    typeof t.order === 'number' &&
    typeof t.notificationsEnabled === 'boolean' &&
    (t.categoryId === null || t.categoryId === undefined || typeof t.categoryId === 'string') &&
    (t.restarts === undefined || Array.isArray(t.restarts))
    // `format` is not checked here: `normalizeFormat` accepts anything and
    // falls back to the default, including the single strings older builds
    // wrote.
  );
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.color === 'string' &&
    typeof c.order === 'number'
  );
}

export function buildBackup(timers: Timer[], categories: Category[]): string {
  const backup: Backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    timers,
    categories,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Reads a backup file back into timers and categories.
 *
 * The contents are arbitrary user-supplied JSON, so every row is checked rather
 * than cast — a single malformed entry would otherwise be persisted and crash
 * the list on the next launch. Throws with a message fit to show in an alert.
 *
 * A file written before categories existed has none, and its timers come back
 * uncategorised; a `categoryId` pointing at a category that is not in the file
 * resolves to uncategorised too, rather than being an error.
 */
export function parseBackup(raw: string): BackupContents {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Backup).timers)) {
    throw new Error('That file is not a Time Since backup.');
  }

  const { timers, categories = [] } = parsed as Backup;
  if (!timers.every(isTimer)) {
    throw new Error('That backup contains entries this version cannot read.');
  }
  if (!Array.isArray(categories) || !categories.every(isCategory)) {
    throw new Error('That backup contains categories this version cannot read.');
  }

  return {
    timers: timers.map((timer) => ({
      ...timer,
      format: normalizeFormat(timer.format),
      categoryId: timer.categoryId ?? null,
      restarts: Array.isArray(timer.restarts) ? timer.restarts : [],
    })),
    categories,
  };
}

/**
 * Rewrites a backup's ids so it can be merged alongside what is already stored.
 *
 * Categories get fresh ids for the same reason timers do — importing the same
 * file twice must not collide — and the timers' `categoryId`s are remapped
 * through the same table, or every merged timer would point at an id that is
 * not in the list and land in Uncategorised.
 */
export function reidentifyBackup({ timers, categories }: BackupContents): BackupContents {
  const idMap = new Map<string, string>();
  const nextCategories = categories.map((category) => {
    const id = Crypto.randomUUID();
    idMap.set(category.id, id);
    return { ...category, id };
  });

  return {
    categories: nextCategories,
    timers: timers.map((timer) => ({
      ...timer,
      id: Crypto.randomUUID(),
      categoryId: timer.categoryId ? (idMap.get(timer.categoryId) ?? null) : null,
    })),
  };
}

function backupFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `time-since-${date}.json`;
}

/**
 * Writes the backup to the cache directory and hands it to the share sheet.
 * Resolves `false` when the platform has no sharing UI (web, mainly).
 */
export async function exportTimers(timers: Timer[], categories: Category[]): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) {
    return false;
  }

  const file = new File(Paths.cache, backupFilename());
  // Overwrite so exporting twice on the same day does not throw.
  file.create({ overwrite: true });
  file.write(buildBackup(timers, categories));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Export timers',
  });

  return true;
}

/**
 * Prompts for a backup file and parses it. Resolves `null` when the user
 * dismisses the picker; throws when the chosen file cannot be read.
 */
export async function pickBackup(): Promise<BackupContents | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  return parseBackup(await new File(asset.uri).text());
}
