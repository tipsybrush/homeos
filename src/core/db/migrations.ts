import { SEED_RECIPES, SEED_ROOMS } from './seed';
import type { Db } from './types';

/**
 * Ordered schema migrations. The applied version lives in PRAGMA user_version.
 * Never edit a shipped migration: append a new one.
 */
type Migration = { version: number; name: string; up: (db: Db) => Promise<void> };

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial household schema',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE rooms (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          sort_order INTEGER NOT NULL
        );

        CREATE TABLE device_refs (
          entity_id TEXT PRIMARY KEY NOT NULL,
          room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
          display_name TEXT,
          pinned INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE ingredients (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          normalized_name TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL DEFAULT 'other',
          default_unit TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE recipes (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          cuisine TEXT NOT NULL,
          prep_minutes INTEGER NOT NULL DEFAULT 0,
          cook_minutes INTEGER NOT NULL DEFAULT 0,
          base_servings INTEGER NOT NULL DEFAULT 1,
          instructions TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '[]',
          meal_categories TEXT NOT NULL DEFAULT '[]',
          source TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE recipe_ingredients (
          id TEXT PRIMARY KEY NOT NULL,
          recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
          ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          optional INTEGER NOT NULL DEFAULT 0,
          preparation_note TEXT
        );
        CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

        CREATE TABLE meal_plan_entries (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          meal_category TEXT NOT NULL,
          recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
          custom_meal_name TEXT,
          servings INTEGER NOT NULL DEFAULT 1,
          scheduled_time TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          notes TEXT NOT NULL DEFAULT '',
          estimated_cost_kobo INTEGER,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (recipe_id IS NOT NULL OR custom_meal_name IS NOT NULL)
        );
        CREATE INDEX idx_meal_plan_date ON meal_plan_entries(date);
      `);
      await seed(db);
    },
  },
];

async function seed(db: Db) {
  for (const room of SEED_ROOMS) {
    await db.runAsync('INSERT INTO rooms (id, name, icon, sort_order) VALUES (?, ?, ?, ?)', room.id, room.name, room.icon, room.sortOrder);
  }
  const now = new Date().toISOString();
  const ingredientIds = new Map<string, string>();
  for (const recipe of SEED_RECIPES) {
    await db.runAsync(
      `INSERT INTO recipes (id, name, description, cuisine, prep_minutes, cook_minutes, base_servings, instructions, tags, meal_categories, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      recipe.id,
      recipe.name,
      recipe.description,
      recipe.cuisine,
      recipe.prepMinutes,
      recipe.cookMinutes,
      recipe.baseServings,
      recipe.instructions.join('\n'),
      JSON.stringify(recipe.tags),
      JSON.stringify(recipe.mealCategories),
      'HomeOS starter recipe (original)',
      now,
      now,
    );
    for (const [i, ing] of recipe.ingredients.entries()) {
      const normalized = ing.name.trim().toLowerCase();
      let ingredientId = ingredientIds.get(normalized);
      if (!ingredientId) {
        ingredientId = `ing_${normalized.replace(/[^a-z0-9]+/g, '_')}`;
        ingredientIds.set(normalized, ingredientId);
        await db.runAsync(
          `INSERT INTO ingredients (id, name, normalized_name, category, default_unit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ingredientId,
          ing.name,
          normalized,
          ing.category,
          ing.unit,
          now,
          now,
        );
      }
      await db.runAsync(
        `INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit, optional, preparation_note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        `${recipe.id}_${i}`,
        recipe.id,
        ingredientId,
        ing.quantity,
        ing.unit,
        ing.optional ? 1 : 0,
        ing.note ?? null,
      );
    }
  }
}

export const LATEST_VERSION = migrations[migrations.length - 1]!.version;

/** Applies any pending migrations, each in its own transaction. Safe to call on every launch. */
export async function migrate(db: Db): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;
  for (const m of migrations) {
    if (m.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await m.up(db);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
    });
    current = m.version;
  }
  return current;
}
