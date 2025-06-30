import type { Static } from "elysia";
import { t } from "elysia";
import { CardSchema } from "./card";
import { PlayerCardSchema, PlayerCollection } from "./player";
import { PlayerSchema } from "./player";
import { CollectionSchema } from "./collection";

export const RoomStageSchema = t.Union([
  t.Literal("joining"),
  t.Literal("leader_choosing"),
  t.Literal("players_choosing"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);

export const RoomStateSchema = t.Object({
  roomId: t.String(),
  players: CollectionSchema,
  deck: CollectionSchema,
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  choosedCards: CollectionSchema,
  stage: RoomStageSchema,
  votedCards: CollectionSchema,
});

export const StartRoundMessageSchema = t.Object({
  type: t.Literal("start_round"),
  roundNumber: t.Number(),
  currentHand: CollectionSchema,
});

export const PlayersChooseCardMessageSchema = t.Object({
  type: t.Literal("players_choose_card"),
  currentHand: CollectionSchema,
});

export const BeginVoteMessageSchema = t.Object({
  type: t.Literal("begin_vote"),
  choosedCards: CollectionSchema,
});

export const PointChangeSchema = t.Object({
  playerId: t.String(),
  points: t.Number(),
});

export const EndVoteMessageSchema = t.Object({
  type: t.Literal("end_vote"),
  votedCards: CollectionSchema,
  leaderCard: CardSchema,
  points: t.Array(PointChangeSchema),
});

export const ErrorMessageSchema = t.Object({
  type: t.Literal("error"),
  message: t.String(),
});

export const EndGameMessageSchema = t.Object({
  type: t.Literal("end_game"),
  winner: t.String(),
});

export const ServerMessageSchema = t.Union([
  StartRoundMessageSchema,
  PlayersChooseCardMessageSchema,
  PointChangeSchema,
  BeginVoteMessageSchema,
  EndVoteMessageSchema,
  ErrorMessageSchema,
  EndGameMessageSchema,
]);

// Type exports
export type RoomStage = Static<typeof RoomStageSchema>;
export type RoomState = Static<typeof RoomStateSchema>;
export type StartRoundMessage = Static<typeof StartRoundMessageSchema>;
export type PlayersChooseCardMessage = Static<
  typeof PlayersChooseCardMessageSchema
>;
export type BeginVoteMessage = Static<typeof BeginVoteMessageSchema>;
export type PointChange = Static<typeof PointChangeSchema>;
export type EndVoteMessage = Static<typeof EndVoteMessageSchema>;
export type ErrorMessage = Static<typeof ErrorMessageSchema>;
export type EndGameMessage = Static<typeof EndGameMessageSchema>;
export type ServerMessage = Static<typeof ServerMessageSchema>;
