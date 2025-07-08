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
import { relations } from "drizzle-orm";

export const decks = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  ai_model: text("model"),
  ai_provider: text("provider"),
  // creatorId: uuid("creator_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  ai_prompt: text("prompt").notNull(),
});

export const deckCards = pgTable("deck_cards", {
  deckId: uuid("deck_id").notNull(),
  cardId: uuid("card_id").notNull(),
});

export const deckCardsRelations = relations(deckCards, ({ one }) => ({
  deck: one(decks, {
    fields: [deckCards.deckId],
    references: [decks.id],
  }),
  card: one(cards, {
    fields: [deckCards.cardId],
    references: [cards.id],
  }),
}));
