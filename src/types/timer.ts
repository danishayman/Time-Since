/**
 * A unit a duration can be counted in. `time` is the clock component,
 * `{HH}:{MM}:{SS}`, and is always the smallest.
 */
export type DurationUnit = 'years' | 'months' | 'weeks' | 'days' | 'time';

/**
 * Which units a timer's badge is broken down into, largest first.
 *
 * Multi-select: picking `['weeks', 'days']` renders 20 days as `2w 6d`, while
 * `['days']` alone renders it as `20d`. Never empty — see `normalizeFormat`.
 */
export type TimerFormat = DurationUnit[];

/** Counting up from a past event, or down towards a future one. */
export type Direction = 'since' | 'until';

export type Timer = {
  id: string;
  label: string;
  /** Hex value taken from `PALETTE`. */
  color: string;
  /** ISO timestamp of the event itself — may be in the past or the future. */
  startDateTime: string;
  /** ISO timestamp of when the timer was created, shown in the detail footer. */
  createdAt: string;
  isRunning: boolean;
  /**
   * ISO timestamp marking the start of the current running segment, or `null`
   * while the timer is stopped. Together with `accumulatedMs` this makes the
   * elapsed value a pure function of stored timestamps, so it self-corrects
   * after the app has been backgrounded.
   */
  runningSince: string | null;
  /** Elapsed milliseconds frozen from previous running segments. */
  accumulatedMs: number;
  /** Manual sort position, lowest first. */
  order: number;
  notificationsEnabled: boolean;
  format: TimerFormat;
  /**
   * The category this timer is filed under, or `null` for none. An id that no
   * longer matches a stored category reads as uncategorised rather than being
   * cleaned up eagerly — see `categoryOf`.
   */
  categoryId: string | null;
};

/**
 * The fields a user can edit through the create/edit form.
 *
 * `format` is only read when creating a timer — it carries the default from
 * settings so the reducer never has to reach into the settings store. Editing
 * an existing timer leaves its format alone.
 */
export type TimerDraft = Pick<Timer, 'label' | 'color' | 'startDateTime' | 'categoryId'> & {
  format?: TimerFormat;
};
