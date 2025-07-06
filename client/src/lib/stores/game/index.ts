// Main exports for the game store
export { GameStore } from "./store.svelte";
export { ConnectionManager } from "./connection.svelte";
export { MessageHandlersManager } from "./message-handlers.svelte";
export { GameActionsManager } from "./actions.svelte";
export { GameHelpersManager } from "./helpers.svelte";

// Types
export type {
  GameState,
  GamePhase,
  GameActions,
  GameHelpers,
  GameDerivedState,
  ConnectionHandlers,
  MessageHandlers,
} from "./types";

// Create singleton instance
import { GameStore } from "./store.svelte";
export const gameStore = new GameStore();

// Composable functions for easier component usage
export const useGameStore = () => {
  return {
    // State
    state: gameStore.state,

    // Derived state
    isGameStarted: gameStore.isGameStarted,
    isCurrentPlayerLeader: gameStore.isCurrentPlayerLeader,
    currentLeader: gameStore.currentLeader,
    canStartGame: gameStore.canStartGame,
    allPlayersReady: gameStore.allPlayersReady,
    isGameFinished: gameStore.isGameFinished,
    readyPlayersCount: gameStore.readyPlayersCount,
    totalPlayersCount: gameStore.totalPlayersCount,

    // Connection actions
    createRoom: gameStore.createRoom,
    joinRoom: gameStore.joinRoom,
    reconnect: gameStore.reconnect,
    disconnect: gameStore.disconnect,

    // Game actions
    startGame: gameStore.startGame,
    setReady: gameStore.setReady,
    submitLeaderCard: gameStore.submitLeaderCard,
    submitPlayerCard: gameStore.submitPlayerCard,
    submitVote: gameStore.submitVote,
    startNextRound: gameStore.startNextRound,
    clearError: gameStore.clearError,

    // Helpers
    getCardById: gameStore.getCardById,
    getVotingCardById: gameStore.getVotingCardById,
    getPlayerById: gameStore.getPlayerById,
    canSubmitCard: gameStore.canSubmitCard,
    canVote: gameStore.canVote,
    canLeaderSubmitCard: gameStore.canLeaderSubmitCard,

    // Additional helpers
    getReadyPlayers: gameStore.getReadyPlayers,
    getOnlinePlayers: gameStore.getOnlinePlayers,
    hasCardInHand: gameStore.hasCardInHand,
    getHandSize: gameStore.getHandSize,
    getVotingCardsCount: gameStore.getVotingCardsCount,
    canPlayerAct: gameStore.canPlayerAct,

    // UI state helpers
    shouldShowReadyButton: gameStore.shouldShowReadyButton,
    shouldShowStartGameButton: gameStore.shouldShowStartGameButton,
    shouldShowLeaderCardSubmission: gameStore.shouldShowLeaderCardSubmission,
    shouldShowPlayerCardSubmission: gameStore.shouldShowPlayerCardSubmission,
    shouldShowVoting: gameStore.shouldShowVoting,
    shouldShowResults: gameStore.shouldShowResults,
    shouldShowNextRoundButton: gameStore.shouldShowNextRoundButton,

    // Phase checks
    isJoiningPhase: gameStore.isJoiningPhase,
    isLeaderSubmittingPhase: gameStore.isLeaderSubmittingPhase,
    isPlayersSubmittingPhase: gameStore.isPlayersSubmittingPhase,
    isVotingPhase: gameStore.isVotingPhase,
    isResultsPhase: gameStore.isResultsPhase,

    // Player info helpers
    getPlayerStatus: gameStore.getPlayerStatus,
    getPlayerNickname: gameStore.getPlayerNickname,
    getPlayerScore: gameStore.getPlayerScore,
    getWinner: gameStore.getWinner,
  };
};

// Shorthand exports for common usage patterns
export const useGameState = () => gameStore.state;

export const useGameActions = () => ({
  createRoom: gameStore.createRoom,
  joinRoom: gameStore.joinRoom,
  reconnect: gameStore.reconnect,
  startGame: gameStore.startGame,
  setReady: gameStore.setReady,
  submitLeaderCard: gameStore.submitLeaderCard,
  submitPlayerCard: gameStore.submitPlayerCard,
  submitVote: gameStore.submitVote,
  startNextRound: gameStore.startNextRound,
  disconnect: gameStore.disconnect,
  clearError: gameStore.clearError,
});

export const useGameHelpers = () => ({
  getCardById: gameStore.getCardById,
  getVotingCardById: gameStore.getVotingCardById,
  getPlayerById: gameStore.getPlayerById,
  canSubmitCard: gameStore.canSubmitCard,
  canVote: gameStore.canVote,
  canLeaderSubmitCard: gameStore.canLeaderSubmitCard,
  canPlayerAct: gameStore.canPlayerAct,
});

// Legacy compatibility (for gradual migration)
export const gameState = gameStore.state;
export const gameActions = {
  createRoom: gameStore.createRoom,
  joinRoom: gameStore.joinRoom,
  reconnect: gameStore.reconnect,
  startGame: gameStore.startGame,
  setReady: gameStore.setReady,
  submitLeaderCard: gameStore.submitLeaderCard,
  submitPlayerCard: gameStore.submitPlayerCard,
  submitVote: gameStore.submitVote,
  startNextRound: gameStore.startNextRound,
  disconnect: gameStore.disconnect,
  clearError: gameStore.clearError,
};

// Legacy derived state
export const isGameStarted = gameStore.isGameStarted;
export const isCurrentPlayerLeader = gameStore.isCurrentPlayerLeader;
export const currentLeader = gameStore.currentLeader;
export const canStartGame = gameStore.canStartGame;
export const allPlayersReady = gameStore.allPlayersReady;
export const isGameFinished = gameStore.isGameFinished;
export const readyPlayersCount = gameStore.readyPlayersCount;
export const totalPlayersCount = gameStore.totalPlayersCount;
