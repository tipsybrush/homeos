/**
 * Pure meal-planning rules. No database or React here, so it is cheap to test
 * and safe to reuse from future modules (reminders, grocery lists).
 */
import { isDateKey, parseTime, timeToMinutes, type DateKey } from '@/core/dates';

import { MEAL_CATEGORIES, MEAL_STATUSES, type MealDraft, type MealPlanEntryView } from './types';

export const MAX_SERVINGS = 50;

export type DraftErrors = Partial<Record<'name' | 'servings' | 'scheduledTime' | 'date' | 'category' | 'cost' | 'status', string>>;

export function validateDraft(draft: MealDraft, rawTime?: string): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.recipeId && !draft.customMealName?.trim()) errors.name = 'Pick a recipe or type a meal name.';
  if (!Number.isInteger(draft.servings) || draft.servings < 1 || draft.servings > MAX_SERVINGS)
    errors.servings = `Servings must be a whole number from 1 to ${MAX_SERVINGS}.`;
  if (rawTime !== undefined && rawTime.trim() !== '' && parseTime(rawTime) === null)
    errors.scheduledTime = 'Use a 24-hour time like 07:30 or 19:00.';
  if (!isDateKey(draft.date)) errors.date = 'Invalid date.';
  if (!draft.mealCategory.trim()) errors.category = 'Choose a meal type.';
  if (draft.estimatedCostKobo !== null && (!Number.isFinite(draft.estimatedCostKobo) || draft.estimatedCostKobo < 0))
    errors.cost = 'Enter an amount in naira, e.g. 2500.';
  if (!MEAL_STATUSES.includes(draft.status)) errors.status = 'Unknown status.';
  return errors;
}

export function normalizeDraft(draft: MealDraft): MealDraft {
  const custom = draft.customMealName?.trim() || null;
  return {
    ...draft,
    mealCategory: draft.mealCategory.trim().toLowerCase(),
    // A linked recipe wins; keep the custom name only when there is no recipe.
    customMealName: draft.recipeId ? null : custom,
    notes: draft.notes.trim(),
  };
}

/**
 * Accidental duplicate = same day, same meal type, same dish. Two different
 * dishes for dinner are allowed (people do eat rice and a side).
 */
export function findDuplicate(
  draft: Pick<MealDraft, 'date' | 'mealCategory' | 'recipeId' | 'customMealName'>,
  existing: Pick<MealPlanEntryView, 'id' | 'date' | 'mealCategory' | 'recipeId' | 'customMealName'>[],
  ignoreId?: string,
) {
  const name = draft.customMealName?.trim().toLowerCase() ?? null;
  return (
    existing.find(
      (e) =>
        e.id !== ignoreId &&
        e.date === draft.date &&
        e.mealCategory.toLowerCase() === draft.mealCategory.trim().toLowerCase() &&
        (draft.recipeId ? e.recipeId === draft.recipeId : !e.recipeId && (e.customMealName?.trim().toLowerCase() ?? null) === name),
    ) ?? null
  );
}

const CATEGORY_ORDER: Record<string, number> = Object.fromEntries(MEAL_CATEGORIES.map((c, i) => [c, i]));

/** Breakfast → lunch → dinner → snack → custom; within a category by time, then creation. */
export function sortMeals<T extends Pick<MealPlanEntryView, 'mealCategory' | 'scheduledTime' | 'createdAt'>>(meals: T[]): T[] {
  return [...meals].sort((a, b) => {
    const ca = CATEGORY_ORDER[a.mealCategory] ?? 99;
    const cb = CATEGORY_ORDER[b.mealCategory] ?? 99;
    if (ca !== cb) return ca - cb;
    const ta = a.scheduledTime ? timeToMinutes(a.scheduledTime) : Number.MAX_SAFE_INTEGER;
    const tb = b.scheduledTime ? timeToMinutes(b.scheduledTime) : Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** Seven consecutive days starting at `start`, each with its meals (possibly none). */
export function buildWeek<T extends Pick<MealPlanEntryView, 'date' | 'mealCategory' | 'scheduledTime' | 'createdAt'>>(
  days: DateKey[],
  meals: T[],
): { date: DateKey; meals: T[] }[] {
  return days.map((date) => ({ date, meals: sortMeals(meals.filter((m) => m.date === date)) }));
}

export function mealTitle(m: Pick<MealPlanEntryView, 'recipeName' | 'customMealName'>): string {
  return m.recipeName ?? m.customMealName ?? 'Untitled meal';
}

export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Meals still to come today with a set time, soonest first. Used for the
 * dashboard's reminders card. Completed and skipped meals are excluded.
 */
export function upcomingToday<T extends Pick<MealPlanEntryView, 'scheduledTime' | 'status'>>(meals: T[], nowMinutes: number): T[] {
  return meals
    .filter((m) => m.scheduledTime && (m.status === 'planned' || m.status === 'preparing') && timeToMinutes(m.scheduledTime) >= nowMinutes)
    .sort((a, b) => timeToMinutes(a.scheduledTime!) - timeToMinutes(b.scheduledTime!));
}

/** Ingredient quantity for `servings`, scaled from the recipe's base servings. */
export function scaleQuantity(quantity: number, baseServings: number, servings: number): number {
  if (baseServings <= 0) return quantity;
  return Math.round((quantity * servings * 100) / baseServings) / 100;
}
