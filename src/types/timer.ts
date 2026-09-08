/**
 * How a duration is rendered in the badge.
 * - `auto`: days + time under a year, years + days at or beyond one year.
 * - `days-time`: always `{days}d {HH}:{MM}:{SS}`.
 * - `years-days`: always `{years}y {days}d`.
 */
export type DisplayFormat = 'auto' | 'days-time' | 'years-days';

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
  format: DisplayFormat;
};

/** The fields a user can edit through the create/edit form. */
export type TimerDraft = Pick<Timer, 'label' | 'color' | 'startDateTime'>;
