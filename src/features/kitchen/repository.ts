import type { DateKey } from '@/core/dates';
import { newId } from '@/core/db/ids';
import type { Db } from '@/core/db/types';
import type { Kobo } from '@/core/money';

import { normalizeName, type PlannedIngredient } from './logic';

/** Ingredients of planned (not skipped) recipe meals from `from` to `to`. */
export async function listPlannedIngredients(db: Db, from: DateKey, to: DateKey): Promise<PlannedIngredient[]> {
  const rows = await db.getAllAsync<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    optional: number;
    base_servings: number;
    servings: number;
  }>(
    `SELECT i.name, i.category, ri.quantity, ri.unit, ri.optional, r.base_servings, m.servings
     FROM meal_plan_entries m
     JOIN recipes r ON r.id = m.recipe_id
     JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE m.date BETWEEN ? AND ? AND m.status != 'skipped'`,
    from,
    to,
  );
  return rows.map((r) => ({
    name: r.name,
    category: r.category,
    quantity: r.quantity,
    unit: r.unit,
    optional: r.optional === 1,
    baseServings: r.base_servings,
    servings: r.servings,
  }));
}

export async function listPantry(db: Db): Promise<{ key: string; name: string }[]> {
  const rows = await db.getAllAsync<{ normalized_name: string; name: string }>('SELECT normalized_name, name FROM pantry_items ORDER BY name');
  return rows.map((r) => ({ key: r.normalized_name, name: r.name }));
}

export async function setInPantry(db: Db, name: string, inPantry: boolean): Promise<void> {
  const key = normalizeName(name);
  if (!inPantry) {
    await db.runAsync('DELETE FROM pantry_items WHERE normalized_name = ?', key);
    return;
  }
  await db.runAsync(
    'INSERT INTO pantry_items (normalized_name, name, updated_at) VALUES (?, ?, ?) ON CONFLICT(normalized_name) DO UPDATE SET updated_at = excluded.updated_at',
    key,
    name.trim(),
    new Date().toISOString(),
  );
}

export async function listChecked(db: Db, weekStart: DateKey): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ normalized_name: string }>('SELECT normalized_name FROM shopping_checks WHERE week_start = ?', weekStart);
  return new Set(rows.map((r) => r.normalized_name));
}

export async function setChecked(db: Db, weekStart: DateKey, key: string, checked: boolean): Promise<void> {
  if (checked) await db.runAsync('INSERT OR IGNORE INTO shopping_checks (week_start, normalized_name) VALUES (?, ?)', weekStart, key);
  else await db.runAsync('DELETE FROM shopping_checks WHERE week_start = ? AND normalized_name = ?', weekStart, key);
}

export type SpendEntry = { id: string; date: DateKey; amountKobo: Kobo; note: string };

export async function addSpend(db: Db, date: DateKey, amountKobo: Kobo, note: string): Promise<void> {
  if (!Number.isFinite(amountKobo) || amountKobo <= 0) throw new Error('Enter an amount above ₦0.');
  await db.runAsync(
    'INSERT INTO grocery_spend (id, date, amount_kobo, note, created_at) VALUES (?, ?, ?, ?, ?)',
    newId('spd'),
    date,
    Math.round(amountKobo),
    note.trim(),
    new Date().toISOString(),
  );
}

export async function deleteSpend(db: Db, id: string): Promise<void> {
  await db.runAsync('DELETE FROM grocery_spend WHERE id = ?', id);
}

export async function listSpend(db: Db, from: DateKey, to: DateKey): Promise<SpendEntry[]> {
  const rows = await db.getAllAsync<{ id: string; date: string; amount_kobo: number; note: string }>(
    'SELECT id, date, amount_kobo, note FROM grocery_spend WHERE date BETWEEN ? AND ? ORDER BY date DESC, created_at DESC',
    from,
    to,
  );
  return rows.map((r) => ({ id: r.id, date: r.date, amountKobo: r.amount_kobo, note: r.note }));
}
