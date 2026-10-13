import { addDays, weekOf, type DateKey } from '@/core/dates';
import { getSetting, setSetting } from '@/core/db/settings';
import type { Db } from '@/core/db/types';

import { createMeal, listMealsInRange, listRecipes } from './repository';
import { planWeek, weeklyPicks } from './variety';

const inFlight = new Set<string>();

/**
 * Fills the empty breakfast, lunch and dinner slots of a week, once. Meals
 * already in the week are never touched, and a week that was filled before is
 * left alone, so clearing a meal sticks. Returns true when meals were added.
 */
export async function autoFillWeek(db: Db, weekStart: DateKey, from: DateKey): Promise<boolean> {
  const key = `meals.autofilled.${weekStart}` as const;
  if (inFlight.has(key)) return false;
  inFlight.add(key);
  try {
    if (await getSetting(db, key)) return false;
    const days = weekOf(weekStart);
    const [recipes, history, existing] = await Promise.all([
      listRecipes(db),
      listMealsInRange(db, addDays(weekStart, -28), addDays(weekStart, -1)),
      listMealsInRange(db, days[0]!, days[6]!),
    ]);
    const picks = weeklyPicks(recipes, weekStart, history);
    const drafts = planWeek({ days, from, recipes, existing, history, picks, servings: 2 });
    await db.withTransactionAsync(async () => {
      for (const d of drafts) await createMeal(db, d);
      await setSetting(db, key, '1');
    });
    return drafts.length > 0;
  } finally {
    inFlight.delete(key);
  }
}
