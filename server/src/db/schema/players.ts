// import {
//   pgTable,
//   text,
//   integer,
//   timestamp,
//   boolean,
//   uuid,
//   primaryKey,
//   jsonb,
// } from "drizzle-orm/pg-core";
// import { roomSessions } from "./rooms";
// import { cards } from "./cards";
// import { relations } from "drizzle-orm";

// export const players = pgTable("players", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   roomSessionId: uuid("room_session_id")
//     .notNull()
//     .references(() => roomSessions.id, { onDelete: "cascade" }),
//   nickname: text("nickname").notNull(),
//   score: integer("score").default(0),
//   cards: jsonb("cards")
//     .$type<
//       { id: string; title: string; imageUrl: string; description?: string }[]
//     >()
//     .default([]),
//   isConnected: boolean("is_connected").default(true),
//   isReady: boolean("is_ready").default(false),
//   joinedAt: timestamp("joined_at", { withTimezone: true })
//     .notNull()
//     .defaultNow(),
// });
