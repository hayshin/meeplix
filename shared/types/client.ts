import type { Static } from "elysia";
import { t } from "elysia";
import { PlayerCardSchema } from "./player";

export const ReadyMessageSchema = t.Object({
  type: t.Literal("ready"),
});

export const JoinRoomMessageSchema = t.Object({
  type: t.Literal("join_room"),
  roomId: t.String(),
  name: t.String(),
});

export const CreateRoomMessageSchema = t.Object({
  type: t.Literal("create_room"),
  name: t.String(),
});

export const LeaderPlayerChooseCardMessageSchema = t.Object({
  type: t.Literal("leader_player_choose_card"),
  playerCard: PlayerCardSchema,
});

export const PlayerVoteMessageSchema = t.Object({
  type: t.Literal("player_vote"),
  playerCard: PlayerCardSchema,
});

export const PlayerChooseCardMessageSchema = t.Object({
  type: t.Literal("player_choose_card"),
  playerCard: PlayerCardSchema,
});

export const ClientMessageSchema = t.Union([
  ReadyMessageSchema,
  JoinRoomMessageSchema,
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
