/**
 * Rule-based weekly variety (no AI). Timi's brief: mostly easy, everyday
 * Nigerian dishes, plus a few specials or new things to try each week, so
 * meals don't get repetitive.
 *
 * Everything here is deterministic for a given week, so the same week always
 * produces the same suggestions until the plan or history changes.
 */
import { addDays, weekday, type DateKey } from '@/core/dates';

import type { BuiltInMealCategory, MealDraft, RecipeSummary } from './types';

type PlannedMeal = { date: DateKey; mealCategory: string; recipeId: string | null };

export const PLANNED_SLOTS: BuiltInMealCategory[] = ['breakfast', 'lunch', 'dinner'];

/** Small seeded PRNG (mulberry32) so a week's picks are stable. */
function rng(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: string): T[] {
  const next = rng(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Most recent date each recipe was eaten or planned. */
function lastEaten(history: PlannedMeal[]): Map<string, DateKey> {
  const last = new Map<string, DateKey>();
  for (const m of history) {
    if (!m.recipeId) continue;
    const prev = last.get(m.recipeId);
    if (!prev || m.date > prev) last.set(m.recipeId, m.date);
  }
  return last;
}

function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86_400_000);
}

/**
 * This week's specials: one Nigerian delicacy and one new thing to try when
 * the library has both, skipping anything had in the last four weeks.
 */
export function weeklyPicks(recipes: RecipeSummary[], weekStart: DateKey, history: PlannedMeal[], count = 2): RecipeSummary[] {
  const specials = recipes.filter((r) => r.kind === 'special');
  const last = lastEaten(history);
  const fresh = specials.filter((r) => {
    const d = last.get(r.id);
    return !d || daysBetween(d, weekStart) > 28;
  });
  const pool = shuffled(fresh.length >= count ? fresh : specials, `picks:${weekStart}`);
  const isNew = (r: RecipeSummary) => r.tags.includes('try-new');
  const picks: RecipeSummary[] = [];
  const delicacy = pool.find((r) => !isNew(r));
  const novelty = pool.find((r) => isNew(r));
  if (delicacy) picks.push(delicacy);
  if (novelty && picks.length < count) picks.push(novelty);
  for (const r of pool) {
    if (picks.length >= count) break;
    if (!picks.includes(r)) picks.push(r);
  }
  return picks.slice(0, count);
}

type PlanInput = {
  /** The seven days of the week being planned. */
  days: DateKey[];
  /** Earliest day to fill (usually today); earlier days are left alone. */
  from: DateKey;
  recipes: RecipeSummary[];
  /** Meals already in this week; their slots are never touched. */
  existing: PlannedMeal[];
  /** Meals from recent weeks, to avoid repeating last week's dishes. */
  history: PlannedMeal[];
  picks: RecipeSummary[];
  servings: number;
};

/**
 * Drafts meals for every empty breakfast, lunch and dinner slot from `from`
 * to the end of the week. Specials go on weekend dinners first (more time to
 * cook); everyday dishes fill the rest without repeating a dish on
 * consecutive days, and preferring dishes not had recently.
 */
export function planWeek({ days, from, recipes, existing, history, picks, servings }: PlanInput): MealDraft[] {
  const open = days.filter((d) => d >= from);
  const taken = new Set(existing.map((m) => `${m.date}|${m.mealCategory}`));
  const planned: PlannedMeal[] = [...existing];
  const drafts: MealDraft[] = [];
  const recentLast = lastEaten([...history, ...existing]);
  const tiebreak = new Map(shuffled(recipes, `fill:${days[0]}`).map((r, i) => [r.id, i]));

  const add = (date: DateKey, mealCategory: BuiltInMealCategory, recipe: RecipeSummary) => {
    taken.add(`${date}|${mealCategory}`);
    planned.push({ date, mealCategory, recipeId: recipe.id });
    drafts.push({
      date,
      mealCategory,
      recipeId: recipe.id,
      customMealName: null,
      servings,
      scheduledTime: null,
      status: 'planned',
      notes: '',
      estimatedCostKobo: null,
    });
  };

  // 1. Specials: weekend first (Sat, Sun, Fri), then later in the week.
  const weekendRank = (d: DateKey) => ({ 6: 0, 0: 1, 5: 2 } as Record<number, number>)[weekday(d)] ?? 3;
  const specialDays = [...open].sort((a, b) => weekendRank(a) - weekendRank(b) || b.localeCompare(a));
  for (const pick of picks) {
    if (planned.some((m) => m.recipeId === pick.id)) continue; // already in the plan
    const slotOrder: BuiltInMealCategory[] = ['dinner', 'lunch', 'breakfast'];
    let placed = false;
    for (const day of specialDays) {
      if (planned.some((m) => m.date === day && picks.some((p) => p.id === m.recipeId))) continue; // one special per day
      for (const slot of slotOrder) {
        if (!pick.mealCategories.includes(slot) || taken.has(`${day}|${slot}`)) continue;
        add(day, slot, pick);
        placed = true;
        break;
      }
      if (placed) break;
    }
  }

  // 2. Everyday dishes for the remaining slots.
  const everyday = recipes.filter((r) => r.kind === 'everyday');
  for (const day of open) {
    for (const slot of PLANNED_SLOTS) {
      if (taken.has(`${day}|${slot}`)) continue;
      const candidates = everyday.filter((r) => r.mealCategories.includes(slot));
      if (candidates.length === 0) continue;
      const score = (r: RecipeSummary) => {
        const thisWeek = planned.filter((m) => m.recipeId === r.id).length;
        const neighbours = planned.some(
          (m) => m.recipeId === r.id && (m.date === day || m.date === addDays(day, -1) || m.date === addDays(day, 1)),
        );
        const last = recentLast.get(r.id);
        const since = last && last < days[0]! ? daysBetween(last, day) : 99;
        return (neighbours ? 1000 : 0) + thisWeek * 100 + Math.max(0, 30 - since) + (tiebreak.get(r.id) ?? 0) / 100;
      };
      const best = [...candidates].sort((a, b) => score(a) - score(b))[0]!;
      add(day, slot, best);
    }
  }
  return drafts;
}
