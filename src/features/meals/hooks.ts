import { useCallback, useEffect, useState } from 'react';

import type { DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';

import { sortMeals } from './logic';
import { listMealsForDate, listMealsInRange, listRecipes } from './repository';
import type { MealPlanEntryView, RecipeSummary } from './types';

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
