/**
 * Money is stored as integer kobo (1 NGN = 100 kobo) to avoid float drift.
 * Unknown prices are null and are never counted as zero.
 */

export type Kobo = number;

const formatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatNaira(kobo: Kobo | null | undefined): string {
  if (kobo == null) return 'Price not set';
  return formatter.format(Math.round(kobo / 100));
}

/** Parses "2,500", "₦2500", "2500.50" into kobo; returns null for blank, NaN for invalid. */
export function parseNairaInput(input: string): Kobo | null {
  const cleaned = input.replace(/[₦,\s]/g, '').replace(/^NGN/i, '');
  if (cleaned === '') return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return Number.NaN;
  return Math.round(Number(cleaned) * 100);
}
