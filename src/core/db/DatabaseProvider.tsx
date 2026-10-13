import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { migrate } from './migrations';
import type { Db } from './types';

export const DATABASE_NAME = 'homeos.db';

/**
 * Opens the local household database and runs migrations before any screen
 * renders. Household data works fully offline and never depends on Home
 * Assistant.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={async (db: SQLiteDatabase) => void (await migrate(db))}>
      <DataVersionProvider>{children}</DataVersionProvider>
    </SQLiteProvider>
  );
}

export function useDb(): Db {
  return useSQLiteContext();
}

/**
 * A tiny change counter. Any write bumps it; screens include it in their load
 * effect's dependencies so lists refresh after edits made elsewhere (e.g. the
 * meal editor sheet).
 */
const DataVersionContext = createContext<{ version: number; bump: () => void }>({ version: 0, bump: () => undefined });

function DataVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ version, bump }), [version, bump]);
  return <DataVersionContext.Provider value={value}>{children}</DataVersionContext.Provider>;
}

export function useDataVersion() {
  return useContext(DataVersionContext);
}
