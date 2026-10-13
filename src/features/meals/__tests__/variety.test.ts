/** @jest-environment node */
import { weekday, weekOf } from '@/core/dates';
import { migrate } from '@/core/db/migrations';
import { createTestDb } from '@/test/nodeDb';

import { listRecipes } from '../repository';
import type { RecipeSummary } from '../types';
import { planWeek, weeklyPicks } from '../variety';

let recipes: RecipeSummary[];

beforeAll(async () => {
  const db = createTestDb();
  await migrate(db);
  recipes = await listRecipes(db);
});

const week = weekOf('2026-10-12'); // Mon 12 – Sun 18 Oct

describe('recipe library', () => {
  it('is mostly everyday Nigerian dishes, with specials and new things to try', () => {
    const everyday = recipes.filter((r) => r.kind === 'everyday');
    const specials = recipes.filter((r) => r.kind === 'special');
    expect(everyday.filter((r) => r.cuisine === 'Nigerian').length).toBeGreaterThanOrEqual(12);
    expect(specials.length).toBeGreaterThanOrEqual(6);
    expect(specials.some((r) => r.tags.includes('try-new'))).toBe(true);
    expect(everyday.filter((r) => r.mealCategories.includes('breakfast')).length).toBeGreaterThanOrEqual(5);
  });
});

describe('weeklyPicks', () => {
  it('picks one delicacy and one new thing to try, stable for the week', () => {
    const picks = weeklyPicks(recipes, week[0]!, []);
    expect(picks).toHaveLength(2);
    expect(picks.every((r) => r.kind === 'special')).toBe(true);
    expect(picks.filter((r) => r.tags.includes('try-new'))).toHaveLength(1);
    expect(weeklyPicks(recipes, week[0]!, []).map((r) => r.id)).toEqual(picks.map((r) => r.id));
  });

  it('rotates across weeks and skips specials eaten recently', () => {
    const a = weeklyPicks(recipes, week[0]!, []);
    const history = a.map((r) => ({ date: '2026-10-10', mealCategory: 'dinner', recipeId: r.id }));
    const b = weeklyPicks(recipes, '2026-10-19', history);
    expect(b.some((r) => a.some((x) => x.id === r.id))).toBe(false);
  });
});

describe('planWeek', () => {
  let base: { days: string[]; from: string; recipes: RecipeSummary[]; existing: never[]; history: never[]; servings: number };
  beforeAll(() => {
    base = { days: week, from: week[0]!, recipes, existing: [], history: [], servings: 2 };
  });

  it('fills every breakfast, lunch and dinner with valid dishes', () => {
    const drafts = planWeek({ ...base, picks: weeklyPicks(recipes, week[0]!, []) });
    expect(drafts).toHaveLength(21);
    for (const d of drafts) {
      const r = recipes.find((x) => x.id === d.recipeId)!;
      expect(r.mealCategories).toContain(d.mealCategory);
      expect(d.status).toBe('planned');
    }
  });

  it('puts the weekly specials on the weekend and the rest is everyday food', () => {
    const picks = weeklyPicks(recipes, week[0]!, []);
    const drafts = planWeek({ ...base, picks });
    const specialDrafts = drafts.filter((d) => recipes.find((r) => r.id === d.recipeId)!.kind === 'special');
    expect(specialDrafts.map((d) => d.recipeId).sort()).toEqual(picks.map((p) => p.id).sort());
    for (const d of specialDrafts) expect([0, 5, 6]).toContain(weekday(d.date));
  });

  it('never serves the same dish on consecutive days', () => {
    const drafts = planWeek({ ...base, picks: weeklyPicks(recipes, week[0]!, []) });
    for (const d of drafts) {
      const clash = drafts.find(
        (o) => o !== d && o.recipeId === d.recipeId && Math.abs(Date.parse(o.date) - Date.parse(d.date)) <= 86_400_000,
      );
      expect(clash).toBeUndefined();
    }
  });

  it('keeps existing meals and past days untouched', () => {
    const existing = [{ date: week[3]!, mealCategory: 'dinner', recipeId: 'rcp_jollof' }];
    const drafts = planWeek({ ...base, from: week[2]!, existing, picks: [] });
    expect(drafts.some((d) => d.date < week[2]!)).toBe(false);
    expect(drafts.some((d) => d.date === week[3] && d.mealCategory === 'dinner')).toBe(false);
    expect(drafts).toHaveLength(5 * 3 - 1);
  });

  it('avoids last week’s dishes when it can', () => {
    const lastWeek = planWeek({ ...base, days: weekOf('2026-10-05'), from: '2026-10-05', picks: [] });
    const history = lastWeek.map((d) => ({ date: d.date, mealCategory: d.mealCategory, recipeId: d.recipeId }));
    const thisWeek = planWeek({ ...base, history, picks: [] });
    const lastMonday = new Set(lastWeek.filter((d) => d.date === '2026-10-11').map((d) => d.recipeId));
    const monday = thisWeek.filter((d) => d.date === week[0]).map((d) => d.recipeId);
    expect(monday.some((id) => lastMonday.has(id))).toBe(false);
  });
});
