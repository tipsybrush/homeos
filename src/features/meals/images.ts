import { MEDIA } from './guides/media';

const COMMONS = 'https://commons.wikimedia.org/wiki';

/**
 * Real photo for a recipe, or null. Photos are Wikimedia Commons files (never AI-generated),
 * fetched by the phone at the given width. Until a photo exists, meals show a category tile.
 */
export function recipePhoto(recipeId: string | null, width = 640): { uri: string } | null {
  const file = recipeId ? MEDIA[recipeId]?.photo : null;
  return file ? { uri: `${COMMONS}/Special:FilePath/${encodeURIComponent(file)}?width=${width}` } : null;
}

/** Commons page with the photographer and licence for a recipe's photo. */
export function photoCreditUrl(recipeId: string): string | null {
  const file = MEDIA[recipeId]?.photo;
  return file ? `${COMMONS}/File:${encodeURIComponent(file)}` : null;
}

export function recipeVideo(recipeId: string): { id: string; title: string } | null {
  const m = MEDIA[recipeId];
  return m?.videoId ? { id: m.videoId, title: m.videoTitle ?? 'How to make it' } : null;
}
