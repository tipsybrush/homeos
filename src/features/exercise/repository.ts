import type { DateKey } from '@/core/dates';
import type { Db } from '@/core/db/types';

export async function markWorkoutDone(db: Db, date: DateKey, routineId: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO workout_logs (date, routine_id, created_at) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET routine_id = excluded.routine_id',
    date,
    routineId,
    new Date().toISOString(),
  );
}

export async function unmarkWorkout(db: Db, date: DateKey): Promise<void> {
  await db.runAsync('DELETE FROM workout_logs WHERE date = ?', date);
}

export async function listWorkoutDates(db: Db, from: DateKey, to: DateKey): Promise<DateKey[]> {
  const rows = await db.getAllAsync<{ date: string }>('SELECT date FROM workout_logs WHERE date BETWEEN ? AND ? ORDER BY date', from, to);
  return rows.map((r) => r.date);
}
