import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import { app } from '@tauri-apps/api';

let db: ReturnType<typeof drizzle>;

export async function initializeDatabase() {
  const appDataDir = await app.getAppDataDir();
  const dbPath = `${appDataDir}/notes.db`;
  
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
  
  // Run migrations
  migrate(db, { migrationsFolder: './drizzle' });
  
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
