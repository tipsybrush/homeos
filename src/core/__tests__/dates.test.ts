import { addDays, formatLongDate, isDateKey, parseTime, relativeDayLabel, toDateKey, weekOf } from '../dates';

describe('dates', () => {
  it('uses the household timezone, not UTC, at the day boundary', () => {
    // 23:30 UTC on 12 Oct is 00:30 on 13 Oct in Lagos (UTC+1).
    const instant = new Date('2026-10-12T23:30:00Z');
    expect(toDateKey(instant, 'Africa/Lagos')).toBe('2026-10-13');
    expect(toDateKey(instant, 'UTC')).toBe('2026-10-12');
  });

  it('does calendar arithmetic across month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('builds a Monday-start week', () => {
    const week = weekOf('2026-10-13'); // a Tuesday
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-10-12');
    expect(week[6]).toBe('2026-10-18');
    expect(weekOf('2026-10-18')[0]).toBe('2026-10-12'); // Sunday belongs to the same week
  });

  it('validates date keys strictly', () => {
    expect(isDateKey('2026-10-13')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('13/10/2026')).toBe(false);
  });

  it('parses friendly time input', () => {
    expect(parseTime('7:30')).toBe('07:30');
    expect(parseTime('1930')).toBe('19:30');
    expect(parseTime('19:30')).toBe('19:30');
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('noon')).toBeNull();
    expect(parseTime('')).toBeNull();
  });

  it('labels days relative to today', () => {
    expect(relativeDayLabel('2026-10-13', '2026-10-13')).toBe('Today');
    expect(relativeDayLabel('2026-10-14', '2026-10-13')).toBe('Tomorrow');
    expect(relativeDayLabel('2026-10-12', '2026-10-13')).toBe('Yesterday');
    expect(formatLongDate('2026-10-13')).toBe('Tuesday, 13 Oct');
  });
});
