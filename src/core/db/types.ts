/**
 * The subset of expo-sqlite's async API that HomeOS uses. Keeping repositories
 * on this interface (rather than the concrete class) lets tests run the same
 * SQL against Node's built-in sqlite.
 */
export type SQLiteBindValue = string | number | null;

export interface Db {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: SQLiteBindValue[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(source: string, ...params: SQLiteBindValue[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: SQLiteBindValue[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
