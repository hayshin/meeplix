import type { ClientMessage, ServerMessage } from "$shared/messages";
import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { Vote } from "$shared/models/vote";
import type { PublicRoomState } from "$shared/models/public_room";

export type GamePhase =
  | "joining"
  | "waiting_for_players"
  | "leader_submitting"
  | "players_submitting"
  | "voting"
  | "results"
  | "game_finished";

export interface GameState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isJoining: boolean;
  room: ReturnType<typeof import("$lib/utils").api.ws.subscribe> | null;

  // Game data
  roomId: string | null;
  currentPlayer: Player | null;
  players: Player[];

  // Game state
  phase: GamePhase;
  roundNumber: number;
  leaderId: string | null;
  currentDescription: string;

  // Cards
  currentHand: PublicCard[];
  cardsForVoting: PublicCard[];

  // Voting
  votes: Vote[];
  hasVoted: boolean;
  hasSubmittedCard: boolean;

  // UI state
  error: string | null;
  winner: Player | null;
}

export interface GameActions {
  createRoom: (username: string) => void;
  joinRoom: (roomId: string, username: string) => void;
  reconnectToRoom: (roomId: string, playerId: string, username: string) => void;
  startGame: () => void;
  setReady: () => void;
  submitLeaderCard: (cardId: string, description: string) => void;
  submitPlayerCard: (cardId: string) => void;
  submitVote: (cardId: string) => void;
  startNextRound: () => void;
  disconnect: () => void;
  clearError: () => void;
}

export interface GameHelpers {
  getCardById: (cardId: string) => PublicCard | null;
  getVotingCardById: (cardId: string) => PublicCard | null;
  getPlayerById: (playerId: string) => Player | null;
  canSubmitCard: () => boolean;
  canVote: () => boolean;
  canLeaderSubmitCard: () => boolean;
}

export interface GameDerivedState {
  isGameStarted: boolean;
  isCurrentPlayerLeader: boolean;
  currentLeader: Player | null;
  canStartGame: boolean;
  allPlayersReady: boolean;
  isGameFinished: boolean;
  readyPlayersCount: number;
  totalPlayersCount: number;
}

export interface ConnectionHandlers {
  onMessage: (data: any) => void;
  onClose: () => void;
  onError: (error: any) => void;
  onOpen: () => void;
}

export interface MessageHandlers {
  handlePlayerJoined: (player: Player) => void;
  handlePlayerReady: (playerId: string) => void;
  handlePlayerConnected: (player: Player) => void;
  handlePlayerDisconnected: (playerId: string) => void;
  handleStartRound: (currentHand: PublicCard[], leaderId: string) => void;
  handlePhaseChooseCard: (player: Player, description: string) => void;
  handlePlayerSubmitCard: (playerId: string) => void;
  handlePhaseBeginVote: (cardsForVoting: PublicCard[]) => void;
  handlePlayerVoted: (playerId: string) => void;
  handlePhaseEndVote: (
    votes: Vote[],
    leaderCardId: string,
    players: Player[],
  ) => void;
  handleEndGame: (winnerId: string) => void;
  handleRoomState: (player: Player, room: PublicRoomState) => void;
}

export const createInitialGameState = (): GameState => ({
  isConnected: false,
  isConnecting: false,
  isJoining: false,
  room: null,

  roomId: null,
  currentPlayer: null,
  players: [],

  phase: "joining",
  roundNumber: 0,
  leaderId: null,
  currentDescription: "",

  currentHand: [],
  cardsForVoting: [],

  votes: [],
  hasVoted: false,
  hasSubmittedCard: false,

  error: null,
  winner: null,
});
