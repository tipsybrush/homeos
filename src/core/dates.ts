/**
 * Local-date helpers. Meal plans are keyed by a calendar date string
 * (YYYY-MM-DD) in the household's timezone, never by a UTC timestamp, so a
 * meal planned for "Tuesday" stays on Tuesday regardless of device clock
 * quirks around midnight.
 */

export const DEFAULT_TIMEZONE = 'Africa/Lagos';

export type DateKey = string; // YYYY-MM-DD

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): value is DateKey {
  if (!DATE_KEY.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** The calendar date of `instant` in `timeZone`. */
export function toDateKey(instant: Date, timeZone: string = DEFAULT_TIMEZONE): DateKey {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function todayKey(timeZone: string = DEFAULT_TIMEZONE, now: Date = new Date()): DateKey {
  return toDateKey(now, timeZone);
}

/** Pure calendar arithmetic on a date key (timezone independent). */
export function addDays(key: DateKey, days: number): DateKey {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(key: DateKey): number {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Monday-start week containing `key`, as seven date keys. */
export function weekOf(key: DateKey): DateKey[] {
  const offset = (weekday(key) + 6) % 7; // days since Monday
  const monday = addDays(key, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortWeekday(key: DateKey): string {
  return WEEKDAYS_SHORT[weekday(key)]!;
}

export function dayOfMonth(key: DateKey): number {
  return Number(key.slice(8, 10));
}

/** e.g. "Tuesday, 13 Oct" */
export function formatLongDate(key: DateKey): string {
  const month = MONTHS_SHORT[Number(key.slice(5, 7)) - 1];
  return `${WEEKDAYS_LONG[weekday(key)]}, ${dayOfMonth(key)} ${month}`;
}

/** "Today", "Tomorrow", "Yesterday" or the long date. */
export function relativeDayLabel(key: DateKey, today: DateKey): string {
  if (key === today) return 'Today';
  if (key === addDays(today, 1)) return 'Tomorrow';
  if (key === addDays(today, -1)) return 'Yesterday';
  return formatLongDate(key);
}

/** Hour (0–23) of `instant` in `timeZone`. */
export function localHour(instant: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const h = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(instant);
  return Number(h);
}

/** Minutes since local midnight of `instant` in `timeZone`. */
export function localMinutes(instant: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
}

export function greetingFor(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Accepts "7:30", "07:30", "1930"; returns normalised "HH:MM" or null. */
export function parseTime(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  let candidate = s;
  if (/^\d{3,4}$/.test(s)) candidate = s.padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
  else if (/^\d:\d{2}$/.test(s)) candidate = '0' + s;
  return TIME.test(candidate) ? candidate : null;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}
