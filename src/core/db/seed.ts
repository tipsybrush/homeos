/**
 * Starter data. Rooms mirror the PRD's apartment; recipes are a modest,
 * editable mix of Nigerian and international dishes written for HomeOS
 * (original wording, not copied from any recipe source). Quantities are
 * typical home amounts, not nutrition advice.
 */

export const SEED_ROOMS = [
  { id: 'room_living', name: 'Living Room', icon: 'tv-outline', sortOrder: 0 },
  { id: 'room_master', name: 'Master Bedroom', icon: 'bed-outline', sortOrder: 1 },
  { id: 'room_second', name: 'Second Bedroom', icon: 'moon-outline', sortOrder: 2 },
  { id: 'room_kitchen', name: 'Kitchen', icon: 'restaurant-outline', sortOrder: 3 },
  { id: 'room_bathroom', name: 'Bathroom', icon: 'water-outline', sortOrder: 4 },
  { id: 'room_hallway', name: 'Hallway', icon: 'walk-outline', sortOrder: 5 },
] as const;

type SeedIngredient = {
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | 'pcs' | 'tbsp' | 'tsp' | 'cup';
  category: string;
  optional?: boolean;
  note?: string;
};

type SeedRecipe = {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  prepMinutes: number;
  cookMinutes: number;
  baseServings: number;
  tags: string[];
  mealCategories: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  ingredients: SeedIngredient[];
  instructions: string[];
};

