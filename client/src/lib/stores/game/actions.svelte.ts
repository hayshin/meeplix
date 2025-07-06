import type {
  ClientMessage,
  CreateRoomMessage,
  JoinRoomMessage,
  StartGameMessage,
  ReadyMessage,
  LeaderSubmitCardMessage,
  PlayerSubmitCardMessage,
  VoteMessage,
  NextRoundMessage,
  ReconnectMessage,
} from "$shared/messages";
import type { GameState, GameActions } from "./types";
import { storage } from "$lib/utils";

export class GameActionsManager implements GameActions {
  constructor(private state: GameState) {}

  createRoom = (username: string) => {
    if (this.state.isConnecting) return;

    const message: CreateRoomMessage = {
      type: "CREATE_ROOM",
      payload: { username },
    };

    this.sendMessage(message);
  };

  joinRoom = (roomId: string, username: string) => {
    if (
      this.state.isConnecting ||
      this.state.isJoining ||
      this.state.currentPlayer
    )
      return;

    this.state.roomId = roomId;
    this.state.isJoining = true;

    const message: JoinRoomMessage = {
      type: "JOIN_ROOM",
      payload: { username, roomId },
    };

    this.sendMessage(message);
  };

  startGame = () => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: StartGameMessage = {
      type: "START_GAME",
      payload: {
        playerId: this.state.currentPlayer.id,
        roomId: this.state.roomId,
      },
    };

    this.sendMessage(message);
  };

  setReady = () => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: ReadyMessage = {
      type: "READY",
      payload: {
        playerId: this.state.currentPlayer.id,
        roomId: this.state.roomId,
      },
    };

    this.sendMessage(message);
  };

  submitLeaderCard = (cardId: string, description: string) => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: LeaderSubmitCardMessage = {
      type: "LEADER_SUBMIT_CARD",
      payload: {
        playerId: this.state.currentPlayer.id,
        cardId,
        roomId: this.state.roomId,
        description,
      },
    };

    this.sendMessage(message);
  };

  submitPlayerCard = (cardId: string) => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: PlayerSubmitCardMessage = {
      type: "SUBMIT_CARD",
      payload: {
        playerId: this.state.currentPlayer.id,
        cardId,
        roomId: this.state.roomId,
      },
    };

    this.sendMessage(message);
  };

  submitVote = (cardId: string) => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: VoteMessage = {
      type: "VOTE",
      payload: {
        playerId: this.state.currentPlayer.id,
        roomId: this.state.roomId,
        cardId,
      },
    };

    this.sendMessage(message);
  };

  startNextRound = () => {
    if (!this.state.currentPlayer || !this.state.roomId) return;

    const message: NextRoundMessage = {
      type: "NEXT_ROUND",
      payload: {
        playerId: this.state.currentPlayer.id,
        roomId: this.state.roomId,
      },
    };

    this.sendMessage(message);
  };

  disconnect = () => {
    // Connection cleanup will be handled by ConnectionManager
    this.resetGameState();
  };

  clearError = () => {
    this.state.error = null;
  };

  reconnectToRoom = (roomId: string, playerId: string, username: string) => {
    if (this.state.isConnecting || this.state.isJoining) return;

    this.state.roomId = roomId;
    this.state.isJoining = true;

    const message: ReconnectMessage = {
      type: "RECONNECT",
      payload: { roomId, playerId, username },
    };

    this.sendMessage(message);
  };

  private sendMessage = (message: ClientMessage) => {
    if (!this.state.room || !this.state.isConnected) {
      console.error("WebSocket not connected");
      return;
    }

    try {
      console.log("Sending message:", message);
      this.state.room.send({ message });
    } catch (error) {
      console.error("Error sending message:", error);
      this.state.error = "Failed to send message";
    }
  };

  private resetGameState = () => {
    // Clear current game session from storage
    if (this.state.roomId) {
      storage.removeGameSession(this.state.roomId);
    }

    this.state.roomId = null;
    this.state.currentPlayer = null;
    this.state.players = [];
    this.state.phase = "joining";
    this.state.roundNumber = 0;
    this.state.leaderId = null;
    this.state.currentDescription = "";
    this.state.currentHand = [];
    this.state.cardsForVoting = [];
    this.state.votes = [];
    this.state.hasVoted = false;
    this.state.hasSubmittedCard = false;
    this.state.error = null;
    this.state.winner = null;
    this.state.isJoining = false;
  };
}
