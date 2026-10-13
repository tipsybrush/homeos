/** @jest-environment node */
import { weekOf } from '@/core/dates';
import { LATEST_VERSION, migrate } from '@/core/db/migrations';
import { createTestDb } from '@/test/nodeDb';

import { routineForDate, weekProgress } from '../logic';
import { listWorkoutDates, markWorkoutDone, unmarkWorkout } from '../repository';

describe('exercise', () => {
  it('follows the weekly plan with rest days', () => {
    expect(routineForDate('2026-10-12')?.id).toBe('strength-a'); // Monday
    expect(routineForDate('2026-10-11')).toBeNull(); // Sunday
    const week = weekOf('2026-10-13');
    expect(weekProgress(week, new Set(['2026-10-12', '2026-10-11'])).done).toBe(1);
  });

  it('logs one session per day and can undo it', async () => {
    const db = createTestDb();
    expect(await migrate(db)).toBe(LATEST_VERSION);
    await markWorkoutDone(db, '2026-10-12', 'strength-a');
    await markWorkoutDone(db, '2026-10-12', 'strength-a');
    expect(await listWorkoutDates(db, '2026-10-12', '2026-10-18')).toEqual(['2026-10-12']);
    await unmarkWorkout(db, '2026-10-12');
    expect(await listWorkoutDates(db, '2026-10-12', '2026-10-18')).toEqual([]);
    db.close();
  });
});