export const SEED_RECIPES: SeedRecipe[] = [
  {
    id: 'rcp_jollof',
    name: 'Jollof Rice',
    description: 'Smoky tomato-pepper rice, the weekend staple.',
    cuisine: 'Nigerian',
    prepMinutes: 20,
    cookMinutes: 45,
    baseServings: 4,
    tags: ['rice', 'one-pot'],
    mealCategories: ['lunch', 'dinner'],
    ingredients: [
      { name: 'Long grain parboiled rice', quantity: 400, unit: 'g', category: 'grains' },
      { name: 'Tomatoes', quantity: 4, unit: 'pcs', category: 'vegetables' },
      { name: 'Red bell pepper (tatashe)', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Scotch bonnet (ata rodo)', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Onion', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Tomato paste', quantity: 2, unit: 'tbsp', category: 'condiments' },
      { name: 'Vegetable oil', quantity: 80, unit: 'ml', category: 'oils' },
      { name: 'Stock', quantity: 500, unit: 'ml', category: 'condiments' },
      { name: 'Bay leaves', quantity: 2, unit: 'pcs', category: 'condiments', optional: true },
    ],
    instructions: [
      'Blend tomatoes, peppers and one onion into a smooth base.',
      'Fry the second onion (sliced) in oil, add tomato paste and fry until it darkens slightly.',
      'Add the blended base and cook down until the oil rises to the top.',
      'Season, add stock and the washed rice; cover tightly and cook on low heat.',
      'Stir gently once or twice; finish on very low heat for the smoky bottom.',
    ],
  },
  {
    id: 'rcp_yam_egg',
    name: 'Boiled Yam & Egg Sauce',
    description: 'Quick, filling breakfast with a peppery egg sauce.',
    cuisine: 'Nigerian',
    prepMinutes: 10,
    cookMinutes: 20,
    baseServings: 2,
    tags: ['quick', 'eggs'],
    mealCategories: ['breakfast', 'lunch'],
    ingredients: [
      { name: 'Yam', quantity: 500, unit: 'g', category: 'grains' },
      { name: 'Eggs', quantity: 3, unit: 'pcs', category: 'proteins' },
      { name: 'Tomatoes', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Onion', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Scotch bonnet (ata rodo)', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Vegetable oil', quantity: 30, unit: 'ml', category: 'oils' },
    ],
    instructions: [
      'Peel and cut the yam, then boil in lightly salted water until tender.',
      'Sauté chopped onion, tomatoes and pepper in oil until soft.',
      'Pour in beaten eggs and stir gently until just set.',
      'Serve the sauce over the yam.',
    ],
  },
  {
    id: 'rcp_akara_pap',
    name: 'Akara & Pap',
    description: 'Crisp bean fritters with smooth pap.',
    cuisine: 'Nigerian',
    prepMinutes: 30,
    cookMinutes: 20,
    baseServings: 3,
    tags: ['beans', 'weekend'],
    mealCategories: ['breakfast'],
    ingredients: [
      { name: 'Peeled beans', quantity: 300, unit: 'g', category: 'grains', note: 'soaked and peeled' },
      { name: 'Onion', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Scotch bonnet (ata rodo)', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Vegetable oil', quantity: 500, unit: 'ml', category: 'oils', note: 'for frying' },
      { name: 'Pap (ogi)', quantity: 200, unit: 'g', category: 'grains' },
      { name: 'Milk', quantity: 100, unit: 'ml', category: 'dairy', optional: true },
    ],
    instructions: [
      'Blend the peeled beans with onion and pepper using very little water.',
      'Whisk the paste until light and airy, then season.',
      'Fry spoonfuls in hot oil until golden; drain.',
      'Loosen the pap with cold water, then stir in boiling water until it thickens. Add milk and sugar to taste.',
    ],
  },
  {
    id: 'rcp_efo_riro',
    name: 'Efo Riro with Rice',
    description: 'Rich spinach stew with peppers and protein.',
    cuisine: 'Nigerian',
    prepMinutes: 20,
    cookMinutes: 30,
    baseServings: 4,
    tags: ['vegetables', 'stew'],
    mealCategories: ['lunch', 'dinner'],
    ingredients: [
      { name: 'Spinach (efo)', quantity: 500, unit: 'g', category: 'vegetables' },
      { name: 'Red bell pepper (tatashe)', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Scotch bonnet (ata rodo)', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Onion', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Palm oil', quantity: 60, unit: 'ml', category: 'oils' },
      { name: 'Locust beans (iru)', quantity: 1, unit: 'tbsp', category: 'condiments', optional: true },
      { name: 'Assorted meat or fish', quantity: 500, unit: 'g', category: 'proteins' },
      { name: 'Long grain parboiled rice', quantity: 300, unit: 'g', category: 'grains' },
    ],
    instructions: [
      'Cook and season the meat or fish; keep the stock.',
      'Blend peppers and onion coarsely; fry in palm oil with iru until reduced.',
      'Add the protein and a little stock, then fold in the washed, squeezed spinach.',
      'Cook for 3–5 minutes so the greens stay bright. Serve with boiled rice.',
    ],
  },
  {
    id: 'rcp_moi_moi',
    name: 'Moi Moi',
    description: 'Steamed bean pudding, great for batch cooking.',
    cuisine: 'Nigerian',
    prepMinutes: 40,
    cookMinutes: 50,
    baseServings: 6,
    tags: ['beans', 'batch'],
    mealCategories: ['breakfast', 'lunch', 'snack'],
    ingredients: [
      { name: 'Peeled beans', quantity: 400, unit: 'g', category: 'grains', note: 'soaked and peeled' },
      { name: 'Red bell pepper (tatashe)', quantity: 2, unit: 'pcs', category: 'vegetables' },
      { name: 'Onion', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Vegetable oil', quantity: 80, unit: 'ml', category: 'oils' },
      { name: 'Eggs', quantity: 2, unit: 'pcs', category: 'proteins', optional: true },
      { name: 'Stock', quantity: 250, unit: 'ml', category: 'condiments' },
    ],
    instructions: [
      'Blend beans with pepper and onion until very smooth.',
      'Mix in oil, warm stock and seasoning to a pourable batter.',
      'Pour into bowls or wraps, add sliced egg if using, and steam until firm.',
    ],
  },
  {
    id: 'rcp_oats_banana',
    name: 'Oats with Banana',
    description: 'Five-minute breakfast for workdays.',
    cuisine: 'International',
    prepMinutes: 2,
    cookMinutes: 5,
    baseServings: 1,
    tags: ['quick', 'workday'],
    mealCategories: ['breakfast'],
    ingredients: [
      { name: 'Rolled oats', quantity: 60, unit: 'g', category: 'grains' },
      { name: 'Milk', quantity: 200, unit: 'ml', category: 'dairy' },
      { name: 'Banana', quantity: 1, unit: 'pcs', category: 'fruits' },
      { name: 'Honey', quantity: 1, unit: 'tbsp', category: 'condiments', optional: true },
    ],
    instructions: ['Simmer oats in milk for 4–5 minutes, stirring.', 'Top with sliced banana and honey.'],
  },
  {
    id: 'rcp_spag_bolognese',
    name: 'Spaghetti Bolognese',
    description: 'Weeknight pasta with a minced beef sauce.',
    cuisine: 'Italian',
    prepMinutes: 10,
    cookMinutes: 35,
    baseServings: 4,
    tags: ['pasta'],
    mealCategories: ['lunch', 'dinner'],
    ingredients: [
      { name: 'Spaghetti', quantity: 400, unit: 'g', category: 'grains' },
      { name: 'Minced beef', quantity: 400, unit: 'g', category: 'proteins' },
      { name: 'Tomatoes', quantity: 4, unit: 'pcs', category: 'vegetables' },
      { name: 'Onion', quantity: 1, unit: 'pcs', category: 'vegetables' },
      { name: 'Garlic', quantity: 3, unit: 'pcs', category: 'vegetables', note: 'cloves' },
      { name: 'Tomato paste', quantity: 1, unit: 'tbsp', category: 'condiments' },
      { name: 'Vegetable oil', quantity: 30, unit: 'ml', category: 'oils' },
    ],
    instructions: [
      'Brown the mince in a little oil; add onion and garlic.',
      'Stir in tomato paste and chopped tomatoes; simmer 20 minutes.',
      'Boil spaghetti until al dente and toss with the sauce.',
    ],
  },
  {
    id: 'rcp_chicken_stir_fry',
    name: 'Chicken Stir-Fry',
    description: 'Fast, high-heat chicken and vegetables.',
    cuisine: 'Asian',
    prepMinutes: 15,
    cookMinutes: 12,
    baseServings: 2,
    tags: ['quick', 'chicken'],
    mealCategories: ['lunch', 'dinner'],
    ingredients: [
      { name: 'Chicken breast', quantity: 300, unit: 'g', category: 'proteins' },
      { name: 'Mixed vegetables', quantity: 300, unit: 'g', category: 'vegetables' },
      { name: 'Soy sauce', quantity: 2, unit: 'tbsp', category: 'condiments' },
      { name: 'Garlic', quantity: 2, unit: 'pcs', category: 'vegetables', note: 'cloves' },
      { name: 'Vegetable oil', quantity: 20, unit: 'ml', category: 'oils' },
      { name: 'Long grain parboiled rice', quantity: 150, unit: 'g', category: 'grains', optional: true },
    ],
    instructions: [
      'Slice chicken thinly and season.',
      'Sear in a very hot pan, remove, then stir-fry garlic and vegetables.',
      'Return chicken, add soy sauce, toss and serve with rice if you like.',
    ],
  },
];
