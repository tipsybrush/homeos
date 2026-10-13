import type { HassEntity } from './types';

export function domainOf(entityId: string): string {
  return entityId.split('.')[0] ?? '';
}

export function friendlyName(e: HassEntity): string {
  const n = e.attributes.friendly_name;
  return typeof n === 'string' && n.trim() ? n : e.entity_id;
}

export function isUnavailable(e: HassEntity | undefined): boolean {
  return !e || e.state === 'unavailable' || e.state === 'unknown';
}

export function isOn(e: HassEntity | undefined): boolean {
  return !!e && e.state === 'on';
}

/** Domains HomeOS can switch on/off in the MVP. */
export const TOGGLE_DOMAINS = ['light', 'switch', 'fan', 'input_boolean'] as const;

export function isToggleable(e: HassEntity): boolean {
  return (TOGGLE_DOMAINS as readonly string[]).includes(domainOf(e.entity_id));
}

export function isScene(e: HassEntity): boolean {
  return domainOf(e.entity_id) === 'scene';
}

/** Brightness as 0–100 if HA reports it, otherwise null (never guessed). */
export function brightnessPercent(e: HassEntity): number | null {
  const b = e.attributes.brightness;
  return typeof b === 'number' && e.state === 'on' ? Math.round((b / 255) * 100) : null;
}

/** Short human state for a device tile. */
export function stateLabel(e: HassEntity | undefined): string {
  if (!e) return 'Not found';
  if (e.state === 'unavailable') return 'Unavailable';
  if (e.state === 'unknown') return 'Unknown';
  const domain = domainOf(e.entity_id);
  if (domain === 'binary_sensor') {
    const cls = e.attributes.device_class;
    if (cls === 'door' || cls === 'window' || cls === 'opening') return e.state === 'on' ? 'Open' : 'Closed';
    if (cls === 'motion' || cls === 'occupancy') return e.state === 'on' ? 'Motion' : 'Clear';
  }
  if (isToggleable(e)) {
    const pct = brightnessPercent(e);
    if (e.state === 'on') return pct !== null ? `On · ${pct}%` : 'On';
    if (e.state === 'off') return 'Off';
  }
  const unit = e.attributes.unit_of_measurement;
  return typeof unit === 'string' ? `${e.state} ${unit}` : e.state;
}

export function iconFor(e: HassEntity): 'bulb' | 'bulb-outline' | 'power' | 'toggle' | 'sparkles' | 'door' | 'pulse' | 'hardware-chip-outline' {
  const d = domainOf(e.entity_id);
  if (d === 'light') return isOn(e) ? 'bulb' : 'bulb-outline';
  if (d === 'switch' || d === 'fan' || d === 'input_boolean') return 'power';
  if (d === 'scene') return 'sparkles';
  if (d === 'binary_sensor') return e.attributes.device_class === 'door' ? 'door' : 'pulse';
  return 'hardware-chip-outline';
}
