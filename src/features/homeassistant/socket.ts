import { toWebSocketUrl } from './url';
import type { HassEntity, LinkStatus } from './types';

type WebSocketLike = {
  onopen: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
  onclose: ((ev: unknown) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  send(data: string): void;
  close(): void;
};
export type WebSocketFactory = (url: string) => WebSocketLike;

type Options = {
  baseUrl: string;
  token: string;
  onEntity(entityId: string, entity: HassEntity | null): void;
  /** 'connected' is reported after each successful (re)subscription, so callers can reconcile states then. */
  onStatus(status: LinkStatus, detail?: string): void;
  createSocket?: WebSocketFactory;
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

/**
 * Live state updates over Home Assistant's WebSocket API, with bounded
 * exponential backoff. Auth failures stop retrying: a bad token will not fix
 * itself.
 */
export class HassSocket {
  private ws: WebSocketLike | null = null;
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private nextId = 1;
  private readonly opts: Required<Omit<Options, 'createSocket'>> & { createSocket: WebSocketFactory };

  constructor(options: Options) {
    this.opts = {
      maxAttempts: 8,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      createSocket: (url) => new WebSocket(url) as unknown as WebSocketLike,
      ...options,
    };
  }

  start() {
    this.disposed = false;
    this.open('connecting');
  }

  /** Skip the backoff and try now (e.g. user pulled to refresh). */
  retryNow() {
    if (this.disposed) return;
    this.clearTimer();
    this.attempt = 0;
    this.teardown();
    this.open('connecting');
  }

  dispose() {
    this.disposed = true;
    this.clearTimer();
    this.teardown();
  }

  private open(status: LinkStatus) {
    this.opts.onStatus(status);
    let ws: WebSocketLike;
    try {
      ws = this.opts.createSocket(toWebSocketUrl(this.opts.baseUrl));
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    let authFailed = false;

    ws.onmessage = (ev) => {
      let msg: any;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      switch (msg?.type) {
        case 'auth_required':
          ws.send(JSON.stringify({ type: 'auth', access_token: this.opts.token }));
          break;
        case 'auth_ok':
          ws.send(JSON.stringify({ id: this.nextId++, type: 'subscribe_events', event_type: 'state_changed' }));
          break;
        case 'auth_invalid':
          authFailed = true;
          this.opts.onStatus('auth_failed', 'Home Assistant rejected the access token.');
          ws.close();
          break;
        case 'result':
          if (msg.success) {
            this.attempt = 0;
            this.opts.onStatus('connected');
          }
          break;
        case 'event': {
          const data = msg.event?.data;
          if (msg.event?.event_type === 'state_changed' && typeof data?.entity_id === 'string') {
            const s = data.new_state;
            this.opts.onEntity(data.entity_id, s && typeof s === 'object' ? { ...s, attributes: s.attributes ?? {} } : null);
          }
          break;
        }
      }
    };
    ws.onerror = () => {
      /* onclose follows; handled there */
    };
    ws.onclose = () => {
      if (this.ws === ws) this.ws = null;
      if (this.disposed || authFailed) return;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.disposed) return;
    if (this.attempt >= this.opts.maxAttempts) {
      this.opts.onStatus('offline', 'Lost connection to Home Assistant. Pull to refresh to try again.');
      return;
    }
    const delay = Math.min(this.opts.baseDelayMs * 2 ** this.attempt, this.opts.maxDelayMs);
    this.attempt += 1;
    this.opts.onStatus('reconnecting');
    this.timer = setTimeout(() => {
      this.timer = null;
      this.open('reconnecting');
    }, delay);
  }

  private teardown() {
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onclose = null;
      ws.onmessage = null;
      try {
        ws.close();
      } catch {
        /* already closed */
      }
    }
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
