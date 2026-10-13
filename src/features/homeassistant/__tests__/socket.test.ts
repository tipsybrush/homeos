import { HassSocket } from '../socket';
import type { HassEntity, LinkStatus } from '../types';

class FakeSocket {
  static instances: FakeSocket[] = [];
  sent: any[] = [];
  onopen: ((ev: unknown) => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onclose: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  constructor(public url: string) {
    FakeSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.onclose?.({});
  }
  server(msg: unknown) {
    this.onmessage?.({ data: JSON.stringify(msg) });
  }
}

function setup(maxAttempts = 3) {
  FakeSocket.instances = [];
  const statuses: LinkStatus[] = [];
  const updates: [string, HassEntity | null][] = [];
  const socket = new HassSocket({
    baseUrl: 'http://ha.local:8123',
    token: 'tok',
    createSocket: (url) => new FakeSocket(url),
    onEntity: (id, e) => updates.push([id, e]),
    onStatus: (s) => statuses.push(s),
    maxAttempts,
    baseDelayMs: 10,
    maxDelayMs: 40,
  });
  return { socket, statuses, updates, last: () => FakeSocket.instances[FakeSocket.instances.length - 1]! };
}

function handshake(ws: FakeSocket) {
  ws.server({ type: 'auth_required' });
  ws.server({ type: 'auth_ok' });
  ws.server({ id: 1, type: 'result', success: true });
}

describe('HassSocket', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('authenticates, subscribes and reports connected', () => {
    const { socket, statuses, last } = setup();
    socket.start();
    const ws = last();
    expect(ws.url).toBe('ws://ha.local:8123/api/websocket');
    handshake(ws);
    expect(ws.sent[0]).toEqual({ type: 'auth', access_token: 'tok' });
    expect(ws.sent[1]).toMatchObject({ type: 'subscribe_events', event_type: 'state_changed' });
    expect(statuses).toEqual(['connecting', 'connected']);
    socket.dispose();
  });

  it('forwards state changes, including removed entities and missing attributes', () => {
    const { socket, updates, last } = setup();
    socket.start();
    const ws = last();
    handshake(ws);
    ws.server({ id: 1, type: 'event', event: { event_type: 'state_changed', data: { entity_id: 'light.a', new_state: { entity_id: 'light.a', state: 'on' } } } });
    ws.server({ id: 1, type: 'event', event: { event_type: 'state_changed', data: { entity_id: 'light.b', new_state: null } } });
    expect(updates).toEqual([
      ['light.a', { entity_id: 'light.a', state: 'on', attributes: {} }],
      ['light.b', null],
    ]);
    socket.dispose();
  });

  it('stops on invalid credentials instead of retrying forever', () => {
    const { socket, statuses, last } = setup();
    socket.start();
    const ws = last();
    ws.server({ type: 'auth_required' });
    ws.server({ type: 'auth_invalid', message: 'bad' });
    jest.advanceTimersByTime(10_000);
    expect(statuses).toContain('auth_failed');
    expect(FakeSocket.instances).toHaveLength(1);
    socket.dispose();
  });

  it('reconnects with backoff after a drop and reports connected again', () => {
    const { socket, statuses, last } = setup();
    socket.start();
    handshake(last());
    last().close();
    expect(statuses.at(-1)).toBe('reconnecting');
    jest.advanceTimersByTime(10);
    expect(FakeSocket.instances).toHaveLength(2);
    handshake(last());
    expect(statuses.at(-1)).toBe('connected');
    socket.dispose();
  });

  it('gives up after bounded attempts and goes offline', () => {
    const { socket, statuses, last } = setup(2);
    socket.start();
    last().close(); // attempt 1 scheduled
    jest.advanceTimersByTime(10);
    last().close(); // attempt 2 scheduled
    jest.advanceTimersByTime(20);
    last().close(); // no more attempts
    expect(statuses.at(-1)).toBe('offline');
    expect(FakeSocket.instances).toHaveLength(3);
    socket.dispose();
  });

  it('does not reconnect after dispose', () => {
    const { socket, last } = setup();
    socket.start();
    handshake(last());
    socket.dispose();
    jest.advanceTimersByTime(10_000);
    expect(FakeSocket.instances).toHaveLength(1);
  });
});
