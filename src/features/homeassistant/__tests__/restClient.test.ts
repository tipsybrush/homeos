import { createRestClient, type FetchLike } from '../restClient';
import { HAError } from '../types';

const TOKEN = 'secret-token';

function respond(status: number, body: unknown): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
}

function client(fetchImpl: FetchLike, timeoutMs = 50) {
  return createRestClient({ baseUrl: 'http://ha.local:8123', token: TOKEN, fetchImpl, timeoutMs });
}

async function kindOf(p: Promise<unknown>) {
  try {
    await p;
    return 'resolved';
  } catch (e) {
    return e instanceof HAError ? e.kind : 'other';
  }
}

describe('Home Assistant REST client', () => {
  it('connects and sends the bearer token', async () => {
    const fetchImpl = jest.fn<Promise<Response>, Parameters<FetchLike>>(async () => respond(200, { message: 'API running.' }));
    await client(fetchImpl).check();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://ha.local:8123/api/');
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('reports invalid credentials as auth', async () => {
    expect(await kindOf(client(async () => respond(401, 'Unauthorized')).check())).toBe('auth');
  });

  it('reports an unreachable controller', async () => {
    expect(
      await kindOf(
        client(async () => {
          throw new TypeError('Network request failed');
        }).check(),
      ),
    ).toBe('unreachable');
  });

  it('times out instead of hanging', async () => {
    const hang: FetchLike = (_url, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))));
    expect(await kindOf(client(hang, 20).check())).toBe('timeout');
  });

  it('rejects a server that is not Home Assistant', async () => {
    expect(await kindOf(client(async () => respond(404, 'nope')).check())).toBe('bad_response');
    expect(await kindOf(client(async () => respond(200, { hello: 'world' })).check())).toBe('bad_response');
  });

  it('tolerates entities with missing attributes and skips junk', async () => {
    const states = await client(async () => respond(200, [{ entity_id: 'light.a', state: 'on' }, { nope: true }])).getStates();
    expect(states).toEqual([{ entity_id: 'light.a', state: 'on', attributes: {} }]);
  });

  it('returns changed states for a successful command', async () => {
    const fetchImpl = jest.fn<Promise<Response>, Parameters<FetchLike>>(async () => respond(200, [{ entity_id: 'light.a', state: 'off', attributes: {} }]));
    const changed = await client(fetchImpl).callService('light', 'toggle', { entity_id: 'light.a' });
    expect(changed[0]?.state).toBe('off');
    expect(fetchImpl.mock.calls[0]![0]).toBe('http://ha.local:8123/api/services/light/toggle');
    expect(fetchImpl.mock.calls[0]![1]?.method).toBe('POST');
  });

  it('never reports a failed command as success', async () => {
    expect(await kindOf(client(async () => respond(400, 'Entity not found')).callService('light', 'toggle', { entity_id: 'light.x' }))).toBe(
      'command_failed',
    );
    expect(await kindOf(client(async () => respond(500, 'boom')).callService('switch', 'turn_on', { entity_id: 'switch.x' }))).toBe('command_failed');
  });

  it('refuses malformed service names', async () => {
    expect(await kindOf(client(async () => respond(200, [])).callService('light/../x', 'toggle'))).toBe('invalid_config');
  });
});
