import { HAError } from './types';

/**
 * Normalises what the user typed into a base URL like
 * "http://192.168.1.20:8123". Throws HAError('invalid_config') if unusable.
 */
export function normalizeBaseUrl(input: string): string {
  let s = input.trim();
  if (!s) throw new HAError('invalid_config', 'Enter your Home Assistant address, e.g. http://homeassistant.local:8123');
  if (!/^[a-z]+:\/\//i.test(s)) s = `http://${s}`;
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    throw new HAError('invalid_config', 'That address does not look like a URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HAError('invalid_config', 'Use an http:// or https:// address.');
  }
  if (url.username || url.password) {
    throw new HAError('invalid_config', 'Do not put a username or password in the address. Use a long-lived access token instead.');
  }
  const path = url.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${url.protocol}//${url.host}${path}`;
}

export function toWebSocketUrl(baseUrl: string): string {
  return baseUrl.replace(/^http/i, 'ws') + '/api/websocket';
}

/** True for addresses that only resolve inside the home network. */
export function isLocalHost(baseUrl: string): boolean {
  const host = new URL(baseUrl).hostname;
  return (
    host === 'localhost' ||
    host.endsWith('.local') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^127\./.test(host)
  );
}

/** A warning (not an error) when a remote address is not encrypted. */
export function insecureRemoteWarning(baseUrl: string): string | null {
  if (baseUrl.startsWith('https://') || isLocalHost(baseUrl)) return null;
  return 'This address is outside your home network but not using https. Your token would travel unencrypted.';
}

export function validateToken(token: string): string {
  const t = token.trim();
  if (!t) throw new HAError('invalid_config', 'Paste a long-lived access token from your Home Assistant profile page.');
  if (/\s/.test(t)) throw new HAError('invalid_config', 'The token should not contain spaces or line breaks.');
  return t;
}
