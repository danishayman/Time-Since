/// <reference types="jest" />

import {
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  DAYS_PER_YEAR,
  formatDuration,
  normalizeFormat,
} from '@/utils/format-duration';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = DAYS_PER_WEEK * DAY;
const MONTH = DAYS_PER_MONTH * DAY;
const YEAR = DAYS_PER_YEAR * DAY;

describe('formatDuration', () => {
  describe('a single unit', () => {
    it('renders zero', () => {
      expect(formatDuration(0, ['days', 'time'])).toBe('0d 00:00:00');
    });

    it('lets hours run past a day when days are not selected', () => {
      expect(formatDuration(2 * DAY + 3 * HOUR, ['time'])).toBe('51:00:00');
    });

    it('counts whole days only when days are the only unit', () => {
      expect(formatDuration(20 * DAY + 23 * HOUR, ['days'])).toBe('20d');
    });

    it('truncates sub-second remainders rather than rounding up', () => {
      expect(formatDuration(SECOND + 999, ['days', 'time'])).toBe('0d 00:00:01');
    });
  });

  describe('several units', () => {
    it('passes the remainder down from each unit to the next', () => {
      expect(formatDuration(20 * DAY, ['weeks', 'days'])).toBe('2w 6d');
    });

    it('renders every unit at once', () => {
      const ms = YEAR + 2 * MONTH + 3 * WEEK + 4 * DAY + 5 * HOUR + 6 * MINUTE + 7 * SECOND;
      expect(formatDuration(ms, ['years', 'months', 'weeks', 'days', 'time'])).toBe(
        '1y 2mo 3w 4d 05:06:07'
      );
    });

    it('renders units largest first however they were picked', () => {
      expect(formatDuration(20 * DAY, ['days', 'weeks'])).toBe('2w 6d');
    });

    it('zero-pads hours, minutes and seconds', () => {
      expect(formatDuration(3 * HOUR + 4 * MINUTE + 5 * SECOND, ['days', 'time'])).toBe(
        '0d 03:04:05'
      );
    });

    it('rolls over to the next day exactly at the boundary', () => {
      expect(formatDuration(DAY - SECOND, ['days', 'time'])).toBe('0d 23:59:59');
      expect(formatDuration(DAY, ['days', 'time'])).toBe('1d 00:00:00');
    });
  });

  describe('empty units', () => {
    it('renders a selected unit that is still zero rather than dropping it', () => {
      expect(formatDuration(19 * DAY + 3 * HOUR, ['years', 'days', 'time'])).toBe(
        '0y 19d 03:00:00'
      );
    });

    it('fills the unit in once it has a value', () => {
      expect(formatDuration(YEAR + 19 * DAY + 3 * HOUR, ['years', 'days', 'time'])).toBe(
        '1y 19d 03:00:00'
      );
    });

    it('renders every selected unit for a duration of zero', () => {
      expect(formatDuration(0, ['years', 'months', 'weeks', 'days'])).toBe('0y 0mo 0w 0d');
    });
  });

  describe('countdowns', () => {
    it('ignores the sign of a negative duration', () => {
      expect(formatDuration(-(19 * DAY + 3 * HOUR), ['days', 'time'])).toBe('19d 03:00:00');
    });

    it('formats a negative duration the same as a positive one', () => {
      expect(formatDuration(-(2 * YEAR + 10 * DAY), ['years', 'days'])).toBe('2y 10d');
    });
  });
});

describe('normalizeFormat', () => {
  it('maps the formats that predated multi-select', () => {
    expect(normalizeFormat('auto')).toEqual(['days', 'time']);
    expect(normalizeFormat('days-time')).toEqual(['days', 'time']);
    expect(normalizeFormat('years-days')).toEqual(['years', 'days']);
  });

  it('sorts a selection largest first', () => {
    expect(normalizeFormat(['time', 'years', 'days'])).toEqual(['years', 'days', 'time']);
  });

  it('drops unknown units', () => {
    expect(normalizeFormat(['days', 'fortnights'])).toEqual(['days']);
  });

  it('removes duplicates', () => {
    expect(normalizeFormat(['days', 'days', 'time'])).toEqual(['days', 'time']);
  });

  it('falls back to the default rather than returning nothing', () => {
    expect(normalizeFormat([])).toEqual(['days', 'time']);
    expect(normalizeFormat(undefined)).toEqual(['days', 'time']);
    expect(normalizeFormat('nonsense')).toEqual(['days', 'time']);
  });
});
