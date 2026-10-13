import type { DateKey } from '@/core/dates';
import type { Kobo } from '@/core/money';

export const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type BuiltInMealCategory = (typeof MEAL_CATEGORIES)[number];
/** Built-in categories plus any custom label the user types. */
export type MealCategory = BuiltInMealCategory | (string & {});

export const MEAL_STATUSES = ['planned', 'preparing', 'completed', 'skipped'] as const;
export type MealStatus = (typeof MEAL_STATUSES)[number];

export type MealPlanEntry = {
  id: string;
  date: DateKey;
  mealCategory: MealCategory;
  recipeId: string | null;
  customMealName: string | null;
  servings: number;
  scheduledTime: string | null; // HH:MM local
  status: MealStatus;
  notes: string;
  estimatedCostKobo: Kobo | null;
  createdAt: string;
  updatedAt: string;
};

/** An entry joined with its recipe name for display. */
export type MealPlanEntryView = MealPlanEntry & { recipeName: string | null };

export type MealDraft = {
  date: DateKey;
  mealCategory: MealCategory;
  recipeId: string | null;
  customMealName: string | null;
  servings: number;
  scheduledTime: string | null;
  status: MealStatus;
  notes: string;
  estimatedCostKobo: Kobo | null;
};

export type RecipeSummary = {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  prepMinutes: number;
  cookMinutes: number;
  baseServings: number;
  tags: string[];
  mealCategories: BuiltInMealCategory[];
};

export type RecipeIngredientLine = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
  preparationNote: string | null;
};

export type Recipe = RecipeSummary & {
  instructions: string[];
  source: string | null;
  ingredients: RecipeIngredientLine[];
};
