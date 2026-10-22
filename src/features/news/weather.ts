/** Lagos weather from Open-Meteo (free, no key). Home is Lagos (Timi). */
export const LAGOS = { name: 'Lagos', latitude: 6.5244, longitude: 3.3792 };

export type Weather = {
  place: string;
  now: number;
  high: number;
  low: number;
  rainChance: number;
  summary: string;
  icon: WeatherIcon;
  advice: string;
};

export type WeatherIcon = 'sunny-outline' | 'partly-sunny-outline' | 'cloudy-outline' | 'rainy-outline' | 'thunderstorm-outline';

export const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAGOS.latitude}&longitude=${LAGOS.longitude}` +
  '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code' +
  '&timezone=Africa%2FLagos&forecast_days=1';

/** WMO weather codes to words and an icon. */
export function describe(code: number): { summary: string; icon: WeatherIcon } {
  if (code === 0) return { summary: 'Clear and sunny', icon: 'sunny-outline' };
  if (code <= 2) return { summary: 'Partly cloudy', icon: 'partly-sunny-outline' };
  if (code <= 48) return { summary: 'Cloudy', icon: 'cloudy-outline' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { summary: 'Rain', icon: 'rainy-outline' };
  if (code >= 95) return { summary: 'Thunderstorms', icon: 'thunderstorm-outline' };
  return { summary: 'Showers', icon: 'rainy-outline' };
}

function advise(high: number, rainChance: number, code: number): string {
  if (code >= 95 || rainChance >= 60) return 'Take an umbrella. Expect rain and slower traffic.';
  if (rainChance >= 30) return 'There may be a shower, so keep an umbrella handy.';
  if (high >= 32) return 'Hot day: drink water and wear light fabrics.';
  return 'A good day to be out.';
}

type OpenMeteo = {
  current: { temperature_2m: number; weather_code: number };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[]; weather_code: number[] };
};

export function parseWeather(json: OpenMeteo): Weather {
  const code = json.daily.weather_code[0] ?? json.current.weather_code;
  const high = Math.round(json.daily.temperature_2m_max[0] ?? json.current.temperature_2m);
  const low = Math.round(json.daily.temperature_2m_min[0] ?? json.current.temperature_2m);
  const rainChance = json.daily.precipitation_probability_max[0] ?? 0;
  const { summary, icon } = describe(code);
  return { place: LAGOS.name, now: Math.round(json.current.temperature_2m), high, low, rainChance, summary, icon, advice: advise(high, rainChance, code) };
}
