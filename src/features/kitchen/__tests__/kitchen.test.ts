/** @jest-environment node */
import { migrate } from '@/core/db/migrations';
import { createMeal } from '@/features/meals/repository';
import { createTestDb } from '@/test/nodeDb';

import { buildShoppingList, type PlannedIngredient } from '../logic';
import { addSpend, listChecked, listPantry, listPlannedIngredients, listSpend, setChecked, setInPantry } from '../repository';

const ing = (name: string, quantity: number, unit = 'pcs', extra: Partial<PlannedIngredient> = {}): PlannedIngredient => ({
  name,
  category: 'vegetables',
  quantity,
  unit,
  optional: false,
  baseServings: 2,
  servings: 2,
  ...extra,
});

describe('shopping list', () => {
  it('sums the same item across meals, scales servings and skips optional and pantry items', () => {
    const list = buildShoppingList(
      [ing('Onion', 1), ing('onion ', 2, 'pcs', { servings: 4 }), ing('Honey', 1, 'tbsp', { optional: true }), ing('Salt', 1, 'tsp')],
      new Set(['salt']),
    );
    expect(list).toEqual([{ key: 'onion', name: 'Onion', category: 'vegetables', amounts: '5', meals: 2 }]);
  });

  it('reads planned recipe ingredients and stores pantry, checks and spend', async () => {
    const db = createTestDb();
    await migrate(db);
    await createMeal(db, {
      date: '2026-10-13',
      mealCategory: 'dinner',
      recipeId: 'rcp_jollof',
      customMealName: null,
      servings: 4,
      scheduledTime: null,
      status: 'planned',
      notes: '',
      estimatedCostKobo: null,
    });
    const planned = await listPlannedIngredients(db, '2026-10-12', '2026-10-18');
    expect(planned.some((p) => p.name === 'Tomatoes')).toBe(true);

    await setInPantry(db, 'Tomatoes', true);
    expect((await listPantry(db)).map((p) => p.key)).toEqual(['tomatoes']);
    const list = buildShoppingList(planned, new Set((await listPantry(db)).map((p) => p.key)));
    expect(list.some((l) => l.key === 'tomatoes')).toBe(false);

    await setChecked(db, '2026-10-12', 'onion', true);
    expect([...(await listChecked(db, '2026-10-12'))]).toEqual(['onion']);

    await addSpend(db, '2026-10-13', 1_250_000, 'Mile 12 market');
    expect(await listSpend(db, '2026-10-12', '2026-10-18')).toEqual([expect.objectContaining({ amountKobo: 1_250_000, note: 'Mile 12 market' })]);
    await expect(addSpend(db, '2026-10-13', 0, '')).rejects.toThrow();
    db.close();
  });
});
