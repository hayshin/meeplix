import type { Static } from "elysia";
import { t } from "elysia";
import { PairHandSchema } from "./pair";
import { CardSchema } from "./card";

// Define the base properties for all client messages
export const BaseClientMessageSchema = t.Object({
  // roomId: t.String(),
});

// Use spread of BaseClientMessageSchema.properties for each message schema

export const StartGameMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("start_game"),
});

export const ReadyMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("ready"),
});

export const JoinRoomMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("join_room"),
  roomId: t.String(),
  name: t.String(),
});

export const CreateRoomMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("create_room"),
  name: t.String(),
});

export const LeaderPlayerChooseCardMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("leader_player_choose_card"),
  card: CardSchema,
  description: t.String(),
});

export const PlayerVoteMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("player_vote"),
  card: CardSchema,
});

export const PlayerChooseCardMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("player_choose_card"),
  card: CardSchema,
});

export const ClientMessageSchema = t.Union([
  ReadyMessageSchema,
  JoinRoomMessageSchema,
  StartGameMessageSchema,
  CreateRoomMessageSchema,
  LeaderPlayerChooseCardMessageSchema,
  PlayerVoteMessageSchema,
  PlayerChooseCardMessageSchema,
]);

// Type exports
export type ReadyMessage = Static<typeof ReadyMessageSchema>;
export type JoinRoomMessage = Static<typeof JoinRoomMessageSchema>;
export type CreateRoomMessage = Static<typeof CreateRoomMessageSchema>;
export type LeaderPlayerChooseCardMessage = Static<
  typeof LeaderPlayerChooseCardMessageSchema
>;
export type PlayerVoteMessage = Static<typeof PlayerVoteMessageSchema>;
export type PlayerChooseCardMessage = Static<
  typeof PlayerChooseCardMessageSchema
>;
export type ClientMessage = Static<typeof ClientMessageSchema>;
