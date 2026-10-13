import { domainOf } from './entities';
import { HAError, type ClientListener, type HassEntity, type HomeAssistantClient } from './types';

/**
 * DEMO HOME — not real devices.
 *
 * Timi has no Home Assistant yet, so this in-memory stand-in lets every screen
 * work end to end. It behaves like HA where it matters: commands go through
 * callService, state changes are pushed to subscribers, unavailable devices
 * fail loudly. It never reports energy, battery or inverter readings, because
 * there is no hardware to measure them.
 */

const t = () => new Date().toISOString();

function entity(entity_id: string, state: string, attributes: Record<string, unknown>): HassEntity {
  return { entity_id, state, attributes, last_changed: t(), last_updated: t() };
}

export function demoEntities(): HassEntity[] {
  return [
    entity('light.demo_living_floor_lamp', 'on', { friendly_name: 'Floor Lamp', brightness: 140, color_mode: 'brightness' }),
    entity('light.demo_living_ceiling', 'off', { friendly_name: 'Ceiling Light' }),
    entity('switch.demo_tv_plug', 'off', { friendly_name: 'TV Plug' }),
    entity('light.demo_desk_light', 'off', { friendly_name: 'Desk Light', brightness: 0 }),
    entity('light.demo_master_bedside', 'off', { friendly_name: 'Bedside Lamp' }),
    entity('switch.demo_desk_fan', 'off', { friendly_name: 'Desk Fan Plug' }),
    // Deliberately offline so the unavailable state is visible in the demo.
    entity('light.demo_second_bedroom', 'unavailable', { friendly_name: 'Guest Room Light' }),
    entity('light.demo_kitchen_strip', 'off', { friendly_name: 'Kitchen Light Strip' }),
    entity('binary_sensor.demo_front_door', 'off', { friendly_name: 'Front Door', device_class: 'door' }),
    entity('light.demo_hallway', 'off', { friendly_name: 'Hallway Light' }),
    entity('scene.demo_work_mode', 'scening', { friendly_name: 'Work Mode', icon: 'mdi:laptop' }),
    entity('scene.demo_relax_mode', 'scening', { friendly_name: 'Relax', icon: 'mdi:sofa' }),
    entity('scene.demo_bedtime', 'scening', { friendly_name: 'Bedtime', icon: 'mdi:weather-night' }),
    entity('scene.demo_away_mode', 'scening', { friendly_name: 'Away', icon: 'mdi:exit-run' }),
  ];
}

/** Room assignments applied when the user switches to the demo home. */
export const DEMO_ROOM_ASSIGNMENTS: { entityId: string; roomId: string; pinned: boolean }[] = [
  { entityId: 'light.demo_living_floor_lamp', roomId: 'room_living', pinned: true },
  { entityId: 'light.demo_living_ceiling', roomId: 'room_living', pinned: false },
  { entityId: 'switch.demo_tv_plug', roomId: 'room_living', pinned: false },
  { entityId: 'light.demo_desk_light', roomId: 'room_master', pinned: true },
  { entityId: 'light.demo_master_bedside', roomId: 'room_master', pinned: false },
  { entityId: 'switch.demo_desk_fan', roomId: 'room_master', pinned: true },
  { entityId: 'light.demo_second_bedroom', roomId: 'room_second', pinned: false },
  { entityId: 'light.demo_kitchen_strip', roomId: 'room_kitchen', pinned: true },
  { entityId: 'binary_sensor.demo_front_door', roomId: 'room_hallway', pinned: false },
  { entityId: 'light.demo_hallway', roomId: 'room_hallway', pinned: false },
];

