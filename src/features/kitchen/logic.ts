/**
 * Shopping list from the meal plan (no AI): every ingredient of the week's
 * planned recipes, scaled to each meal's servings, summed per item and unit,
 * minus optional extras and anything marked as in the pantry.
 */
import { scaleQuantity } from '@/features/meals/logic';

export type PlannedIngredient = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  optional: boolean;
  baseServings: number;
  servings: number;
};

export type ShoppingLine = { key: string; name: string; category: string; amounts: string; meals: number };

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Shopping-friendly amounts: whole grams and millilitres, pieces rounded up, spoons to the nearest half. */
export function formatAmount(quantity: number, unit: string): string {
  const rounded = unit === 'g' || unit === 'ml' ? Math.max(1, Math.round(quantity)) : unit === 'pcs' ? Math.ceil(quantity - 0.05) : Math.max(0.5, Math.round(quantity * 2) / 2);
  const q = String(rounded);
  return unit === 'pcs' ? q : `${q} ${unit}`;
}

export function buildShoppingList(items: PlannedIngredient[], pantry: Set<string>): ShoppingLine[] {
  const byKey = new Map<string, { name: string; category: string; units: Map<string, number>; meals: number }>();
  for (const it of items) {
    if (it.optional) continue;
    const key = normalizeName(it.name);
    if (pantry.has(key)) continue;
    const entry = byKey.get(key) ?? { name: it.name, category: it.category, units: new Map(), meals: 0 };
    entry.units.set(it.unit, (entry.units.get(it.unit) ?? 0) + scaleQuantity(it.quantity, it.baseServings, it.servings));
    entry.meals += 1;
    byKey.set(key, entry);
  }
  return [...byKey.entries()]
    .map(([key, e]) => ({
      key,
      name: e.name,
      category: e.category,
      amounts: [...e.units.entries()].map(([u, q]) => formatAmount(Math.round(q * 10) / 10, u)).join(' + '),
      meals: e.meals,
    }))
    .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || a.name.localeCompare(b.name));
}

export const CATEGORY_TITLES: Record<string, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruit',
  proteins: 'Meat, fish & eggs',
  grains: 'Grains, beans & tubers',
  dairy: 'Dairy',
  oils: 'Oils',
  condiments: 'Seasoning & stock',
};

/** Aisle order: fresh produce first, store-cupboard last. */
const CATEGORY_ORDER = ['vegetables', 'fruits', 'proteins', 'dairy', 'grains', 'oils', 'condiments'];

function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

export function categoryTitle(category: string): string {
  return CATEGORY_TITLES[category] ?? 'Other';
}
