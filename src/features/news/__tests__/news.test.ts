import { mergeNews, parseRss, timeAgo } from '../rss';
import { describe as describeCode, parseWeather } from '../weather';

const GOOGLE = `<?xml version="1.0"?><rss><channel><title>Top stories - Google News</title>
<item><title>CBN holds rate at 27% - Nairametrics</title><link>https://news.google.com/a1</link>
<pubDate>Thu, 22 Oct 2026 07:00:00 GMT</pubDate><source url="https://nairametrics.com">Nairametrics</source></item>
<item><title><![CDATA[Super Eagles &amp; the road to Morocco]]></title><link>https://news.google.com/a2</link>
<pubDate>Thu, 22 Oct 2026 08:30:00 GMT</pubDate><source url="https://punchng.com">Punch</source></item>
<item><title>No link here</title></item>
</channel></rss>`;

const TECHCABAL = `<rss><channel><title>TechCabal</title>
<item><title>Moniepoint raises &#8216;new&#8217; round</title><link>https://techcabal.com/x</link><pubDate>Wed, 21 Oct 2026 18:00:00 +0100</pubDate></item>
<item><title>CBN holds rate at 27%</title><link>https://techcabal.com/dup</link><pubDate>Wed, 21 Oct 2026 10:00:00 +0100</pubDate></item>
</channel></rss>`;

describe('news', () => {
  it('parses RSS items, strips the outlet suffix and decodes entities', () => {
    const items = parseRss(GOOGLE, '');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ title: 'CBN holds rate at 27%', link: 'https://news.google.com/a1', source: 'Nairametrics', published: '2026-10-22T07:00:00.000Z' });
    expect(items[1]!.title).toBe('Super Eagles & the road to Morocco');
  });

  it('uses the given source when an item has none', () => {
    const items = parseRss(TECHCABAL, 'TechCabal');
    expect(items[0]!.source).toBe('TechCabal');
    expect(items[0]!.title).toBe('Moniepoint raises ‘new’ round');
  });

  it('merges newest first and drops repeated headlines', () => {
    const merged = mergeNews([parseRss(GOOGLE, ''), parseRss(TECHCABAL, 'TechCabal')]);
    expect(merged.map((n) => n.title)).toEqual(['Super Eagles & the road to Morocco', 'CBN holds rate at 27%', 'Moniepoint raises ‘new’ round']);
  });

  it('says how long ago', () => {
    const now = new Date('2026-10-22T09:00:00Z');
    expect(timeAgo('2026-10-22T08:30:00Z', now)).toBe('30 min ago');
    expect(timeAgo('2026-10-22T06:00:00Z', now)).toBe('3 h ago');
    expect(timeAgo(null, now)).toBe('');
  });

  it('reads Open-Meteo weather and gives advice', () => {
    const w = parseWeather({
      current: { temperature_2m: 27.6, weather_code: 3 },
      daily: { temperature_2m_max: [31.2], temperature_2m_min: [24.4], precipitation_probability_max: [70], weather_code: [95] },
    });
    expect(w).toMatchObject({ place: 'Lagos', now: 28, high: 31, low: 24, rainChance: 70, summary: 'Thunderstorms' });
    expect(w.advice).toMatch(/umbrella/);
    expect(describeCode(0).summary).toBe('Clear and sunny');
  });
});
