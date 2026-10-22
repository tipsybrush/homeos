import { weekday, type DateKey } from '@/core/dates';

import type { WardrobeCategory, WardrobeItem } from './logic';
import { LOOK_PHOTOS } from './lookPhotos';

/**
 * A style look for each day (Timi, 2026-10-22): weekdays are office looks that are
 * trendy, mature and corporate with a splash of fun; Saturday is a party look and
 * Sunday is church. Built on Timi's taste: earthy base, relaxed tailoring, one
 * accent, loafers. Breathable fabrics for Lagos heat. Two weeks rotate so it doesn't repeat.
 */
export type Piece = { category: WardrobeCategory; item: string; colour: string; hex: string };
export type Look = {
  occasion: 'Office' | 'Party' | 'Church';
  name: string;
  vibe: string;
  pieces: Piece[];
  /** The fun part. */
  twist: string;
  /** Search words for real photo inspiration. */
  inspiration: string;
};

const p = (category: WardrobeCategory, item: string, colour: string, hex: string): Piece => ({ category, item, colour, hex });

// Index 0 = Sunday.
const WEEK_A: Look[] = [
  {
    occasion: 'Church',
    name: 'Sunday sharp',
    vibe: 'Respectful and polished, light enough for a long service.',
    pieces: [
      p('outerwear', 'Unstructured linen blazer', 'navy', '#1F2A44'),
      p('top', 'Crisp Oxford shirt', 'white', '#F4F2EC'),
      p('bottom', 'Pleated trousers', 'cream', '#E8DFC9'),
      p('shoes', 'Penny loafers', 'brown', '#5C3A21'),
    ],
    twist: 'A silk pocket square in rust or burgundy.',
    inspiration: 'men navy linen blazer cream trousers loafers church outfit',
  },
  {
    occasion: 'Office',
    name: 'Monday reset',
    vibe: 'Clean, confident and easy: start the week looking put together.',
    pieces: [
      p('top', 'Knit polo', 'cream', '#EDE3CF'),
      p('bottom', 'Pleated trousers', 'chocolate brown', '#4A2F1D'),
      p('shoes', 'Suede loafers', 'tan', '#A47148'),
      p('accessory', 'Leather watch', 'brown', '#6B4226'),
    ],
    twist: 'Tonal browns with the knit polo tucked in reads quietly expensive.',
    inspiration: 'men cream knit polo brown pleated trousers loafers office',
  },
  {
    occasion: 'Office',
    name: 'Tie, loosened',
    vibe: 'Corporate on paper, relaxed in spirit.',
    pieces: [
      p('top', 'Light blue Oxford shirt', 'light blue', '#BFD3E6'),
      p('accessory', 'Knit tie', 'burgundy', '#6E1F2B'),
      p('bottom', 'Straight trousers', 'stone', '#CFC6B2'),
      p('shoes', 'Derby shoes', 'dark brown', '#3E2618'),
    ],
    twist: 'Wear the knit tie slightly loose with sleeves rolled twice.',
    inspiration: 'men oxford shirt knit tie stone trousers smart casual',
  },
  {
    occasion: 'Office',
    name: 'Workwear, upgraded',
    vibe: 'Creative-office energy: structured but not stiff.',
    pieces: [
      p('outerwear', 'Chore jacket (for the air-con)', 'olive', '#5B5E3A'),
      p('top', 'Fine-knit tee', 'ecru', '#EFE7D6'),
      p('bottom', 'Pleated trousers', 'charcoal', '#3A3A3C'),
      p('shoes', 'Loafers', 'black', '#1C1C1E'),
    ],
    twist: 'Olive and charcoal is unexpected but grown-up.',
    inspiration: 'men olive chore jacket ecru tee charcoal trousers loafers',
  },
  {
    occasion: 'Office',
    name: 'Print with purpose',
    vibe: 'One bold piece, everything else calm.',
    pieces: [
      p('top', 'Camp-collar shirt, subtle print', 'rust and cream', '#9C4A2C'),
      p('bottom', 'Relaxed trousers', 'navy', '#22304A'),
      p('shoes', 'Suede loafers', 'brown', '#6B4226'),
      p('accessory', 'Tortoiseshell glasses', 'tortoise', '#7A5230'),
    ],
    twist: 'A camp collar over tailored trousers: mature, with personality.',
    inspiration: 'men camp collar printed shirt navy tailored trousers loafers',
  },
  {
    occasion: 'Office',
    name: 'Friday smart-casual',
    vibe: 'End-of-week ease that still works for a client call.',
    pieces: [
      p('outerwear', 'Unstructured blazer', 'tan', '#B08A5F'),
      p('top', 'Striped knit tee', 'navy and cream', '#2B3550'),
      p('bottom', 'Straight jeans', 'mid-wash', '#5D7393'),
      p('shoes', 'Retro sneakers', 'white and green', '#F2F2EE'),
    ],
    twist: 'Blazer over a striped knit with clean retro sneakers.',
    inspiration: 'men tan blazer striped tee jeans retro sneakers friday',
  },
  {
    occasion: 'Party',
    name: 'Saturday night out',
    vibe: 'Relaxed and cool, made for dancing in the heat.',
    pieces: [
      p('top', 'Cuban-collar shirt, open neck', 'black', '#111111'),
      p('bottom', 'Pleated trousers', 'cream', '#E8DFC9'),
      p('shoes', 'Loafers, no socks', 'black', '#1C1C1E'),
      p('accessory', 'Gold chain and sunglasses', 'gold', '#C9A24B'),
    ],
    twist: 'Black and cream with a little gold: simple and sharp.',
    inspiration: 'men black cuban collar shirt cream trousers loafers party',
  },
];

