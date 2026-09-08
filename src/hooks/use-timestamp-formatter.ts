import { useCallback } from 'react';

import { useSettings } from '@/store/settings-context';
import { formatTimestamp } from '@/utils/elapsed';

/**
 * `formatTimestamp` with the user's clock and date-order preferences already
 * applied, so screens only have to decide whether they want seconds.
 */
export function useTimestampFormatter(): (iso: string, withSeconds?: boolean) => string {
  const { settings } = useSettings();
  const { clockFormat, dateOrder } = settings;

  return useCallback(
    (iso: string, withSeconds = true) =>
      formatTimestamp(iso, { withSeconds, clockFormat, dateOrder }),
    [clockFormat, dateOrder]
  );
}
