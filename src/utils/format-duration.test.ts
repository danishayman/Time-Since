/// <reference types="jest" />

import { DAYS_PER_YEAR, formatDuration } from '@/utils/format-duration';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = DAYS_PER_YEAR * DAY;

describe('formatDuration', () => {
  describe('auto format, under one year', () => {
    it('renders zero', () => {
      expect(formatDuration(0)).toBe('0d 00:00:00');
    });

    it('zero-pads hours, minutes and seconds', () => {
      expect(formatDuration(3 * HOUR + 4 * MINUTE + 5 * SECOND)).toBe('0d 03:04:05');
    });

    it('matches the reference example', () => {
      expect(formatDuration(19 * DAY + 3 * HOUR + 54 * MINUTE + 34 * SECOND)).toBe('19d 03:54:34');
    });

    it('does not pad the day count', () => {
      expect(formatDuration(412 * DAY, 'days-time')).toBe('412d 00:00:00');
    });

    it('truncates sub-second remainders rather than rounding up', () => {
      expect(formatDuration(1 * SECOND + 999)).toBe('0d 00:00:01');
    });

    it('rolls over to the next day exactly at the boundary', () => {
      expect(formatDuration(DAY - SECOND)).toBe('0d 23:59:59');
      expect(formatDuration(DAY)).toBe('1d 00:00:00');
    });
  });

  describe('auto format, one year and beyond', () => {
    it('stays on days + time on the last day before a year', () => {
      expect(formatDuration(YEAR - SECOND)).toBe('364d 23:59:59');
    });

    it('switches to years + days at exactly one year', () => {
      expect(formatDuration(YEAR)).toBe('1y 0d');
    });

    it('drops the time component and matches the reference example', () => {
      expect(formatDuration(23 * YEAR + 175 * DAY + 7 * HOUR)).toBe('23y 175d');
    });
  });

  describe('explicit format overrides', () => {
    it('forces days + time past a year', () => {
      expect(formatDuration(YEAR + 2 * HOUR, 'days-time')).toBe('365d 02:00:00');
    });

    it('forces years + days under a year', () => {
      expect(formatDuration(19 * DAY, 'years-days')).toBe('0y 19d');
    });
  });

  describe('countdowns', () => {
    it('ignores the sign of a negative duration', () => {
      expect(formatDuration(-(19 * DAY + 3 * HOUR))).toBe('19d 03:00:00');
    });

    it('formats a negative duration past a year the same as a positive one', () => {
      expect(formatDuration(-(2 * YEAR + 10 * DAY))).toBe('2y 10d');
    });
  });
});