const WEEK_B: Look[] = [
  {
    occasion: 'Church',
    name: 'Earth-tone Sunday',
    vibe: 'Warm and dignified.',
    pieces: [
      p('top', 'Long-sleeve linen shirt', 'sand', '#D8C7A6'),
      p('bottom', 'Tailored trousers', 'brown', '#5C3A21'),
      p('shoes', 'Tassel loafers', 'dark brown', '#3E2618'),
      p('accessory', 'Woven belt', 'tan', '#A47148'),
    ],
    twist: 'Sleeves buttoned and a matching belt: small details, big polish.',
    inspiration: 'men sand linen shirt brown trousers tassel loafers sunday',
  },
  {
    occasion: 'Office',
    name: 'Quarter-zip Monday',
    vibe: 'Smart layering for a cold office.',
    pieces: [
      p('top', 'Light quarter-zip knit over a tee', 'oatmeal', '#D9CDB4'),
      p('bottom', 'Pleated trousers', 'grey', '#7D7D80'),
      p('shoes', 'Loafers', 'brown', '#5C3A21'),
      p('accessory', 'Leather tote', 'tan', '#A47148'),
    ],
    twist: 'Oatmeal and grey is soft and modern.',
    inspiration: 'men oatmeal quarter zip grey pleated trousers loafers',
  },
  {
    occasion: 'Office',
    name: 'Tonal navy',
    vibe: 'All-navy depth: serious, with style.',
    pieces: [
      p('top', 'Knit polo', 'navy', '#22304A'),
      p('bottom', 'Tailored trousers', 'navy', '#1F2A44'),
      p('shoes', 'Suede loafers', 'tan', '#A47148'),
      p('accessory', 'Watch with a coloured strap', 'orange', '#D9792B'),
    ],
    twist: 'Tan suede and a coloured watch strap break up the navy.',
    inspiration: 'men tonal navy knit polo trousers tan suede loafers',
  },
  {
    occasion: 'Office',
    name: 'Harrington Wednesday',
    vibe: 'Classic British cool for the commute.',
    pieces: [
      p('outerwear', 'Harrington jacket (morning and evening)', 'cream', '#E8DFC9'),
      p('top', 'Oxford shirt', 'white', '#F4F2EC'),
      p('bottom', 'Straight trousers', 'olive', '#5B5E3A'),
      p('shoes', 'Derby shoes', 'brown', '#5C3A21'),
    ],
    twist: 'A cream Harrington is a statement without shouting.',
    inspiration: 'men cream harrington jacket white oxford olive trousers',
  },
  {
    occasion: 'Office',
    name: 'Stripe and suede',
    vibe: 'Preppy, a little playful.',
    pieces: [
      p('top', 'Bold-stripe shirt', 'cream and brown', '#C7A27C'),
      p('bottom', 'Pleated trousers', 'dark brown', '#3E2618'),
      p('shoes', 'Suede loafers', 'brown', '#6B4226'),
      p('accessory', 'Tortoiseshell glasses', 'tortoise', '#7A5230'),
    ],
    twist: 'Bold stripes on a calm brown base.',
    inspiration: 'men bold stripe shirt brown pleated trousers suede loafers',
  },
  {
    occasion: 'Office',
    name: 'Overshirt Friday',
    vibe: 'Weekend-ready by 5pm.',
    pieces: [
      p('outerwear', 'Light overshirt', 'rust', '#9C4A2C'),
      p('top', 'Plain tee', 'white', '#F4F2EC'),
      p('bottom', 'Straight jeans', 'light wash', '#9BB0C8'),
      p('shoes', 'Retro sneakers', 'white', '#F2F2EE'),
    ],
    twist: 'Rust is the fun colour: everything else stays neutral.',
    inspiration: 'men rust overshirt white tee light jeans sneakers',
  },
  {
    occasion: 'Party',
    name: 'Monochrome party',
    vibe: 'Effortless and bold.',
    pieces: [
      p('top', 'Knit polo', 'chocolate', '#4A2F1D'),
      p('bottom', 'Pleated trousers', 'chocolate', '#4A2F1D'),
      p('shoes', 'Loafers', 'black', '#1C1C1E'),
      p('accessory', 'Sunglasses and a ring', 'gold', '#C9A24B'),
    ],
    twist: 'Head-to-toe chocolate looks deliberate and rich.',
    inspiration: 'men monochrome brown knit polo trousers party outfit',
  },
];

