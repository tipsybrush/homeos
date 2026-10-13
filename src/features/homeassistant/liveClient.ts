import { createRestClient, type FetchLike } from './restClient';
import { HassSocket, type WebSocketFactory } from './socket';
import type { ClientListener, HomeAssistantClient } from './types';

type Options = {
  baseUrl: string;
  token: string;
  fetchImpl?: FetchLike;
  createSocket?: WebSocketFactory;
};

/** A real Home Assistant: REST for reads and commands, WebSocket for live updates. */
export function createLiveClient({ baseUrl, token, fetchImpl, createSocket }: Options): HomeAssistantClient {
  const rest = createRestClient({ baseUrl, token, fetchImpl });
  const listeners = new Set<ClientListener>();
  let socket: HassSocket | null = null;

  function ensureSocket() {
    if (socket) return;
    socket = new HassSocket({
      baseUrl,
      token,
      createSocket,
      onEntity: (id, e) => listeners.forEach((l) => l.onEntity(id, e)),
      onStatus: (s, d) => listeners.forEach((l) => l.onLink(s, d)),
    });
    socket.start();
  }

  return {
    kind: 'live',
    check: () => rest.check(),
    getStates: () => rest.getStates(),
    callService: (domain, service, data) => rest.callService(domain, service, data),
    subscribe(listener) {
      listeners.add(listener);
      ensureSocket();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          socket?.dispose();
          socket = null;
        }
      };
    },
    reconnect() {
      socket?.retryNow();
    },
    dispose() {
      listeners.clear();
      socket?.dispose();
      socket = null;
    },
  };
}
