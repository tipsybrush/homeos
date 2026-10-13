import type { DateKey } from '@/core/dates';
import { newId } from '@/core/db/ids';
import type { Db } from '@/core/db/types';

import { normalizeDraft } from './logic';
import type { MealDraft, MealPlanEntryView, MealStatus, Recipe, RecipeSummary } from './types';

type MealRow = {
  id: string;
  date: string;
  meal_category: string;
  recipe_id: string | null;
  custom_meal_name: string | null;
  servings: number;
  scheduled_time: string | null;
  status: MealStatus;
  notes: string;
  estimated_cost_kobo: number | null;
  created_at: string;
  updated_at: string;
  recipe_name: string | null;
};

const SELECT_MEALS = `
  SELECT m.*, r.name AS recipe_name
  FROM meal_plan_entries m
  LEFT JOIN recipes r ON r.id = m.recipe_id`;

function toView(row: MealRow): MealPlanEntryView {
  return {
    id: row.id,
    date: row.date,
    mealCategory: row.meal_category,
    recipeId: row.recipe_id,
    customMealName: row.custom_meal_name,
    servings: row.servings,
    scheduledTime: row.scheduled_time,
    status: row.status,
    notes: row.notes,
    estimatedCostKobo: row.estimated_cost_kobo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    recipeName: row.recipe_name,
  };
}

export async function listMealsForDate(db: Db, date: DateKey): Promise<MealPlanEntryView[]> {
  const rows = await db.getAllAsync<MealRow>(`${SELECT_MEALS} WHERE m.date = ? ORDER BY m.created_at`, date);
  return rows.map(toView);
}

export async function listMealsInRange(db: Db, from: DateKey, to: DateKey): Promise<MealPlanEntryView[]> {
  const rows = await db.getAllAsync<MealRow>(`${SELECT_MEALS} WHERE m.date BETWEEN ? AND ? ORDER BY m.date, m.created_at`, from, to);
  return rows.map(toView);
}

export async function getMeal(db: Db, id: string): Promise<MealPlanEntryView | null> {
  const row = await db.getFirstAsync<MealRow>(`${SELECT_MEALS} WHERE m.id = ?`, id);
  return row ? toView(row) : null;
}

export async function createMeal(db: Db, draft: MealDraft): Promise<string> {
  const d = normalizeDraft(draft);
  const id = newId('meal');
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO meal_plan_entries
      (id, date, meal_category, recipe_id, custom_meal_name, servings, scheduled_time, status, notes, estimated_cost_kobo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    d.date,
    d.mealCategory,
    d.recipeId,
    d.customMealName,
    d.servings,
    d.scheduledTime,
    d.status,
    d.notes,
    d.estimatedCostKobo,
    now,
    now,
  );
  return id;
}

export async function updateMeal(db: Db, id: string, draft: MealDraft): Promise<void> {
  const d = normalizeDraft(draft);
  const result = await db.runAsync(
    `UPDATE meal_plan_entries SET
       date = ?, meal_category = ?, recipe_id = ?, custom_meal_name = ?, servings = ?,
       scheduled_time = ?, status = ?, notes = ?, estimated_cost_kobo = ?, updated_at = ?
     WHERE id = ?`,
    d.date,
    d.mealCategory,
    d.recipeId,
    d.customMealName,
    d.servings,
    d.scheduledTime,
    d.status,
    d.notes,
    d.estimatedCostKobo,
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) throw new Error('That meal no longer exists.');
}

export async function setMealStatus(db: Db, id: string, status: MealStatus): Promise<void> {
  await db.runAsync('UPDATE meal_plan_entries SET status = ?, updated_at = ? WHERE id = ?', status, new Date().toISOString(), id);
}

export async function deleteMeal(db: Db, id: string): Promise<void> {
  await db.runAsync('DELETE FROM meal_plan_entries WHERE id = ?', id);
}

/** Copies a meal to another date as a fresh, planned entry. */
export async function duplicateMeal(db: Db, id: string, toDate: DateKey): Promise<string> {
  const source = await getMeal(db, id);
  if (!source) throw new Error('That meal no longer exists.');
  return createMeal(db, {
    date: toDate,
    mealCategory: source.mealCategory,
    recipeId: source.recipeId,
    customMealName: source.customMealName,
    servings: source.servings,
    scheduledTime: source.scheduledTime,
    status: 'planned',
    notes: source.notes,
    estimatedCostKobo: source.estimatedCostKobo,
  });
}

type RecipeRow = {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  prep_minutes: number;
  cook_minutes: number;
  base_servings: number;
  tags: string;
  meal_categories: string;
  instructions: string;
  source: string | null;
};

function parseList<T = string>(json: string): T[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function toSummary(r: RecipeRow): RecipeSummary {
  const tags = parseList(r.tags);
  return {
    id: r.id,
    kind: tags.includes('special') ? 'special' : 'everyday',
    name: r.name,
    description: r.description,
    cuisine: r.cuisine,
    prepMinutes: r.prep_minutes,
    cookMinutes: r.cook_minutes,
    baseServings: r.base_servings,
    tags,
    mealCategories: parseList(r.meal_categories),
  };
}

export async function listRecipes(db: Db): Promise<RecipeSummary[]> {
  const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes ORDER BY name COLLATE NOCASE');
  return rows.map(toSummary);
}

export async function getRecipe(db: Db, id: string): Promise<Recipe | null> {
  const r = await db.getFirstAsync<RecipeRow>('SELECT * FROM recipes WHERE id = ?', id);
  if (!r) return null;
  const lines = await db.getAllAsync<{
    ingredient_id: string;
    name: string;
    quantity: number;
    unit: string;
    optional: number;
    preparation_note: string | null;
  }>(
    `SELECT ri.ingredient_id, i.name, ri.quantity, ri.unit, ri.optional, ri.preparation_note
     FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = ? ORDER BY ri.rowid`,
    id,
  );
  return {
    ...toSummary(r),
    instructions: r.instructions ? r.instructions.split('\n') : [],
    source: r.source,
    ingredients: lines.map((l) => ({
      ingredientId: l.ingredient_id,
      name: l.name,
      quantity: l.quantity,
      unit: l.unit,
      optional: l.optional === 1,
      preparationNote: l.preparation_note,
    })),
  };
}
