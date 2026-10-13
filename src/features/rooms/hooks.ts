import { useCallback, useEffect, useState } from 'react';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';

import { listDeviceRefs, listRooms, type DeviceRef, type Room } from './repository';

export function useRoomsAndRefs() {
  const db = useDb();
  const { version } = useDataVersion();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refs, setRefs] = useState<DeviceRef[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.all([listRooms(db), listDeviceRefs(db)]).then(([r, d]) => {
      if (!cancelled) {
        setRooms(r);
        setRefs(d);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, version, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { rooms, refs, reload };
}
