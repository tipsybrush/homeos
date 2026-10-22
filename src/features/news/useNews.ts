import { useCallback, useEffect, useState } from 'react';

import { TOPICS, type TopicId } from './feeds';
import { mergeNews, parseRss, type NewsItem } from './rss';
import { parseWeather, WEATHER_URL, type Weather } from './weather';

type Load<T> = { data: T | null; loading: boolean; error: string | null; refresh: () => void };

const TTL = 20 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, force: boolean, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Headlines for a topic. A feed that fails is skipped; only all feeds failing is an error. */
export async function loadTopic(topic: TopicId, force = false): Promise<NewsItem[]> {
  const def = TOPICS.find((t) => t.id === topic)!;
  return cached(`news:${topic}`, force, async () => {
    const results = await Promise.allSettled(def.feeds.map(async (f) => parseRss(await fetchText(f.url), f.source)));
    const lists = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
    if (lists.length === 0) throw new Error('offline');
    return mergeNews(lists, 30);
  });
}

export async function loadWeather(force = false): Promise<Weather> {
  return cached('weather', force, async () => {
    const res = await fetch(WEATHER_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseWeather(await res.json());
  });
}

function useLoad<T>(key: string, load: (force: boolean) => Promise<T>): Load<T> {
  const [force, setForce] = useState(0);
  const request = `${key}#${force}`;
  // `for` says which request a result answers, so a new topic or refresh shows as loading without resetting state in the effect.
  const [state, setState] = useState<{ for: string; data: T | null; error: string | null }>({ for: '', data: null, error: null });
  useEffect(() => {
    let live = true;
    load(force > 0)
      .then((data) => live && setState({ for: request, data, error: null }))
      .catch(() => live && setState((s) => ({ for: request, data: s.data, error: 'Couldn’t load. Check your internet and try again.' })));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);
  const refresh = useCallback(() => setForce((n) => n + 1), []);
  const current = state.for === request;
  return { data: current || state.for.startsWith(`${key}#`) ? state.data : null, loading: !current, error: current ? state.error : null, refresh };
}

export const useNews = (topic: TopicId) => useLoad(`news:${topic}`, (force) => loadTopic(topic, force));
export const useWeather = () => useLoad('weather', loadWeather);
