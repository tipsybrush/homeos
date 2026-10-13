import { createLiveClient } from '../liveClient';

describe('live client', () => {
  it('opens one socket for many listeners and closes it when the last unsubscribes', () => {
    const created: { close: jest.Mock }[] = [];
    const client = createLiveClient({
      baseUrl: 'http://ha.local:8123',
      token: 't',
      fetchImpl: async () => new Response('[]'),
      createSocket: () => {
        const s = { onopen: null, onmessage: null, onclose: null, onerror: null, send: jest.fn(), close: jest.fn() };
        created.push(s);
        return s;
      },
    });
    const a = client.subscribe({ onEntity: () => undefined, onLink: () => undefined });
    const b = client.subscribe({ onEntity: () => undefined, onLink: () => undefined });
    expect(created).toHaveLength(1);
    a();
    expect(created[0]!.close).not.toHaveBeenCalled();
    b();
    expect(created[0]!.close).toHaveBeenCalled();
  });
});
