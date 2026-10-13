import { weekday, type DateKey } from '@/core/dates';

import { ROUTINES, WEEK_PLAN, type Routine } from './routines';

export function routineForDate(date: DateKey): Routine | null {
  const id = WEEK_PLAN[weekday(date)] ?? null;
  return ROUTINES.find((r) => r.id === id) ?? null;
}

/** Planned sessions in `days`, and how many of them were done. */
export function weekProgress(days: DateKey[], doneDates: Set<DateKey>): { planned: number; done: number } {
  const planned = days.filter((d) => routineForDate(d)).length;
  const done = days.filter((d) => routineForDate(d) && doneDates.has(d)).length;
  return { planned, done };
}
