import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('sqlite.db');
export const db = drizzle({ client: sqlite });

// Инициализация базы данных
export async function initDB() {
  // Создаем таблицы, если их нет
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      current_round INTEGER DEFAULT 1,
      leader_player_id TEXT,
      association TEXT,
      round_data TEXT,
      created_at TEXT NOT NULL,
      max_players INTEGER DEFAULT 8
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      game_session_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      cards TEXT,
      is_connected INTEGER DEFAULT 1,
      joined_at TEXT NOT NULL
    )
  `);

  console.log('Database initialized');
}
