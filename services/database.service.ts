/**
 * Database Service
 * 
 * Handles SQLite database initialization, migrations, and connection management.
 * Uses expo-sqlite for local-only, offline-first data storage.
 */

import { DatabaseError } from '@/types';
import * as SQLite from 'expo-sqlite';

/**
 * Database configuration
 */
const DB_NAME = 'shopping_lists.db';
const CURRENT_SCHEMA_VERSION = 3;

/**
 * Database instance (singleton)
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and run migrations
 * 
 * @returns Promise resolving to the database instance
 * @throws DatabaseError if initialization fails
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    // Return existing instance if already initialized
    if (dbInstance) {
      return dbInstance;
    }

    // Open database connection
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable foreign key constraints (critical for cascade delete)
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    // Run migrations
    await runMigrations(dbInstance);

    console.log('[DatabaseService] Database initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('[DatabaseService] Failed to initialize database:', error);
    throw new DatabaseError(
      'Failed to initialize database',
      error
    );
  }
}

/**
 * Get the current database instance
 * 
 * @returns Database instance or null if not initialized
 */
export function getDatabase(): SQLite.SQLiteDatabase | null {
  return dbInstance;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('[DatabaseService] Database closed');
  }
}

/**
 * Run database migrations
 * 
 * @param db Database instance
 */
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Create schema_version table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );
    `);

    // Get current schema version
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    );
    const currentVersion = result?.version ?? 0;

    console.log(`[DatabaseService] Current schema version: ${currentVersion}`);

    // Run migrations sequentially
    if (currentVersion < 1) {
      await runMigrationV1(db);
    }

    // Future migrations would go here:
    if (currentVersion < 2) {
      await runMigrationV2(db);
    }

    if (currentVersion < 3) {
      await runMigrationV3(db);
    }

    console.log(`[DatabaseService] Migrations complete. Schema version: ${CURRENT_SCHEMA_VERSION}`);
  } catch (error) {
    console.error('[DatabaseService] Migration failed:', error);
    throw new DatabaseError('Database migration failed', error);
  }
}

/**
 * Migration V1: Initial schema
 * 
 * Creates shopping_lists and shopping_items tables with indexes
 */
async function runMigrationV1(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[DatabaseService] Running migration V1...');

  await db.execAsync(`
    -- Create shopping_lists table
    CREATE TABLE IF NOT EXISTS shopping_lists (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Create shopping_items table with foreign key
    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY NOT NULL,
      list_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (list_id) 
        REFERENCES shopping_lists(id) 
        ON DELETE CASCADE
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_lists_created 
      ON shopping_lists(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_items_list 
      ON shopping_items(list_id, created_at DESC);

    -- Record migration
    INSERT INTO schema_version (version, applied_at) 
    VALUES (1, ${Date.now()});
  `);

  console.log('[DatabaseService] Migration V1 complete');
}

/**
 * Migration V2: Add completed column to shopping_items
 * 
 * Adds a boolean completed field to track item completion status
 */
async function runMigrationV2(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[DatabaseService] Running migration V2...');

  await db.execAsync(`
    -- Add completed column with default value false (0)
    ALTER TABLE shopping_items 
    ADD COLUMN completed INTEGER NOT NULL DEFAULT 0;

    -- Record migration
    INSERT INTO schema_version (version, applied_at) 
    VALUES (2, ${Date.now()});
  `);

  console.log('[DatabaseService] Migration V2 complete');
}

/**
 * Migration V3: Add app_settings table
 * 
 * Creates table for storing user preferences like theme selection and custom colors
 */
async function runMigrationV3(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[DatabaseService] Running migration V3...');

  await db.execAsync(`
    -- Create app_settings table
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme_id TEXT NOT NULL DEFAULT 'default',
      custom_colors TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Insert default settings
    INSERT INTO app_settings (id, theme_id, custom_colors, created_at, updated_at)
    VALUES (1, 'default', NULL, ${Date.now()}, ${Date.now()});

    -- Record migration
    INSERT INTO schema_version (version, applied_at) 
    VALUES (3, ${Date.now()});
  `);

  console.log('[DatabaseService] Migration V3 complete');
}

/**
 * Execute a raw SQL query (for advanced use cases)
 * 
 * @param sql SQL query string
 * @param params Query parameters
 * @returns Query result
 * @throws DatabaseError if query fails
 */
export async function executeQuery<T>(
  sql: string,
  params?: SQLite.SQLiteBindParams
): Promise<T> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized. Call initializeDatabase() first.');
    }

    const result = params 
      ? await db.getFirstAsync<T>(sql, params)
      : await db.getFirstAsync<T>(sql);
    return result as T;
  } catch (error) {
    console.error('[DatabaseService] Query failed:', error);
    throw new DatabaseError('Database query failed', error);
  }
}

/**
 * Execute multiple SQL statements (for transactions)
 * 
 * @param statements Array of SQL statements
 * @throws DatabaseError if execution fails
 */
export async function executeTransaction(statements: string[]): Promise<void> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized. Call initializeDatabase() first.');
    }

    await db.execAsync(`
      BEGIN TRANSACTION;
      ${statements.join(';\n')}
      COMMIT;
    `);
  } catch (error) {
    console.error('[DatabaseService] Transaction failed:', error);
    throw new DatabaseError('Database transaction failed', error);
  }
}

/**
 * Clear all data (for testing/debugging only)
 * 
 * @throws DatabaseError if operation fails
 */
export async function clearAllData(): Promise<void> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    await db.execAsync(`
      DELETE FROM shopping_items;
      DELETE FROM shopping_lists;
    `);

    console.log('[DatabaseService] All data cleared');
  } catch (error) {
    console.error('[DatabaseService] Failed to clear data:', error);
    throw new DatabaseError('Failed to clear database', error);
  }
}
