import { get, type Writable } from "svelte/store";
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
  constructor(private state: Writable<GameState>) {}

  createRoom = (username: string, deckId: string) => {
    const currentState = get(this.state);
    if (currentState.isConnecting) return;

    const message: CreateRoomMessage = {
      type: "CREATE_ROOM",
      payload: { username, deckId },
    };

    this.sendMessage(message);
  };

  joinRoom = (roomId: string, username: string) => {
    const currentState = get(this.state);
    if (
      currentState.isConnecting ||
      currentState.isJoining ||
      currentState.currentPlayer
    )
      return;

    this.state.update((state) => ({
      ...state,
      roomId,
      isJoining: true,
    }));

    const message: JoinRoomMessage = {
      type: "JOIN_ROOM",
      payload: { username, roomId },
    };

    this.sendMessage(message);
  };

  startGame = () => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId) return;

    const message: StartGameMessage = {
      type: "START_GAME",
      payload: {
        playerId: currentState.currentPlayer.id,
        roomId: currentState.roomId,
      },
    };

    this.sendMessage(message);
  };

  setReady = () => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId) return;

    const message: ReadyMessage = {
      type: "READY",
      payload: {
        playerId: currentState.currentPlayer.id,
        roomId: currentState.roomId,
      },
    };

    this.sendMessage(message);
  };

  submitLeaderCard = (cardId: string, description: string) => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId)
      throw new Error("Player or room ID not found");

    const message: LeaderSubmitCardMessage = {
      type: "LEADER_SUBMIT_CARD",
      payload: {
        playerId: currentState.currentPlayer.id,
        cardId,
        roomId: currentState.roomId,
        description,
      },
    };

    this.sendMessage(message);
  };

  submitPlayerCard = (cardId: string) => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId) return;

    const message: PlayerSubmitCardMessage = {
      type: "SUBMIT_CARD",
      payload: {
        playerId: currentState.currentPlayer.id,
        cardId,
        roomId: currentState.roomId,
      },
    };

    this.sendMessage(message);
  };

  submitVote = (cardId: string) => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId) return;

    const message: VoteMessage = {
      type: "VOTE",
      payload: {
        playerId: currentState.currentPlayer.id,
        roomId: currentState.roomId,
        cardId,
      },
    };

    this.sendMessage(message);
  };

  startNextRound = () => {
    const currentState = get(this.state);
    if (!currentState.currentPlayer || !currentState.roomId) return;

    const message: NextRoundMessage = {
      type: "NEXT_ROUND",
      payload: {
        playerId: currentState.currentPlayer.id,
        roomId: currentState.roomId,
      },
    };

    this.sendMessage(message);
  };

  disconnect = () => {
    // Connection cleanup will be handled by ConnectionManager
    this.resetGameState();
  };

  clearError = () => {
    this.state.update((state) => ({
      ...state,
      error: null,
    }));
  };

  reconnectToRoom = (roomId: string, playerId: string, username: string) => {
    const currentState = get(this.state);
    if (currentState.isConnecting || currentState.isJoining) return;

    this.state.update((state) => ({
      ...state,
      roomId,
      isJoining: true,
    }));

    const message: ReconnectMessage = {
      type: "RECONNECT",
      payload: { roomId, playerId, username },
    };

    this.sendMessage(message);
  };

  private sendMessage = (message: ClientMessage) => {
    const currentState = get(this.state);
    if (!currentState.room || !currentState.isConnected) {
      console.error("WebSocket not connected");
      return;
    }

    try {
      console.log("Sending message:", message);
      currentState.room.send({ message });
    } catch (error) {
      console.error("Error sending message:", error);
      this.state.update((state) => ({
        ...state,
        error: "Failed to send message",
      }));
    }
  };

  private resetGameState = () => {
    const currentState = get(this.state);

    // Clear current game session from storage
    if (currentState.roomId) {
      storage.removeGameSession(currentState.roomId);
    }

    this.state.update((state) => ({
      ...state,
      roomId: null,
      currentPlayer: null,
      players: [],
      phase: "joining" as const,
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
      isJoining: false,
    }));
  };
}
