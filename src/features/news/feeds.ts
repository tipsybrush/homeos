/**
 * News topics for the daily briefing (Timi, 2026-10-22): headlines, sports, tech,
 * Nigerian tech, and business & finance, both local and international.
 * All free public RSS feeds, read directly by the phone. No paid services.
 */
export type TopicId = 'top' | 'nigeria-tech' | 'tech' | 'business' | 'sports';

export type Feed = { url: string; source: string };

const googleNews = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-NG&gl=NG&ceid=NG:en`;

export const TOPICS: { id: TopicId; label: string; feeds: Feed[] }[] = [
  {
    id: 'top',
    label: 'Top stories',
    feeds: [
      { url: 'https://news.google.com/rss?hl=en-NG&gl=NG&ceid=NG:en', source: '' },
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
    ],
  },
  {
    id: 'nigeria-tech',
    label: 'Nigerian tech',
    feeds: [
      { url: 'https://techcabal.com/feed/', source: 'TechCabal' },
      { url: googleNews('Nigeria tech startup OR fintech when:2d'), source: '' },
    ],
  },
  {
    id: 'tech',
    label: 'Tech',
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology' },
      { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
    ],
  },
  {
    id: 'business',
    label: 'Business & finance',
    feeds: [
      { url: 'https://nairametrics.com/feed/', source: 'Nairametrics' },
      { url: googleNews('naira OR CBN OR NGX when:2d'), source: '' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    feeds: [
      { url: googleNews('Super Eagles OR Super Falcons OR NPFL when:3d'), source: '' },
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
  },
];
