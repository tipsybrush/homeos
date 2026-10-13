import { newId } from '@/core/db/ids';
import type { Db } from '@/core/db/types';

import type { WardrobeCategory, WardrobeItem } from './logic';

type Row = { id: string; name: string; category: WardrobeCategory; colour: string | null; light_fabric: number };

export async function listWardrobe(db: Db): Promise<WardrobeItem[]> {
  const rows = await db.getAllAsync<Row>('SELECT id, name, category, colour, light_fabric FROM wardrobe_items ORDER BY category, name');
  return rows.map((r) => ({ id: r.id, name: r.name, category: r.category, colour: r.colour, lightFabric: r.light_fabric === 1 }));
}

export async function addWardrobeItem(db: Db, item: Omit<WardrobeItem, 'id'>): Promise<string> {
  const id = newId('wdr');
  await db.runAsync(
    'INSERT INTO wardrobe_items (id, name, category, colour, light_fabric, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    item.name.trim(),
    item.category,
    item.colour?.trim() || null,
    item.lightFabric ? 1 : 0,
    new Date().toISOString(),
  );
  return id;
}

export async function deleteWardrobeItem(db: Db, id: string): Promise<void> {
  await db.runAsync('DELETE FROM wardrobe_items WHERE id = ?', id);
}