/** What each demo scene does. Fridges and the door sensor are never touched. */
const SCENES: Record<string, Record<string, { state: 'on' | 'off'; brightness?: number }>> = {
  'scene.demo_work_mode': {
    'light.demo_desk_light': { state: 'on', brightness: 230 },
    'switch.demo_desk_fan': { state: 'on' },
    'light.demo_living_ceiling': { state: 'off' },
  },
  'scene.demo_relax_mode': {
    'light.demo_living_floor_lamp': { state: 'on', brightness: 90 },
    'light.demo_living_ceiling': { state: 'off' },
    'light.demo_desk_light': { state: 'off' },
  },
  'scene.demo_bedtime': {
    'light.demo_living_floor_lamp': { state: 'off' },
    'light.demo_living_ceiling': { state: 'off' },
    'switch.demo_tv_plug': { state: 'off' },
    'light.demo_desk_light': { state: 'off' },
    'switch.demo_desk_fan': { state: 'off' },
    'light.demo_kitchen_strip': { state: 'off' },
    'light.demo_master_bedside': { state: 'on', brightness: 40 },
  },
  'scene.demo_away_mode': {
    'light.demo_living_floor_lamp': { state: 'off' },
    'light.demo_living_ceiling': { state: 'off' },
    'switch.demo_tv_plug': { state: 'off' },
    'light.demo_desk_light': { state: 'off' },
    'switch.demo_desk_fan': { state: 'off' },
    'light.demo_kitchen_strip': { state: 'off' },
    'light.demo_master_bedside': { state: 'off' },
    'light.demo_hallway': { state: 'off' },
  },
};

type Options = { latencyMs?: number; initial?: HassEntity[] };

export function createMockClient({ latencyMs = 250, initial = demoEntities() }: Options = {}): HomeAssistantClient {
  const states = new Map(initial.map((e) => [e.entity_id, e]));
  const listeners = new Set<ClientListener>();
  const wait = () => new Promise<void>((r) => setTimeout(r, latencyMs));

  function set(id: string, patch: { state: string; brightness?: number }): HassEntity {
    const prev = states.get(id)!;
    const attributes = { ...prev.attributes };
    if (domainOf(id) === 'light') {
      if (patch.state === 'on') attributes.brightness = patch.brightness ?? (typeof prev.attributes.brightness === 'number' && prev.attributes.brightness > 0 ? prev.attributes.brightness : 200);
      else delete attributes.brightness;
    }
    const next: HassEntity = {
      ...prev,
      state: patch.state,
      attributes,
      last_changed: prev.state === patch.state ? prev.last_changed : t(),
      last_updated: t(),
    };
    states.set(id, next);
    listeners.forEach((l) => l.onEntity(id, next));
    return next;
  }

  function target(data: Record<string, unknown> | undefined): string[] {
    const raw = data?.entity_id;
    const ids = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
    if (ids.length === 0) throw new HAError('command_failed', 'No device was specified for that command.');
    for (const id of ids) {
      const e = states.get(String(id));
      if (!e) throw new HAError('command_failed', `Home Assistant does not know “${id}”.`);
      if (e.state === 'unavailable') {
        throw new HAError('command_failed', `${e.attributes.friendly_name ?? id} is unavailable, so the command was not sent.`);
      }
    }
    return ids.map(String);
  }

  return {
    kind: 'demo',
    async check() {
      await wait();
    },
    async getStates() {
      await wait();
      return [...states.values()];
    },
    async callService(domain, service, data) {
      await wait();
      const ids = target(data);
      const changed: HassEntity[] = [];
      if (domain === 'scene' && service === 'turn_on') {
        for (const sceneId of ids) {
          for (const [id, patch] of Object.entries(SCENES[sceneId] ?? {})) {
            if (states.get(id)?.state === 'unavailable') continue;
            changed.push(set(id, patch));
          }
        }
        return changed;
      }
      if (!['turn_on', 'turn_off', 'toggle'].includes(service)) {
        throw new HAError('command_failed', `The demo home does not support ${domain}.${service}.`);
      }
      for (const id of ids) {
        if (domainOf(id) !== domain && domain !== 'homeassistant') {
          throw new HAError('command_failed', `${id} is not a ${domain}.`);
        }
        const current = states.get(id)!;
        const nextState = service === 'toggle' ? (current.state === 'on' ? 'off' : 'on') : service === 'turn_on' ? 'on' : 'off';
        changed.push(set(id, { state: nextState }));
      }
      return changed;
    },
    subscribe(listener) {
      listeners.add(listener);
      queueMicrotask(() => listener.onLink('connected'));
      return () => listeners.delete(listener);
    },
    reconnect() {
      listeners.forEach((l) => l.onLink('connected'));
    },
    dispose() {
      listeners.clear();
    },
  };
}
