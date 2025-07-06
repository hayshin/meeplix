import type { ServerMessage } from "$shared/messages";
import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { Vote } from "$shared/models/vote";
import type { GameState, MessageHandlers } from "./types";

export class MessageHandlersManager implements MessageHandlers {
  constructor(private state: GameState) {}

  handleServerMessage = (message: ServerMessage) => {
    console.log("Processing server message:", message.type, message);

    // Clear any existing errors on successful message
    this.state.error = null;

    switch (message.type) {
      case "ROOM_CREATED":
        this.state.roomId = message.payload.roomId;
        // Navigation will be handled by component
        break;

      case "PLAYER_JOINED":
        this.handlePlayerJoined(message.payload.player);
        break;

      case "PLAYER_READY":
        this.handlePlayerReady(message.payload.playerId);
        break;

      case "PLAYER_CONNECTED":
        this.handlePlayerConnected(message.payload.player);
        break;

      case "PLAYER_DISCONNECTED":
        this.handlePlayerDisconnected(message.payload.playerId);
        break;

      case "START_ROUND":
        this.handleStartRound(message.payload.currentHand);
        break;

      case "PHASE_CHOOSE_CARD":
        this.handlePhaseChooseCard(message.payload.player);
        break;

      case "PLAYER_SUBMIT_CARD":
        this.handlePlayerSubmitCard(message.payload.playerId);
        break;

      case "PHASE_BEGIN_VOTE":
        this.handlePhaseBeginVote(message.payload.cardsForVoting);
        break;

      case "PLAYER_VOTED":
        this.handlePlayerVoted(message.payload.playerId);
        break;

      case "PHASE_END_VOTE":
        this.handlePhaseEndVote(
          message.payload.votes,
          message.payload.leaderCardId,
        );
        break;

      case "END_GAME":
        this.handleEndGame(message.payload.winner);
        break;

      case "ERROR":
        this.state.error = message.payload.message;
        break;

      default:
        console.warn("Unknown server message type:", message);
    }
  };

  handlePlayerJoined = (player: Player) => {
    // Add player to list if not already present
    const existingIndex = this.state.players.findIndex(
      (p) => p.id === player.id,
    );
    if (existingIndex === -1) {
      this.state.players.push(player);
    } else {
      this.state.players[existingIndex] = player;
    }

    // If this is our player, set as current player
    if (!this.state.currentPlayer) {
      this.state.currentPlayer = player;
    }
  };

  handlePlayerReady = (playerId: string) => {
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.status = "ready";
    }
  };

  handlePlayerConnected = (player: Player) => {
    this.handlePlayerJoined(player);
  };

  handlePlayerDisconnected = (playerId: string) => {
    const player = this.state.players.find((p) => p.id === playerId);
    if (player) {
      player.status = "offline";
    }
  };

  handleStartRound = (currentHand: PublicCard[]) => {
    this.state.phase = "leader_submitting";
    this.state.currentHand = currentHand;
    this.state.roundNumber += 1;
    this.state.hasSubmittedCard = false;
    this.state.hasVoted = false;
    this.state.votes = [];
    this.state.cardsForVoting = [];
    this.state.currentDescription = "";
  };

  handlePhaseChooseCard = (player: Player) => {
    this.state.phase = "players_submitting";
    // Update player in list
    const existingIndex = this.state.players.findIndex(
      (p) => p.id === player.id,
    );
    if (existingIndex !== -1) {
      this.state.players[existingIndex] = player;
    }
  };

  handlePlayerSubmitCard = (playerId: string) => {
    if (playerId === this.state.currentPlayer?.id) {
      this.state.hasSubmittedCard = true;
    }
  };

  handlePhaseBeginVote = (cardsForVoting: PublicCard[]) => {
    this.state.phase = "voting";
    this.state.cardsForVoting = cardsForVoting;
  };

  handlePlayerVoted = (playerId: string) => {
    if (playerId === this.state.currentPlayer?.id) {
      this.state.hasVoted = true;
    }
  };

  handlePhaseEndVote = (votes: Vote[], leaderCardId: string) => {
    this.state.phase = "results";
    this.state.votes = votes;
    // Update player scores here if needed
  };

  handleEndGame = (winnerId: string) => {
    this.state.phase = "game_finished";
    this.state.winner =
      this.state.players.find((p) => p.id === winnerId) || null;
  };
}
