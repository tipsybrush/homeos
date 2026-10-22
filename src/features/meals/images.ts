import { MEDIA } from './guides/media';

const COMMONS = 'https://commons.wikimedia.org/wiki';

/**
 * Wikimedia serves (and caches) thumbnails at set widths and rate-limits other sizes,
 * which is why some photos failed to load. Always ask for one of these.
 */
const STANDARD_WIDTHS = [120, 250, 330, 500, 960, 1280] as const;
const HEADERS = { 'User-Agent': 'HomeOS/1.0 (personal home app; https://github.com/tipsybrush/homeos)' };

export function standardWidth(width: number): number {
  return STANDARD_WIDTHS.find((w) => w >= width) ?? 1280;
}

/**
 * Real photo for a recipe, or null. Photos are Wikimedia Commons files (never AI-generated),
 * fetched by the phone at the given width. Until a photo exists, meals show a category tile.
 */
export function recipePhoto(recipeId: string | null, width = 500): { uri: string; headers: typeof HEADERS } | null {
  const file = recipeId ? MEDIA[recipeId]?.photo : null;
  return file ? { uri: `${COMMONS}/Special:FilePath/${encodeURIComponent(file)}?width=${standardWidth(width)}`, headers: HEADERS } : null;
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
