/// <reference types="node" />
/**
 * Test-only adapter: runs HomeOS SQL against Node's built-in SQLite so
 * repository tests exercise the real schema and queries.
 */
import { DatabaseSync } from 'node:sqlite';

import type { Db, SQLiteBindValue } from '@/core/db/types';

export function createTestDb(): Db & { close(): void } {
  const db = new DatabaseSync(':memory:');
  return {
    async execAsync(source: string) {
      db.exec(source);
    },
    async runAsync(source: string, ...params: SQLiteBindValue[]) {
      const r = db.prepare(source).run(...params);
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getFirstAsync<T>(source: string, ...params: SQLiteBindValue[]) {
      return (db.prepare(source).get(...params) as T | undefined) ?? null;
    },
    async getAllAsync<T>(source: string, ...params: SQLiteBindValue[]) {
      return db.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task: () => Promise<void>) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    close() {
      db.close();
    },
  };
}
