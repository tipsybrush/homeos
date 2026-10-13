/**
 * Rule-based outfits and "what to buy next" (no AI). Style follows Timi's
 * profile: earthy palette, relaxed tailoring, workwear jackets, caps and
 * loafers, with light fabrics for Lagos heat. No prices are suggested.
 */
export const WARDROBE_CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'headwear', 'accessory'] as const;
export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  colour: string | null;
  lightFabric: boolean;
};

export const CATEGORY_LABEL: Record<WardrobeCategory, string> = {
  top: 'Tops',
  bottom: 'Trousers & shorts',
  outerwear: 'Jackets',
  shoes: 'Shoes',
  headwear: 'Caps & hats',
  accessory: 'Accessories',
};

const EARTHY = ['olive', 'khaki', 'camel', 'tan', 'brown', 'rust', 'cream', 'beige', 'sand', 'stone', 'navy', 'white', 'black', 'grey', 'gray', 'green'];

export function isEarthy(colour: string | null): boolean {
  const c = colour?.toLowerCase() ?? '';
  return EARTHY.some((e) => c.includes(e));
}

function score(item: WardrobeItem): number {
  return (item.lightFabric ? 2 : 0) + (isEarthy(item.colour) ? 1 : 0);
}

export type Outfit = { top: WardrobeItem; bottom: WardrobeItem; shoes: WardrobeItem; headwear: WardrobeItem | null };

/**
 * Up to `count` outfits from owned clothes. Best-scoring pieces first, and each
 * outfit rotates to a different top (and bottom when possible) so suggestions differ.
 */
export function suggestOutfits(items: WardrobeItem[], count = 3): Outfit[] {
  const by = (c: WardrobeCategory) => items.filter((i) => i.category === c).sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  const tops = by('top');
  const bottoms = by('bottom');
  const shoes = by('shoes');
  const hats = by('headwear');
  if (!tops.length || !bottoms.length || !shoes.length) return [];
  const n = Math.min(count, tops.length);
  const out: Outfit[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      top: tops[i]!,
      bottom: bottoms[i % bottoms.length]!,
      shoes: shoes[i % shoes.length]!,
      headwear: hats.length ? hats[i % hats.length]! : null,
    });
  }
  return out;
}

const TARGETS: { category: WardrobeCategory; want: number; idea: string }[] = [
  { category: 'top', want: 4, idea: 'Light linen or cotton shirts in cream, olive or rust' },
  { category: 'bottom', want: 3, idea: 'Relaxed pleated trousers in khaki, brown or stone' },
  { category: 'shoes', want: 2, idea: 'Brown suede or leather loafers' },
  { category: 'outerwear', want: 1, idea: 'An unlined workwear or chore jacket for cooler evenings' },
  { category: 'headwear', want: 1, idea: 'A washed cotton cap in an earthy colour' },
];

export type BuySuggestion = { category: WardrobeCategory; have: number; want: number; idea: string };

/** Gaps against a small capsule wardrobe, biggest gap first. Missing core pieces block outfits, so they lead. */
export function buyNext(items: WardrobeItem[]): BuySuggestion[] {
  return TARGETS.map((t) => ({ ...t, have: items.filter((i) => i.category === t.category).length }))
    .filter((t) => t.have < t.want)
    .sort((a, b) => (a.have === 0 ? 0 : 1) - (b.have === 0 ? 0 : 1) || b.want - b.have - (a.want - a.have))
    .map(({ category, have, want, idea }) => ({ category, have, want, idea }));
}
