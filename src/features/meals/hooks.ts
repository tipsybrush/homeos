import { useCallback, useEffect, useState } from 'react';

import { addDays, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';

import { autoFillWeek } from './autofill';
import { sortMeals } from './logic';
import { createMeal, listMealsForDate, listMealsInRange, listRecipes } from './repository';
import type { MealDraft, MealPlanEntryView, RecipeSummary } from './types';
import { planWeek, weeklyPicks } from './variety';

type Loadable<T> = { data: T; loading: boolean; error: string | null; reload: () => void };

function useLoad<T>(load: () => Promise<T>, initial: T, deps: unknown[]): Loadable<T> {
  const { version } = useDataVersion();
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    // Keep showing the previous data while reloading; `loading` is only true before the first load.
    load()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load data.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

export function useMealsForDate(date: DateKey): Loadable<MealPlanEntryView[]> {
  const db = useDb();
  return useLoad(async () => sortMeals(await listMealsForDate(db, date)), [], [db, date]);
}

export function useMealsInRange(from: DateKey, to: DateKey): Loadable<MealPlanEntryView[]> {
  const db = useDb();
  return useLoad(() => listMealsInRange(db, from, to), [], [db, from, to]);
}

export function useRecipes(): Loadable<RecipeSummary[]> {
  const db = useDb();
  return useLoad(() => listRecipes(db), [], [db]);
}

/**
 * This week's specials and a "plan my week" action that fills empty slots
 * (today onwards) with everyday dishes plus the specials.
 */
export function useWeeklyVariety(weekDays: DateKey[], from: DateKey) {
  const db = useDb();
  const { bump } = useDataVersion();
  const start = weekDays[0]!;
  const end = weekDays[6]!;
  const data = useLoad(
    async () => {
      const [recipes, history, existing] = await Promise.all([
        listRecipes(db),
        listMealsInRange(db, addDays(start, -28), addDays(start, -1)),
        listMealsInRange(db, start, end),
      ]);
      return { recipes, history, existing, picks: weeklyPicks(recipes, start, history) };
    },
    { recipes: [], history: [], existing: [], picks: [] } as {
      recipes: RecipeSummary[];
      history: MealPlanEntryView[];
      existing: MealPlanEntryView[];
      picks: RecipeSummary[];
    },
    [db, start, end],
  );

  const draftPlan = useCallback(
    () =>
      planWeek({
        days: weekDays,
        from,
        recipes: data.data.recipes,
        existing: data.data.existing,
        history: data.data.history,
        picks: data.data.picks,
        servings: 2,
      }),
    [data.data, weekDays, from],
  );

  const applyPlan = useCallback(
    async (drafts: MealDraft[]) => {
      await db.withTransactionAsync(async () => {
        for (const d of drafts) await createMeal(db, d);
      });
      bump();
    },
    [db, bump],
  );

  return { picks: data.data.picks, loading: data.loading, draftPlan, applyPlan };
}

/** Fills the week starting at `weekStart` once (see autoFillWeek) and refreshes the screen if meals were added. */
export function useAutoFillWeek(weekStart: DateKey, from: DateKey) {
  const db = useDb();
  const { bump } = useDataVersion();
  useEffect(() => {
    let live = true;
    autoFillWeek(db, weekStart, from)
      .then((added) => {
        if (added && live) bump();
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db, weekStart, from, bump]);
}
