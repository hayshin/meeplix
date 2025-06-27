import type { Static } from "elysia";
import { t } from "elysia";

// Card schema
export const CardSchema = t.Object({
  id: t.String(),
  title: t.String(),
  imageUrl: t.String(),
  description: t.Optional(t.String()),
});

export type Card = Static<typeof CardSchema>;

// Player schema
export const PlayerSchema = t.Object({
  id: t.String(),
  nickname: t.String(),
  score: t.Number(),
  cards: t.Array(CardSchema),
  isConnected: t.Boolean(),
  joinedAt: t.Date(),
});

export type Player = Static<typeof PlayerSchema>;

// GameSession schema
export const GameSessionSchema = t.Object({
  id: t.String(),
  status: t.Union([
    t.Literal("waiting"),
    t.Literal("leader_turn"),
    t.Literal("player_selection"),
    t.Literal("voting"),
    t.Literal("results"),
    t.Literal("finished"),
  ]),
  players: t.Array(PlayerSchema),
  currentRound: t.Number(),
  leaderPlayerId: t.Optional(t.String()),
  association: t.Optional(t.String()),
  roundData: t.Object({
    leaderCard: t.Optional(CardSchema),
    shuffledCards: t.Array(CardSchema),
    playerCards: t.Array(
      t.Object({
        playerId: t.String(),
        card: CardSchema,
      })
    ),
    selectedCards: t.Array(
      t.Object({
        playerId: t.String(),
        card: CardSchema,
      })
    ),

    votes: t.Array(
      t.Object({
        playerId: t.String(),
        cardId: t.String(),
      })
    ),
  }),
  createdAt: t.Date(),
  maxPlayers: t.Number(),
});

export type GameSession = Static<typeof GameSessionSchema>;

// GameState schema
export const GameStateSchema = t.Object({
  session: t.Optional(GameSessionSchema),
  currentPlayer: t.Optional(PlayerSchema),
  isConnected: t.Boolean(),
  error: t.Optional(t.String()),
});

export type GameState = Static<typeof GameStateSchema>;

// WebSocket Events
export const JoinGameEventSchema = t.Object({
  type: t.Literal("join_game"),
  data: t.Object({
    gameId: t.String(),
    nickname: t.String(),
  }),
});

export const LeaderSelectsCardEventSchema = t.Object({
  type: t.Literal("leader_selects_card"),
  data: t.Object({
    cardId: t.String(),
    association: t.String(),
  }),
});

export const PlayerSubmitsCardEventSchema = t.Object({
  type: t.Literal("player_submits_card"),
  data: t.Object({
    cardId: t.String(),
  }),
});

export const PlayerVotesEventSchema = t.Object({
  type: t.Literal("player_votes"),
  data: t.Object({
    cardId: t.String(),
  }),
});

export const StartGameEventSchema = t.Object({
  type: t.Literal("start_game"),
  data: t.Object({}),
});

export const GameUpdateEventSchema = t.Object({
  type: t.Literal("game_update"),
  data: t.Object({
    session: GameSessionSchema,
    playerId: t.Optional(t.String()),
  }),
});

export const ErrorEventSchema = t.Object({
  type: t.Literal("error"),
  data: t.Object({
    message: t.String(),
  }),
});

export const WSEventSchema = t.Union([
  JoinGameEventSchema,
  LeaderSelectsCardEventSchema,
  PlayerSubmitsCardEventSchema,
  PlayerVotesEventSchema,
  StartGameEventSchema,
  GameUpdateEventSchema,
  ErrorEventSchema,
]);

// Export types
export type WSEvent = Static<typeof WSEventSchema>;
export type JoinGameEvent = Static<typeof JoinGameEventSchema>;
export type LeaderSelectsCardEvent = Static<
  typeof LeaderSelectsCardEventSchema
>;
export type PlayerSubmitsCardEvent = Static<
  typeof PlayerSubmitsCardEventSchema
>;
export type PlayerVotesEvent = Static<typeof PlayerVotesEventSchema>;
export type StartGameEvent = Static<typeof StartGameEventSchema>;
export type GameUpdateEvent = Static<typeof GameUpdateEventSchema>;
export type ErrorEvent = Static<typeof ErrorEventSchema>;

// Game constants
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 3,
  CARDS_PER_PLAYER: 6,
  WINNING_SCORE: 20,
  POINTS_FOR_GUESSING_LEADER: 3,
  POINTS_FOR_LEADER_SUCCESS: 3,
  POINTS_PER_VOTE: 1,
} as const;