export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Every look, for browsing. */
export const ALL_LOOKS: (Look & { id: string })[] = [...WEEK_A, ...WEEK_B].map((l) => ({ ...l, id: slug(l.name) }));

export const lookById = (id: string) => ALL_LOOKS.find((l) => l.id === id) ?? null;

/** Week A on even ISO-ish weeks, week B on odd, so looks rotate. */
export function lookFor(date: DateKey): Look & { id: string } {
  const t = Date.parse(`${date}T12:00:00Z`);
  const week = Math.floor((t / 86400000 + 3) / 7);
  const look = (week % 2 === 0 ? WEEK_A : WEEK_B)[weekday(date)]!;
  return { ...look, id: slug(look.name) };
}

/** Owned item that could stand in for a piece: same category and a shared colour word. */
export function ownedMatch(piece: Piece, items: WardrobeItem[]): WardrobeItem | null {
  const words = piece.colour.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && w !== 'and');
  return (
    items.find((i) => i.category === piece.category && i.colour && words.some((w) => i.colour!.toLowerCase().includes(w))) ?? null
  );
}

/** Real photos (Pexels, free licence) for a look. */
export function lookPhotos(id: string): { uri: string; page: string }[] {
  return (LOOK_PHOTOS[id] ?? []).map((pid) => ({
    uri: `https://images.pexels.com/photos/${pid}/pexels-photo-${pid}.jpeg?auto=compress&cs=tinysrgb&w=800`,
    page: `https://www.pexels.com/photo/${pid}/`,
  }));
}

export const inspirationUrl = (look: Look) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(look.inspiration)}`;
