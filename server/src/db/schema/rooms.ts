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
import { decks } from "./cards";
import { relations } from "drizzle-orm";
import { playerCards, players } from "./players";

export const roomSessions = pgTable("room_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "restrict" }),
  roundNumber: integer("round_number").default(1),
  playerOrder: jsonb("player_order").$type<string[]>().default([]),
  leaderId: uuid("leader_id"),
  currentDescription: text("current_description"),
  choosedCards: jsonb("choosed_cards")
    .$type<{ playerId: string; cardId: string }[]>()
    .default([]),
  stage: text("stage").notNull().default("joining"),
  votedCards: jsonb("voted_cards")
    .$type<{ playerId: string; cardId: string }[]>()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const roomSessionsRelations = relations(
  roomSessions,
  ({ one, many }) => ({
    deck: one(decks, {
      fields: [roomSessions.deckId],
      references: [decks.id],
    }),
    players: many(players),
    playerCards: many(playerCards),
    leader: one(players, {
      fields: [roomSessions.leaderId],
      references: [players.id],
    }),
  }),
);
