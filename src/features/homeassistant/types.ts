/** Shapes from the Home Assistant REST and WebSocket APIs (only what HomeOS reads). */
export type HassEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
};

export type HAErrorKind =
  | 'invalid_config' // URL or token malformed before we even try
  | 'auth' // token rejected
  | 'unreachable' // network error, DNS, refused, wrong host
  | 'timeout'
  | 'bad_response' // reachable, but not answering like Home Assistant
  | 'command_failed'; // HA refused or failed a service call

export class HAError extends Error {
  constructor(
    public readonly kind: HAErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'HAError';
  }
}

/** Plain-language text for each failure, shown to the user as-is. */
export function describeError(error: unknown): string {
  if (error instanceof HAError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong talking to Home Assistant.';
}

export type LinkStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline' | 'auth_failed';

export type ClientListener = {
  /** A single entity changed (null `entity` means it was removed). */
  onEntity(entityId: string, entity: HassEntity | null): void;
  /** Live-link health. After a reconnect, the provider refetches all states. */
  onLink(status: LinkStatus, detail?: string): void;
};

/**
 * What the app needs from a smart-home backend. `live` talks to a real Home
 * Assistant; `demo` is an in-memory stand-in so the app is usable before any
 * hardware exists. Screens never import a concrete client.
 */
export interface HomeAssistantClient {
  readonly kind: 'live' | 'demo';
  /** Verifies the connection and credentials. Throws HAError. */
  check(): Promise<void>;
  getStates(): Promise<HassEntity[]>;
  /** Resolves with the entities HA reports as changed; throws HAError on any failure. */
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<HassEntity[]>;
  subscribe(listener: ClientListener): () => void;
  /** Ask a dropped live link to try again immediately. */
  reconnect(): void;
  dispose(): void;
}
