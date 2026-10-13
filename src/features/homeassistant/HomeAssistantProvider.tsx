import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useDb } from '@/core/db/DatabaseProvider';
import { getSetting, setSetting } from '@/core/db/settings';
import { applyDefaultAssignments } from '@/features/rooms/repository';

import { clearToken, loadToken, saveToken } from './credentials';
import { domainOf } from './entities';
import { createLiveClient } from './liveClient';
import { createMockClient, DEMO_ROOM_ASSIGNMENTS } from './mockClient';
import { describeError, HAError, type HassEntity, type HomeAssistantClient, type LinkStatus } from './types';
import { normalizeBaseUrl, validateToken } from './url';

export type HAMode = 'off' | 'demo' | 'live';

export type HAStatus =
  | { kind: 'not_configured' }
  | { kind: 'loading' }
  | { kind: 'connected' }
  | { kind: 'reconnecting' }
  | { kind: 'error'; message: string; auth?: boolean };

export type CommandResult = { ok: true } | { ok: false; message: string };

type ContextValue = {
  mode: HAMode;
  baseUrl: string | null;
  status: HAStatus;
  entities: Record<string, HassEntity>;
  /** Entity ids with a command in flight. */
  pending: ReadonlySet<string>;
  lastSyncedAt: Date | null;
  refresh(): Promise<void>;
  toggle(entityId: string): Promise<CommandResult>;
  activateScene(entityId: string): Promise<CommandResult>;
  /** Tests the connection first; only saves settings if it works. */
  connectLive(url: string, token: string): Promise<CommandResult>;
  switchToDemo(): Promise<void>;
  /** Forgets the server and deletes the stored token. */
  disconnect(): Promise<void>;
};

const HAContext = createContext<ContextValue | null>(null);

export function useHomeAssistant(): ContextValue {
  const ctx = useContext(HAContext);
  if (!ctx) throw new Error('useHomeAssistant must be used inside HomeAssistantProvider');
  return ctx;
}

