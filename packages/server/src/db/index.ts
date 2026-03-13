import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), 'data')
mkdirSync(DATA_DIR, { recursive: true })

const sqlite = new Database(join(DATA_DIR, 'dragon-guard.db'))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

// Inicializace tabulek (jednoduchý bootstrap bez migrate CLI)
export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      background_image TEXT,
      width INTEGER NOT NULL DEFAULT 2000,
      height INTEGER NOT NULL DEFAULT 2000,
      grid_config TEXT NOT NULL,
      walls TEXT NOT NULL DEFAULT '[]',
      doors TEXT NOT NULL DEFAULT '[]',
      lights TEXT NOT NULL DEFAULT '[]',
      ambient_light REAL NOT NULL DEFAULT 0.3,
      fog_explored INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
      character_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'npc',
      image_url TEXT,
      grid_coord TEXT NOT NULL,
      pixel_x REAL NOT NULL DEFAULT 0,
      pixel_y REAL NOT NULL DEFAULT 0,
      hp INTEGER,
      hp_max INTEGER,
      conditions TEXT NOT NULL DEFAULT '[]',
      visible INTEGER NOT NULL DEFAULT 1,
      size INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      race TEXT,
      profession TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      stats TEXT NOT NULL DEFAULT '{}',
      inventory TEXT NOT NULL DEFAULT '[]',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journals (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      shared_with TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
}
