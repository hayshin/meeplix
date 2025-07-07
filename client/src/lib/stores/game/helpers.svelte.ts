import { get, type Writable } from "svelte/store";
import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { GameState, GameHelpers } from "./types";

export class GameHelpersManager implements GameHelpers {
  constructor(private state: Writable<GameState>) {}

  getCardById = (cardId: string): PublicCard | null => {
    const currentState = get(this.state);
    return currentState.currentHand.find((card) => card.id === cardId) || null;
  };

  getVotingCardById = (cardId: string): PublicCard | null => {
    const currentState = get(this.state);
    return (
      currentState.cardsForVoting.find((card) => card.id === cardId) || null
    );
  };

  getPlayerById = (playerId: string): Player | null => {
    const currentState = get(this.state);
    return currentState.players.find((p) => p.id === playerId) || null;
  };

  canSubmitCard = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "players_submitting" &&
      !currentState.hasSubmittedCard &&
      !this.isCurrentPlayerLeader()
    );
  };

  canVote = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "voting" &&
      !currentState.hasVoted &&
      !this.isCurrentPlayerLeader()
    );
  };

  canLeaderSubmitCard = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "leader_submitting" && this.isCurrentPlayerLeader()
    );
  };

  // Additional helper methods
  isCurrentPlayerLeader = (): boolean => {
    const currentState = get(this.state);
    return currentState.currentPlayer?.id === currentState.leaderId;
  };

  getCurrentLeader = (): Player | null => {
    const currentState = get(this.state);
    return (
      currentState.players.find((p) => p.id === currentState.leaderId) || null
    );
  };

  getReadyPlayers = (): Player[] => {
    const currentState = get(this.state);
    return currentState.players.filter((p) => p.status === "ready");
  };

  getOnlinePlayers = (): Player[] => {
    const currentState = get(this.state);
    return currentState.players.filter((p) => p.status !== "offline");
  };

  canStartGame = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.players.length >= 3 &&
      currentState.players.length <= 8 &&
      currentState.players.every((p) => p.status === "ready")
    );
  };

  allPlayersReady = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.players.length > 0 &&
      currentState.players.every((p) => p.status === "ready")
    );
  };

  isGameStarted = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase !== "joining";
  };

  isGameFinished = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "game_finished";
  };

  getReadyPlayersCount = (): number => {
    const currentState = get(this.state);
    return currentState.players.filter((p) => p.status === "ready").length;
  };

  getTotalPlayersCount = (): number => {
    const currentState = get(this.state);
    return currentState.players.length;
  };

  getWinner = (): Player | null => {
    const currentState = get(this.state);
    return currentState.winner;
  };

  // Card related helpers
  hasCardInHand = (cardId: string): boolean => {
    const currentState = get(this.state);
    return currentState.currentHand.some((card) => card.id === cardId);
  };

  getHandSize = (): number => {
    const currentState = get(this.state);
    return currentState.currentHand.length;
  };

  getVotingCardsCount = (): number => {
    const currentState = get(this.state);
    return currentState.cardsForVoting.length;
  };

  // Phase related helpers
  isJoiningPhase = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "joining";
  };

  isLeaderSubmittingPhase = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "leader_submitting";
  };

  isPlayersSubmittingPhase = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "players_submitting";
  };

  isVotingPhase = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "voting";
  };

  isResultsPhase = (): boolean => {
    const currentState = get(this.state);
    return currentState.phase === "results";
  };

  // Player status helpers
  getPlayerStatus = (playerId: string): string | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.status : null;
  };

  getPlayerNickname = (playerId: string): string | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.username : null;
  };

  getPlayerScore = (playerId: string): number | null => {
    const player = this.getPlayerById(playerId);
    return player ? player.score : null;
  };

  // Game flow helpers
  canPlayerAct = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.isConnected &&
      currentState.currentPlayer !== null &&
      currentState.phase !== "joining" &&
      currentState.phase !== "game_finished"
    );
  };

  shouldShowReadyButton = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "joining" &&
      currentState.currentPlayer?.status !== "ready"
    );
  };

  shouldShowStartGameButton = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "joining" &&
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
    const currentState = get(this.state);
    return currentState.phase === "results";
  };

  shouldShowNextRoundButton = (): boolean => {
    const currentState = get(this.state);
    return (
      currentState.phase === "results" &&
      this.isCurrentPlayerLeader() &&
      !this.isGameFinished()
    );
  };
}
