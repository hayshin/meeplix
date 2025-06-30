import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { roomSessions } from "./rooms";
import { cards } from "./cards";
import { relations } from "drizzle-orm";

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomSessionId: uuid("room_session_id")
    .notNull()
    .references(() => roomSessions.id, { onDelete: "cascade" }),
  nickname: text("nickname").notNull(),
  score: integer("score").default(0),
  cards: jsonb("cards")
    .$type<
      { id: string; title: string; imageUrl: string; description?: string }[]
    >()
    .default([]),
  isConnected: boolean("is_connected").default(true),
  isReady: boolean("is_ready").default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const playerCards = pgTable(
  "player_cards",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    roomSessionId: uuid("room_session_id")
      .notNull()
      .references(() => roomSessions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.playerId, table.cardId, table.roomSessionId],
    }),
  ],
);

export const playersRelations = relations(players, ({ one, many }) => ({
  roomSession: one(roomSessions, {
    fields: [players.roomSessionId],
    references: [roomSessions.id],
  }),
  playerCards: many(playerCards),
}));

export const playerCardsRelations = relations(playerCards, ({ one }) => ({
  player: one(players, {
    fields: [playerCards.playerId],
    references: [players.id],
  }),
  card: one(cards, {
    fields: [playerCards.cardId],
    references: [cards.id],
  }),
  roomSession: one(roomSessions, {
    fields: [playerCards.roomSessionId],
    references: [roomSessions.id],
  }),
}));
