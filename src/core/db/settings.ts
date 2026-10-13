import type { Db } from './types';

/** `meals.autofilled.<weekStart>` marks a week the planner has already filled once. */
export type SettingKey = 'ha.mode' | 'ha.baseUrl' | 'profile.homeName' | 'profile.timezone' | `meals.autofilled.${string}`;

export async function getSetting(db: Db, key: SettingKey): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(db: Db, key: SettingKey, value: string | null): Promise<void> {
  if (value === null) {
    await db.runAsync('DELETE FROM settings WHERE key = ?', key);
    return;
  }
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
