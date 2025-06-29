import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password_hash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cardCategories = pgTable("card_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const cardStyles = pgTable("card_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const decks = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cardCategoriesId: uuid("card_categories_id")
    .notNull()
    .references(() => cardCategories.id, { onDelete: "restrict" }),
  cardStylesId: uuid("card_styles_id")
    .notNull()
    .references(() => cardStyles.id, { onDelete: "restrict" }),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  deckId: uuid("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "restrict" }),
});

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status").notNull(),
  currentRound: integer("current_round").default(1),
  leaderPlayerId: uuid("leader_player_id"),
  association: text("association"),
  roundData: text("round_data"), // JSON string
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameSessionId: uuid("game_session_id")
    .notNull()
    .references(() => gameSessions.id, { onDelete: "cascade" }),
  nickname: text("nickname").notNull(),
  score: integer("score").default(0),
  isConnected: boolean("is_connected").default(true),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const playerCards = pgTable(
  "player_cards",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }), // If player is deleted, remove their card associations
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }), // If card is deleted, remove its player associations
    sessionId: uuid("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }), // If session is deleted, remove its player-card associations
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.cardId, table.sessionId] })],
);

// Define Relations for easier querying with Drizzle

// Card Category Relations
export const cardCategoriesRelations = relations(cardCategories, ({ many }) => ({
  decks: many(decks),
}));

// Card Style Relations  
export const cardStylesRelations = relations(cardStyles, ({ many }) => ({
  decks: many(decks),
}));

// Deck Relations
export const decksRelations = relations(decks, ({ one, many }) => ({
  category: one(cardCategories, {
    fields: [decks.cardCategoriesId],
    references: [cardCategories.id],
  }),
  style: one(cardStyles, {
    fields: [decks.cardStylesId],
    references: [cardStyles.id],
  }),
  cards: many(cards),
}));

// Card Relations
export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  playerCards: many(playerCards),
}));

// Game Session Relations
export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  players: many(players),
  playerCards: many(playerCards),
}));

// Player Relations
export const playersRelations = relations(players, ({ one, many }) => ({
  gameSession: one(gameSessions, {
    fields: [players.gameSessionId],
    references: [gameSessions.id],
  }),
  playerCards: many(playerCards),
}));

// Player Cards Junction Table Relations
export const playerCardsRelations = relations(playerCards, ({ one }) => ({
  player: one(players, {
    fields: [playerCards.playerId],
    references: [players.id],
  }),
  card: one(cards, {
    fields: [playerCards.cardId],
    references: [cards.id],
  }),
  gameSession: one(gameSessions, {
    fields: [playerCards.sessionId],
    references: [gameSessions.id],
  }),
}));

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
