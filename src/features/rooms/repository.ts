import type { Db } from '@/core/db/types';

export type Room = { id: string; name: string; icon: string; sortOrder: number };
export type DeviceRef = { entityId: string; roomId: string | null; displayName: string | null; pinned: boolean };

export async function listRooms(db: Db): Promise<Room[]> {
  const rows = await db.getAllAsync<{ id: string; name: string; icon: string; sort_order: number }>(
    'SELECT * FROM rooms ORDER BY sort_order, name',
  );
  return rows.map((r) => ({ id: r.id, name: r.name, icon: r.icon, sortOrder: r.sort_order }));
}

export async function listDeviceRefs(db: Db): Promise<DeviceRef[]> {
  const rows = await db.getAllAsync<{ entity_id: string; room_id: string | null; display_name: string | null; pinned: number }>(
    'SELECT * FROM device_refs',
  );
  return rows.map((r) => ({ entityId: r.entity_id, roomId: r.room_id, displayName: r.display_name, pinned: r.pinned === 1 }));
}

export async function assignRoom(db: Db, entityId: string, roomId: string | null): Promise<void> {
  await db.runAsync(
    `INSERT INTO device_refs (entity_id, room_id) VALUES (?, ?)
     ON CONFLICT(entity_id) DO UPDATE SET room_id = excluded.room_id`,
    entityId,
    roomId,
  );
}

export async function setPinned(db: Db, entityId: string, pinned: boolean): Promise<void> {
  await db.runAsync(
    `INSERT INTO device_refs (entity_id, pinned) VALUES (?, ?)
     ON CONFLICT(entity_id) DO UPDATE SET pinned = excluded.pinned`,
    entityId,
    pinned ? 1 : 0,
  );
}

/** Adds assignments only where the user has not already placed the device. */
export async function applyDefaultAssignments(
  db: Db,
  assignments: { entityId: string; roomId: string; pinned: boolean }[],
): Promise<void> {
  for (const a of assignments) {
    await db.runAsync(
      'INSERT OR IGNORE INTO device_refs (entity_id, room_id, pinned) VALUES (?, ?, ?)',
      a.entityId,
      a.roomId,
      a.pinned ? 1 : 0,
    );
  }
}