export function HomeAssistantProvider({ children }: { children: ReactNode }) {
  const db = useDb();
  const [mode, setMode] = useState<HAMode | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [client, setClient] = useState<HomeAssistantClient | null>(null);
  const [status, setStatus] = useState<HAStatus>({ kind: 'loading' });
  const [entities, setEntities] = useState<Record<string, HassEntity>>({});
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const clientRef = useRef<HomeAssistantClient | null>(null);
  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  /** Swap the active client; the wiring effect below picks it up. */
  const activate = useCallback((next: HomeAssistantClient | null) => {
    setEntities({});
    setStatus(next ? { kind: 'loading' } : { kind: 'not_configured' });
    setClient(next);
  }, []);

  // Load saved configuration once. First launch defaults to the demo home so
  // the app is explorable before any hardware exists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedMode = ((await getSetting(db, 'ha.mode')) as HAMode | null) ?? 'demo';
      const savedUrl = await getSetting(db, 'ha.baseUrl');
      if (cancelled) return;
      if (savedMode === 'demo') await applyDefaultAssignments(db, DEMO_ROOM_ASSIGNMENTS);
      if (savedMode === 'live') {
        const token = await loadToken();
        if (savedUrl && token) {
          setBaseUrl(savedUrl);
          activate(createLiveClient({ baseUrl: savedUrl, token }));
        } else {
          setStatus({ kind: 'error', message: 'Home Assistant details are missing. Set up the connection again.' });
        }
      } else if (savedMode === 'demo') {
        activate(createMockClient());
      } else {
        activate(null);
      }
      setMode(savedMode);
    })();
    return () => {
      cancelled = true;
    };
  }, [db, activate]);

  const loadStates = useCallback(async (c: HomeAssistantClient) => {
    try {
      const list = await c.getStates();
      if (clientRef.current !== c) return;
      setEntities(Object.fromEntries(list.map((e) => [e.entity_id, e])));
      setLastSyncedAt(new Date());
      setStatus({ kind: 'connected' });
    } catch (e) {
      if (clientRef.current !== c) return;
      setStatus({ kind: 'error', message: describeError(e), auth: e instanceof HAError && e.kind === 'auth' });
    }
  }, []);

  // Wire the active client: initial fetch, live updates, reconciliation after reconnects.
  useEffect(() => {
    if (!client) return;
    // loadStates only sets state after awaiting the network, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStates(client);
    const unsubscribe = client.subscribe({
      onEntity(id, e) {
        setEntities((prev) => {
          const next = { ...prev };
          if (e) next[id] = e;
          else delete next[id];
          return next;
        });
      },
      onLink(link: LinkStatus, detail?: string) {
        if (link === 'connected') void loadStates(client); // reconcile anything missed while away
        else if (link === 'reconnecting') setStatus({ kind: 'reconnecting' });
        else if (link === 'auth_failed') setStatus({ kind: 'error', message: detail ?? 'Access token rejected.', auth: true });
        else if (link === 'offline') setStatus({ kind: 'error', message: detail ?? 'Home Assistant is offline.' });
      },
    });
    return () => {
      unsubscribe();
      client.dispose();
    };
  }, [client, loadStates]);

  const run = useCallback(async (entityId: string, domain: string, service: string): Promise<CommandResult> => {
    const c = clientRef.current;
    if (!c) return { ok: false, message: 'Home Assistant is not connected.' };
    setPending((p) => new Set(p).add(entityId));
    try {
      const changed = await c.callService(domain, service, { entity_id: entityId });
      // Only HA-confirmed state is shown; no optimistic flip that could lie.
      if (changed.length) setEntities((prev) => ({ ...prev, ...Object.fromEntries(changed.map((e) => [e.entity_id, e])) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: describeError(e) };
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(entityId);
        return n;
      });
    }
  }, []);

  const toggle = useCallback((entityId: string) => run(entityId, domainOf(entityId), 'toggle'), [run]);
  const activateScene = useCallback((entityId: string) => run(entityId, 'scene', 'turn_on'), [run]);

  const refresh = useCallback(async () => {
    const c = clientRef.current;
    if (!c) return;
    c.reconnect();
    await loadStates(c);
  }, [loadStates]);

  const connectLive = useCallback(
    async (rawUrl: string, rawToken: string): Promise<CommandResult> => {
      let url: string;
      let token: string;
      try {
        url = normalizeBaseUrl(rawUrl);
        token = validateToken(rawToken);
        const candidate = createLiveClient({ baseUrl: url, token });
        await candidate.check();
        candidate.dispose();
      } catch (e) {
        return { ok: false, message: describeError(e) };
      }
      await saveToken(token);
      await setSetting(db, 'ha.baseUrl', url);
      await setSetting(db, 'ha.mode', 'live');
      setBaseUrl(url);
      setMode('live');
      activate(createLiveClient({ baseUrl: url, token }));
      return { ok: true };
    },
    [db, activate],
  );

  const switchToDemo = useCallback(async () => {
    await setSetting(db, 'ha.mode', 'demo');
    await applyDefaultAssignments(db, DEMO_ROOM_ASSIGNMENTS);
    setMode('demo');
    activate(createMockClient());
  }, [db, activate]);

  const disconnect = useCallback(async () => {
    await clearToken();
    await setSetting(db, 'ha.baseUrl', null);
    await setSetting(db, 'ha.mode', 'off');
    setBaseUrl(null);
    setMode('off');
    activate(null);
  }, [db, activate]);

  const value = useMemo<ContextValue>(
    () => ({
      mode: mode ?? 'off',
      baseUrl,
      status,
      entities,
      pending,
      lastSyncedAt,
      refresh,
      toggle,
      activateScene,
      connectLive,
      switchToDemo,
      disconnect,
    }),
    [mode, baseUrl, status, entities, pending, lastSyncedAt, refresh, toggle, activateScene, connectLive, switchToDemo, disconnect],
  );

  return <HAContext.Provider value={value}>{children}</HAContext.Provider>;
}

/** Short label + tone for the connection pill shown on Home and More. */
export function connectionSummary(mode: HAMode, status: HAStatus): { label: string; tone: 'ok' | 'warn' | 'error' | 'neutral' | 'info' } {
  if (mode === 'off' || status.kind === 'not_configured') return { label: 'Smart home not set up', tone: 'neutral' };
  if (status.kind === 'loading') return { label: 'Connecting…', tone: 'info' };
  if (status.kind === 'reconnecting') return { label: 'Reconnecting…', tone: 'warn' };
  if (status.kind === 'error') return { label: status.auth ? 'Token rejected' : 'Home Assistant offline', tone: 'error' };
  return mode === 'demo' ? { label: 'Demo home (not real devices)', tone: 'info' } : { label: 'Home Assistant connected', tone: 'ok' };
}
