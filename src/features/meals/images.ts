import type { ImageSourcePropType } from 'react-native';

/**
 * Real photos for each recipe, keyed by recipe id. Add one line per photo:
 *   rcp_jollof: require('../../../assets/recipes/rcp_jollof.jpg'),
 * Use photos you took or openly licensed photos with credit. Never AI-generated.
 * Until a photo is added, the meal shows a category tile instead.
 */
const PHOTOS: Record<string, ImageSourcePropType> = {};

export function recipePhoto(recipeId: string | null): ImageSourcePropType | null {
  return recipeId ? (PHOTOS[recipeId] ?? null) : null;
}
