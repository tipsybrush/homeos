import { buildWeek, findDuplicate, normalizeDraft, scaleQuantity, sortMeals, upcomingToday, validateDraft } from '../logic';
import type { MealDraft } from '../types';

const draft: MealDraft = {
  date: '2026-10-13',
  mealCategory: 'dinner',
  recipeId: null,
  customMealName: 'Pepper soup',
  servings: 2,
  scheduledTime: null,
  status: 'planned',
  notes: '',
  estimatedCostKobo: null,
};

const meal = (o: Partial<{ id: string; date: string; mealCategory: string; recipeId: string | null; customMealName: string | null; scheduledTime: string | null; createdAt: string; status: 'planned' | 'completed' | 'skipped' | 'preparing' }>) => ({
  id: 'm',
  date: '2026-10-13',
  mealCategory: 'dinner',
  recipeId: null,
  customMealName: null,
  scheduledTime: null,
  createdAt: '2026-10-13T00:00:00Z',
  status: 'planned' as const,
  ...o,
});

describe('validateDraft', () => {
  it('accepts a custom meal without a recipe', () => {
    expect(validateDraft(draft)).toEqual({});
  });

  it('requires a recipe or a name', () => {
    expect(validateDraft({ ...draft, customMealName: '   ' }).name).toBeDefined();
  });

  it('bounds servings and checks time and cost', () => {
    expect(validateDraft({ ...draft, servings: 0 }).servings).toBeDefined();
    expect(validateDraft({ ...draft, servings: 2.5 }).servings).toBeDefined();
    expect(validateDraft(draft, '25:99').scheduledTime).toBeDefined();
    expect(validateDraft({ ...draft, estimatedCostKobo: Number.NaN }).cost).toBeDefined();
  });
});

describe('normalizeDraft', () => {
  it('drops the custom name when a recipe is linked and lowercases the category', () => {
    const n = normalizeDraft({ ...draft, recipeId: 'rcp_jollof', mealCategory: ' Dinner ' });
    expect(n.customMealName).toBeNull();
    expect(n.mealCategory).toBe('dinner');
  });
});

describe('findDuplicate', () => {
  it('flags the same dish in the same slot on the same day', () => {
    const existing = [meal({ id: 'a', customMealName: 'pepper soup' })];
    expect(findDuplicate(draft, existing)?.id).toBe('a');
  });

  it('allows a different dish, a different slot, or a different day', () => {
    const existing = [meal({ id: 'a', customMealName: 'Pepper soup' })];
    expect(findDuplicate({ ...draft, customMealName: 'Rice' }, existing)).toBeNull();
    expect(findDuplicate({ ...draft, mealCategory: 'lunch' }, existing)).toBeNull();
    expect(findDuplicate({ ...draft, date: '2026-10-14' }, existing)).toBeNull();
  });

  it('ignores the entry being edited', () => {
    const existing = [meal({ id: 'a', customMealName: 'Pepper soup' })];
    expect(findDuplicate(draft, existing, 'a')).toBeNull();
  });
});

describe('ordering and weeks', () => {
  it('orders breakfast, lunch, dinner, snack, then custom; by time inside a slot', () => {
    const sorted = sortMeals([
      meal({ id: 'custom', mealCategory: 'pre-workout' }),
      meal({ id: 'd2', mealCategory: 'dinner', scheduledTime: '20:00' }),
      meal({ id: 'd1', mealCategory: 'dinner', scheduledTime: '18:30' }),
      meal({ id: 'b', mealCategory: 'breakfast' }),
      meal({ id: 's', mealCategory: 'snack' }),
    ]);
    expect(sorted.map((m) => m.id)).toEqual(['b', 'd1', 'd2', 's', 'custom']);
  });

  it('builds seven days, including empty ones', () => {
    const days = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'];
    const week = buildWeek(days, [meal({ id: 'x', date: '2026-10-13' })]);
    expect(week).toHaveLength(7);
    expect(week[1]!.meals).toHaveLength(1);
    expect(week[0]!.meals).toHaveLength(0);
  });
});

describe('upcomingToday', () => {
  it('lists timed, unfinished meals from now on, soonest first', () => {
    const list = upcomingToday(
      [
        meal({ id: 'past', scheduledTime: '07:00' }),
        meal({ id: 'late', scheduledTime: '20:00' }),
        meal({ id: 'soon', scheduledTime: '13:00' }),
        meal({ id: 'done', scheduledTime: '14:00', status: 'completed' }),
        meal({ id: 'untimed' }),
      ],
      12 * 60,
    );
    expect(list.map((m) => m.id)).toEqual(['soon', 'late']);
  });
});

describe('scaleQuantity', () => {
  it('scales by servings without float noise', () => {
    expect(scaleQuantity(400, 4, 2)).toBe(200);
    expect(scaleQuantity(3, 2, 3)).toBe(4.5);
    expect(scaleQuantity(1, 3, 1)).toBe(0.33);
  });
});
