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
import { roomSessions } from "./rooms";
import { playerCards } from "./players";

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
  // imageUrl: text("image_url").notNull(),
  // description: text("description"),
  // deckId: uuid("deck_id")
  //   .notNull()
  //   .references(() => decks.id, { onDelete: "restrict" }),
});

// export const cardCategoriesRelations = relations(
//   cardCategories,
//   ({ many }) => ({
//     decks: many(decks),
//   }),
// );

// // Card Style Relations
// export const cardStylesRelations = relations(cardStyles, ({ many }) => ({
//   decks: many(decks),
// }));

// export const decksRelations = relations(decks, ({ one, many }) => ({
//   category: one(cardCategories, {
//     fields: [decks.cardCategoriesId],
//     references: [cardCategories.id],
//   }),
//   style: one(cardStyles, {
//     fields: [decks.cardStylesId],
//     references: [cardStyles.id],
//   }),
//   cards: many(cards),
//   roomSessions: many(roomSessions),
// }));

// // Card Relations
// export const cardsRelations = relations(cards, ({ one, many }) => ({
//   deck: one(decks, {
//     fields: [cards.deckId],
//     references: [decks.id],
//   }),
//   playerCards: many(playerCards),
// }));
