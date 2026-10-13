import { HAError, type HassEntity } from './types';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type Options = {
  baseUrl: string;
  token: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

/** Minimal Home Assistant REST client with timeouts and typed errors. */
export function createRestClient({ baseUrl, token, fetchImpl = fetch, timeoutMs = 8000 }: Options) {
  async function request<T>(path: string, init: RequestInit = {}, kindOnHttpError: 'bad_response' | 'command_failed' = 'bad_response'): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
    } catch {
      if (controller.signal.aborted) {
        throw new HAError('timeout', `Home Assistant did not answer within ${Math.round(timeoutMs / 1000)} seconds.`);
      }
      throw new HAError('unreachable', 'Could not reach Home Assistant. Check the address and that your phone is on the same network.');
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 || res.status === 403) {
      throw new HAError('auth', 'Home Assistant rejected the access token. Create a new long-lived token and try again.', res.status);
    }
    if (!res.ok) {
      const detail = await safeText(res);
      const msg =
        kindOnHttpError === 'command_failed'
          ? `Home Assistant could not run that command${detail ? `: ${detail}` : '.'}`
          : res.status === 404
            ? 'That address answered, but it is not a Home Assistant API.'
            : `Home Assistant returned an error (${res.status}).`;
      throw new HAError(kindOnHttpError, msg, res.status);
    }
    try {
      return (await res.json()) as T;
    } catch {
      throw new HAError('bad_response', 'Home Assistant sent a response HomeOS could not read.');
    }
  }

  return {
    async check(): Promise<void> {
      const body = await request<{ message?: string }>('/api/');
      if (!body || typeof body.message !== 'string') {
        throw new HAError('bad_response', 'That address answered, but it is not a Home Assistant API.');
      }
    },
    async getStates(): Promise<HassEntity[]> {
      const body = await request<unknown>('/api/states');
      if (!Array.isArray(body)) throw new HAError('bad_response', 'Home Assistant sent an unexpected entity list.');
      return body.filter(isEntity).map(withDefaults);
    },
    async callService(domain: string, service: string, data: Record<string, unknown> = {}): Promise<HassEntity[]> {
      if (!/^[a-z0-9_]+$/.test(domain) || !/^[a-z0-9_]+$/.test(service)) {
        throw new HAError('invalid_config', 'Invalid command.');
      }
      const body = await request<unknown>(`/api/services/${domain}/${service}`, { method: 'POST', body: JSON.stringify(data) }, 'command_failed');
      return Array.isArray(body) ? body.filter(isEntity).map(withDefaults) : [];
    },
  };
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = (await res.text()).trim();
    return t.length > 160 ? t.slice(0, 160) + '…' : t;
  } catch {
    return '';
  }
}

function isEntity(x: unknown): x is HassEntity {
  return !!x && typeof x === 'object' && typeof (x as HassEntity).entity_id === 'string' && typeof (x as HassEntity).state === 'string';
}

/** Entities may omit attributes; never crash on missing optional fields. */
function withDefaults(e: HassEntity): HassEntity {
  return { ...e, attributes: e.attributes && typeof e.attributes === 'object' ? e.attributes : {} };
}
