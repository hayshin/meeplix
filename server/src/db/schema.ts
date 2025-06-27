import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const gameSessions = sqliteTable("game_sessions", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  currentRound: integer("current_round").default(1),
  leaderPlayerId: text("leader_player_id"),
  association: text("association"),
  roundData: text("round_data"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .$type<Date>()
    .notNull(),
  maxPlayers: integer("max_players").default(8),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  gameSessionId: text("game_session_id").notNull(),
  nickname: text("nickname").notNull(),
  score: integer("score").default(0),
  cards: text("cards"), // JSON string
  isConnected: integer("is_connected", { mode: "boolean" }).default(true),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().$type<Date>(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
