import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { GameState, GameHelpers } from "./types";

export class GameHelpersManager implements GameHelpers {
  constructor(private state: GameState) {}

  getCardById = (cardId: string): PublicCard | null => {
    return this.state.currentHand.find((card) => card.id === cardId) || null;
  };

  getVotingCardById = (cardId: string): PublicCard | null => {
    return this.state.cardsForVoting.find((card) => card.id === cardId) || null;
  };

  getPlayerById = (playerId: string): Player | null => {
    return this.state.players.find((p) => p.id === playerId) || null;
  };

  canSubmitCard = (): boolean => {
    return (
      this.state.phase === "players_submitting" &&
      !this.state.hasSubmittedCard &&
      !this.isCurrentPlayerLeader()
    );
  };

  canVote = (): boolean => {
    return (
      this.state.phase === "voting" &&
      !this.state.hasVoted &&
      !this.isCurrentPlayerLeader()
    );
  };

  canLeaderSubmitCard = (): boolean => {
    return (
      this.state.phase === "leader_submitting" && this.isCurrentPlayerLeader()
    );
  };

  // Additional helper methods
  isCurrentPlayerLeader = (): boolean => {
    return this.state.currentPlayer?.id === this.state.leaderId;
  };

  getCurrentLeader = (): Player | null => {
    return this.state.players.find((p) => p.id === this.state.leaderId) || null;
  };

  getReadyPlayers = (): Player[] => {
    return this.state.players.filter((p) => p.status === "ready");
  };

  getOnlinePlayers = (): Player[] => {
    return this.state.players.filter((p) => p.status !== "offline");
  };

  canStartGame = (): boolean => {
    return (
      this.state.players.length >= 3 &&
      this.state.players.length <= 8 &&
      this.state.players.every((p) => p.status === "ready")
    );
  };

  allPlayersReady = (): boolean => {
    return (
      this.state.players.length > 0 &&
      this.state.players.every((p) => p.status === "ready")
    );
  };

  isGameStarted = (): boolean => {
    return this.state.phase !== "joining";
  };

  isGameFinished = (): boolean => {
    return this.state.phase === "game_finished";
  };

  getReadyPlayersCount = (): number => {
    return this.state.players.filter((p) => p.status === "ready").length;
  };

  getTotalPlayersCount = (): number => {
    return this.state.players.length;
  };

  getWinner = (): Player | null => {
    return this.state.winner;
  };

  // Card related helpers
  hasCardInHand = (cardId: string): boolean => {
    return this.state.currentHand.some((card) => card.id === cardId);
  };

  getHandSize = (): number => {
    return this.state.currentHand.length;
  };

  getVotingCardsCount = (): number => {
    return this.state.cardsForVoting.length;
  };

  // Phase related helpers
  isJoiningPhase = (): boolean => {
    return this.state.phase === "joining";
  };

  isLeaderSubmittingPhase = (): boolean => {
    return this.state.phase === "leader_submitting";
  };

  isPlayersSubmittingPhase = (): boolean => {
    return this.state.phase === "players_submitting";
  };

  isVotingPhase = (): boolean => {
    return this.state.phase === "voting";
  };

  isResultsPhase = (): boolean => {
    return this.state.phase === "results";
  };

  // Player status helpers
  getPlayerStatus = (playerId: string): string | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.status : null;
  };

  getPlayerNickname = (playerId: string): string | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.nickname : null;
  };

  getPlayerScore = (playerId: string): number | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.score : null;
  };

  // Game flow helpers
  canPlayerAct = (): boolean => {
    return (
      this.state.isConnected &&
      this.state.currentPlayer !== null &&
      this.state.phase !== "joining" &&
      this.state.phase !== "game_finished"
    );
  };

  shouldShowReadyButton = (): boolean => {
    return (
      this.state.phase === "joining" &&
      this.state.currentPlayer?.status !== "ready"
    );
  };

  shouldShowStartGameButton = (): boolean => {
    return (
      this.state.phase === "joining" &&
      this.canStartGame() &&
      this.isCurrentPlayerLeader()
    );
  };

  shouldShowLeaderCardSubmission = (): boolean => {
    return this.canLeaderSubmitCard();
  };

  shouldShowPlayerCardSubmission = (): boolean => {
    return this.canSubmitCard();
  };

  shouldShowVoting = (): boolean => {
    return this.canVote();
  };

  shouldShowResults = (): boolean => {
    return this.state.phase === "results";
  };

  shouldShowNextRoundButton = (): boolean => {
    return (
      this.state.phase === "results" &&
      this.isCurrentPlayerLeader() &&
      !this.isGameFinished()
    );
  };
}
