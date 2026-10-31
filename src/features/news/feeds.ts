/**
 * News topics for the daily briefing (Timi, 2026-10-22): headlines, sports, tech,
 * Nigerian tech, and business & finance, both local and international.
 * Sports is European football only: UCL, EPL, LaLiga (Timi, 2026-10-31).
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
      { url: googleNews('site:ft.com when:2d'), source: 'Financial Times' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    feeds: [
      { url: googleNews('site:bleacherreport.com football when:2d'), source: 'B/R Football' },
      { url: googleNews('"Champions League" OR "Premier League" OR LaLiga when:2d'), source: '' },
      { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Football' },
    ],
  },
];
