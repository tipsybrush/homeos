export type NewsItem = {
  title: string;
  link: string;
  source: string;
  /** ISO time, or null when the feed gives none. */
  published: string | null;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]!) : null;
}

/**
 * Reads the items of an RSS 2.0 feed. Small and forgiving on purpose: feeds differ,
 * and a bad item is skipped rather than failing the whole list.
 */
export function parseRss(xml: string, fallbackSource: string): NewsItem[] {
  const channelTitle = tag(xml.split(/<item[\s>]/i)[0] ?? '', 'title');
  const items: NewsItem[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const block = m[0];
    let title = tag(block, 'title');
    const link = tag(block, 'link') ?? tag(block, 'guid');
    if (!title || !link || !/^https?:\/\//.test(link)) continue;
    let source = tag(block, 'source') ?? '';
    // Google News puts the outlet at the end of the title: "Headline - Outlet".
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    if (!source) source = fallbackSource || channelTitle || '';
    const date = tag(block, 'pubDate') ?? tag(block, 'dc:date');
    const time = date ? Date.parse(date) : NaN;
    items.push({ title, link, source, published: Number.isNaN(time) ? null : new Date(time).toISOString() });
  }
  return items;
}

/** Newest first, one copy of each story (same link or same headline), at most `limit`. */
export function mergeNews(lists: NewsItem[][], limit = 30): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  const all = lists.flat().sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));
  for (const item of all) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(item.link) || seen.has(key)) continue;
    seen.add(item.link);
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

/** "5 min ago", "3 h ago", "yesterday", or a date. */
export function timeAgo(iso: string | null, now: Date = new Date()): string {
  if (!iso) return '';
  const mins = Math.round((now.getTime() - Date.parse(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return 'yesterday';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}
