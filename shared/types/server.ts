import type { Static } from "elysia";
import { t } from "elysia";
import { CardSchema, CardCollection } from "./card";
import { PlayerCardSchema, PlayerCollection } from "./player";
import { PlayerSchema } from "./player";
import { CollectionSchema } from "./collection";
import { BaseEntity } from "./entity";
import { RoomStateSchema } from "./room";

export const CardCollectionSchema = t.Object({
  items: t.Array(CardSchema),
});

export const PlayerCardCollectionSchema = t.Object({
  items: t.Array(PlayerCardSchema),
});

export const RoomStateUpdateMessageSchema = t.Object({
  type: t.Literal("room_state_update"),
  roomState: RoomStateSchema,
});

export const StartRoundMessageSchema = t.Object({
  type: t.Literal("start_round"),
  roundNumber: t.Number(),
  currentHand: CardCollectionSchema,
});

export const RoomJoinedMessageSchema = t.Object({
  type: t.Literal("room_joined"),
  roomId: t.String(),
  playerId: t.String(),
});
export const RoomCreatedMessageSchema = t.Object({
  type: t.Literal("room_created"),
  roomId: t.String(),
  playerId: t.String(),
});

export const PlayersChooseCardMessageSchema = t.Object({
  type: t.Literal("players_choose_card"),
  currentHand: CardCollectionSchema,
});

export const BeginVoteMessageSchema = t.Object({
  type: t.Literal("begin_vote"),
  choosedCards: t.Array(CardSchema),
});

export const PointChangeSchema = t.Object({
  type: t.Literal("point_change"),
  playerId: t.String(),
  points: t.Number(),
});

export const EndVoteMessageSchema = t.Object({
  type: t.Literal("end_vote"),
  votedCards: PlayerCardCollectionSchema,
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
  RoomCreatedMessageSchema,
  RoomJoinedMessageSchema,
  RoomStateUpdateMessageSchema,
]);

// Type exports
export type StartRoundMessage = Static<typeof StartRoundMessageSchema>;
export type PlayersChooseCardMessage = Static<
  typeof PlayersChooseCardMessageSchema
>;
export type BeginVoteMessage = Static<typeof BeginVoteMessageSchema>;
export type PointChange = Static<typeof PointChangeSchema>;
export type EndVoteMessage = Static<typeof EndVoteMessageSchema>;
export type ErrorMessage = Static<typeof ErrorMessageSchema>;
export type EndGameMessage = Static<typeof EndGameMessageSchema>;
export type RoomCreatedMessage = Static<typeof RoomCreatedMessageSchema>;
export type RoomJoinedMessage = Static<typeof RoomJoinedMessageSchema>;
export type RoomStateUpdateMessage = Static<
  typeof RoomStateUpdateMessageSchema
>;
export type ServerMessage = Static<typeof ServerMessageSchema>;
