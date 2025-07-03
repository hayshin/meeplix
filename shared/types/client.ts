import type { Static } from "elysia";
import { t } from "elysia";
import { SubmittedCardSchema } from "./submitted_card";
import { CardSchema } from "./card";

// Define the base properties for all client messages
export const BaseClientMessageSchema = t.Object({
  roomId: t.String(),
  playerId: t.String(),
});

export const CreateRoomMessageSchema = t.Object({
  type: t.Literal("create_room"),
  name: t.String(),
});

export const JoinRoomMessageSchema = t.Object({
  type: t.Literal("join_room"),
  roomId: t.String(),
  name: t.String(),
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

export const LeaderPlayerChooseCardMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("leader_player_choose_card"),
  card: CardSchema,
  description: t.String(),
});

export const VoteMessageSchema = t.Object({
  ...BaseClientMessageSchema.properties,
  type: t.Literal("player_vote"),
  card: CardSchema,
});

export const SubmitCardMessageSchema = t.Object({
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
  VoteMessageSchema,
  SubmitCardMessageSchema,
]);

// Type exports

export type StartGameMessage = Static<typeof StartGameMessageSchema>;
export type ReadyMessage = Static<typeof ReadyMessageSchema>;
export type JoinRoomMessage = Static<typeof JoinRoomMessageSchema>;
export type CreateRoomMessage = Static<typeof CreateRoomMessageSchema>;
export type LeaderPlayerChooseCardMessage = Static<
  typeof LeaderPlayerChooseCardMessageSchema
>;
export type PlayerVoteMessage = Static<typeof VoteMessageSchema>;
export type PlayerChooseCardMessage = Static<typeof SubmitCardMessageSchema>;
export type ClientMessage = Static<typeof ClientMessageSchema>;

export type ClientMessageWithoutRoomState = ClientMessage extends infer M
  ? M extends { roomId: string; playerId: string }
    ? Omit<M, "roomId" | "playerId">
    : M
  : never;
