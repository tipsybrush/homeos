import { useEffect, useState } from 'react';

import { DEFAULT_TIMEZONE, localMinutes, todayKey, type DateKey } from '@/core/dates';

/**
 * Today's date key in the household timezone, re-evaluated every minute so
 * screens roll over at local midnight without an app restart.
 */
export function useToday(timeZone: string = DEFAULT_TIMEZONE): { today: DateKey; nowMinutes: number; now: Date } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return { today: todayKey(timeZone, now), nowMinutes: localMinutes(now, timeZone), now };
}
