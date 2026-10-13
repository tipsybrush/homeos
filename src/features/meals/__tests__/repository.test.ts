/** @jest-environment node */
import { LATEST_VERSION, migrate } from '@/core/db/migrations';
import { createTestDb } from '@/test/nodeDb';

import { findDuplicate } from '../logic';
import {
  createMeal,
  deleteMeal,
  duplicateMeal,
  getMeal,
  getRecipe,
  listMealsForDate,
  listMealsInRange,
  listRecipes,
  setMealStatus,
  updateMeal,
} from '../repository';
import type { MealDraft } from '../types';

const base: MealDraft = {
  date: '2026-10-13',
  mealCategory: 'dinner',
  recipeId: 'rcp_jollof',
  customMealName: null,
  servings: 2,
  scheduledTime: '19:00',
  status: 'planned',
  notes: '',
  estimatedCostKobo: null,
};

async function setup() {
  const db = createTestDb();
  await migrate(db);
  return db;
}

describe('migrations', () => {
  it('creates the schema, seeds data, and is idempotent', async () => {
    const db = await setup();
    expect(await migrate(db)).toBe(LATEST_VERSION);
    const rooms = await db.getAllAsync('SELECT * FROM rooms');
    expect(rooms.length).toBeGreaterThanOrEqual(6);
    const recipes = await listRecipes(db);
    expect(recipes.map((r) => r.name)).toContain('Jollof Rice');
    // Running again must not duplicate seed rows.
    await migrate(db);
    expect((await listRecipes(db)).length).toBe(recipes.length);
  });

  it('shares ingredients across recipes instead of duplicating them', async () => {
    const db = await setup();
    const onions = await db.getAllAsync("SELECT * FROM ingredients WHERE normalized_name = 'onion'");
    expect(onions).toHaveLength(1);
  });
});

describe('meal plan repository', () => {
  it('creates, reads, updates and deletes a meal', async () => {
    const db = await setup();
    const id = await createMeal(db, base);
    let meal = await getMeal(db, id);
    expect(meal).toMatchObject({ recipeName: 'Jollof Rice', servings: 2, scheduledTime: '19:00', status: 'planned' });

    await updateMeal(db, id, { ...base, servings: 4, notes: '  extra pepper ' });
    meal = await getMeal(db, id);
    expect(meal?.servings).toBe(4);
    expect(meal?.notes).toBe('extra pepper');

    await deleteMeal(db, id);
    expect(await getMeal(db, id)).toBeNull();
  });

  it('supports a custom meal with no recipe', async () => {
    const db = await setup();
    const id = await createMeal(db, { ...base, recipeId: null, customMealName: 'Suya from Mallam', mealCategory: 'Snack' });
    const meal = await getMeal(db, id);
    expect(meal).toMatchObject({ recipeId: null, recipeName: null, customMealName: 'Suya from Mallam', mealCategory: 'snack' });
  });

  it('rejects a meal with neither recipe nor name at the database level', async () => {
    const db = await setup();
    await expect(createMeal(db, { ...base, recipeId: null, customMealName: '  ' })).rejects.toThrow();
  });

  it('lists by date and by range, keeping days separate', async () => {
    const db = await setup();
    await createMeal(db, base);
    await createMeal(db, { ...base, date: '2026-10-14', mealCategory: 'breakfast', recipeId: 'rcp_oats_banana' });
    await createMeal(db, { ...base, date: '2026-10-20' });
    expect(await listMealsForDate(db, '2026-10-13')).toHaveLength(1);
    expect(await listMealsInRange(db, '2026-10-12', '2026-10-18')).toHaveLength(2);
  });

  it('duplicates to another day as a fresh planned entry and reschedules', async () => {
    const db = await setup();
    const id = await createMeal(db, base);
    await setMealStatus(db, id, 'completed');
    const copyId = await duplicateMeal(db, id, '2026-10-15');
    const copy = await getMeal(db, copyId);
    expect(copy).toMatchObject({ date: '2026-10-15', status: 'planned', recipeId: 'rcp_jollof' });

    await updateMeal(db, copyId, { ...base, date: '2026-10-16' });
    expect((await getMeal(db, copyId))?.date).toBe('2026-10-16');
  });

  it('detects an accidental duplicate against stored meals', async () => {
    const db = await setup();
    await createMeal(db, base);
    const existing = await listMealsForDate(db, base.date);
    expect(findDuplicate(base, existing)).not.toBeNull();
    expect(findDuplicate({ ...base, recipeId: 'rcp_moi_moi' }, existing)).toBeNull();
  });

  it('returns recipe ingredients with quantities and units preserved', async () => {
    const db = await setup();
    const recipe = await getRecipe(db, 'rcp_yam_egg');
    expect(recipe?.ingredients).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Eggs', quantity: 3, unit: 'pcs', optional: false })]),
    );
    expect(recipe?.instructions.length).toBeGreaterThan(0);
  });
});
