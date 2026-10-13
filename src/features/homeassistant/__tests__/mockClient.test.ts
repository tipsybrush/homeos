import { createMockClient, DEMO_ROOM_ASSIGNMENTS, demoEntities } from '../mockClient';
import { HAError } from '../types';

describe('demo home', () => {
  const make = () => createMockClient({ latencyMs: 0 });

  it('toggles a light and pushes the change to subscribers', async () => {
    const c = make();
    const seen: string[] = [];
    c.subscribe({ onEntity: (id, e) => seen.push(`${id}:${e?.state}`), onLink: () => undefined });
    const changed = await c.callService('light', 'toggle', { entity_id: 'light.demo_desk_light' });
    expect(changed[0]?.state).toBe('on');
    expect(seen).toContain('light.demo_desk_light:on');
  });

  it('fails loudly for an unavailable device', async () => {
    await expect(make().callService('light', 'toggle', { entity_id: 'light.demo_second_bedroom' })).rejects.toThrow(HAError);
  });

  it('runs a scene without touching unavailable devices or sensors', async () => {
    const c = make();
    const changed = await c.callService('scene', 'turn_on', { entity_id: 'scene.demo_bedtime' });
    expect(changed.length).toBeGreaterThan(0);
    const states = Object.fromEntries((await c.getStates()).map((e) => [e.entity_id, e.state]));
    expect(states['light.demo_master_bedside']).toBe('on');
    expect(states['light.demo_desk_light']).toBe('off');
    expect(states['light.demo_second_bedroom']).toBe('unavailable');
    expect(states['binary_sensor.demo_front_door']).toBe('off');
  });

  it('never invents energy, battery or inverter data', () => {
    for (const e of demoEntities()) {
      expect(e.entity_id.startsWith('sensor.')).toBe(false);
      expect(e.attributes).not.toHaveProperty('unit_of_measurement');
      expect(e.attributes).not.toHaveProperty('battery_level');
    }
  });

  it('only assigns rooms to entities that exist', () => {
    const ids = new Set(demoEntities().map((e) => e.entity_id));
    for (const a of DEMO_ROOM_ASSIGNMENTS) expect(ids.has(a.entityId)).toBe(true);
  });
});
