import { get, type Writable } from "svelte/store";
import type { ServerMessage } from "$shared/messages";
import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { Vote } from "$shared/models/vote";
import type { PublicRoomState } from "$shared/models/public_room";
import type { GameState, MessageHandlers } from "./types";
import { storage } from "$lib/utils";

export class MessageHandlersManager implements MessageHandlers {
  constructor(private state: Writable<GameState>) {}

  handleServerMessage = (message: ServerMessage) => {
    console.log("Processing server message:", message.type, message);

    // Clear any existing errors on successful message
    this.state.update((state) => ({
      ...state,
      error: null,
    }));

    switch (message.type) {
      case "ROOM_CREATED":
        console.log("Room created, setting roomId:", message.payload.roomId);
        this.state.update((state) => ({
          ...state,
          roomId: message.payload.roomId,
        }));
        // Auto-join the room after creation
        this.autoJoinRoom();
        break;

      case "ROOM_STATE":
        console.log("Room state received:", message.payload);
        this.handleRoomState(message.payload.player, message.payload.room);
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
        this.handleStartRound(
          message.payload.currentHand,
          message.payload.leaderId,
        );
        break;

      case "PHASE_CHOOSE_CARD":
        this.handlePhaseChooseCard(
          message.payload.player,
          message.payload.description,
        );
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
          message.payload.players,
        );
        break;

      case "END_GAME":
        this.handleEndGame(message.payload.winner);
        break;

      case "RECONNECT_SUCCESS":
        this.handleReconnectSuccess(
          message.payload.player,
          message.payload.room,
          message.payload.hand,
        );
        break;

      case "RECONNECT_FAILED":
        this.handleReconnectFailed(message.payload.message);
        break;

      case "ERROR":
        this.state.update((state) => ({
          ...state,
          error: message.payload.message,
          isJoining: false,
        }));
        break;

      default:
        console.warn("Unknown server message type:", message);
    }
  };

  handlePlayerJoined = (player: Player) => {
    console.log("Player joined:", player);
    const currentState = get(this.state);

    // Add player to list if not already present
    const existingIndex = currentState.players.findIndex(
      (p) => p.id === player.id,
    );

    const updatedPlayers = [...currentState.players];
    if (existingIndex === -1) {
      updatedPlayers.push(player);
    } else {
      updatedPlayers[existingIndex] = player;
    }

    // Set leader ID to first player if not already set
    let leaderId = currentState.leaderId;
    if (!leaderId && updatedPlayers.length === 1) {
      leaderId = player.id;
      console.log("Setting leader ID to first player:", player.id);
    }

    // If this is our player, set as current player
    let currentPlayer = currentState.currentPlayer;
    let isJoining = currentState.isJoining;
    if (!currentPlayer) {
      console.log("Setting current player:", player);
      currentPlayer = player;
      isJoining = false;

      // Save game session when we successfully join
      if (currentState.roomId) {
        storage.addGameSession({
          roomId: currentState.roomId,
          playerId: player.id,
          playerName: player.username,
          lastActive: Date.now(),
          gamePhase: currentState.phase,
          joinedAt: Date.now(),
        });
      }
    }

    this.state.update((state) => ({
      ...state,
      players: updatedPlayers,
      leaderId,
      currentPlayer,
      isJoining,
    }));
  };

  handlePlayerReady = (playerId: string) => {
    const currentState = get(this.state);
    const updatedPlayers = currentState.players.map((p) =>
      p.id === playerId ? { ...p, status: "ready" as const } : p,
    );

    this.state.update((state) => ({
      ...state,
      players: updatedPlayers,
    }));
  };

  handlePlayerConnected = (player: Player) => {
    this.handlePlayerJoined(player);
  };

  handlePlayerDisconnected = (playerId: string) => {
    const currentState = get(this.state);
    const updatedPlayers = currentState.players.map((p) =>
      p.id === playerId ? { ...p, status: "offline" as const } : p,
    );

    this.state.update((state) => ({
      ...state,
      players: updatedPlayers,
    }));
  };

  handleStartRound = (currentHand: PublicCard[], leaderId: string) => {
    console.log("Starting round");
    console.log("Current hand:", currentHand);
    console.log("Current leader:", leaderId);

    const currentState = get(this.state);
    console.log("Phase before:", currentState.phase);

    this.state.update((state) => ({
      ...state,
      phase: "leader_submitting" as const,
      currentHand,
      roundNumber: state.roundNumber + 1,
      hasSubmittedCard: false,
      hasVoted: false,
      votes: [],
      cardsForVoting: [],
      currentDescription: "",
      leaderId,
    }));

    console.log("Phase after: leader_submitting");

    // Update game session phase
    if (currentState.roomId) {
      storage.updateGameSessionPhase(currentState.roomId, "leader_submitting");
    }
  };

  handlePhaseChooseCard = (player: Player, description: string) => {
    const currentState = get(this.state);

    // Update player in list
    const updatedPlayers = currentState.players.map((p) =>
      p.id === player.id ? player : p,
    );

    this.state.update((state) => ({
      ...state,
      phase: "players_submitting" as const,
      players: updatedPlayers,
      currentDescription: description,
    }));
  };

  handlePlayerSubmitCard = (playerId: string) => {
    const currentState = get(this.state);
    if (playerId === currentState.currentPlayer?.id) {
      this.state.update((state) => ({
        ...state,
        hasSubmittedCard: true,
      }));
    }
  };

  handlePhaseBeginVote = (cardsForVoting: PublicCard[]) => {
    const currentState = get(this.state);

    this.state.update((state) => ({
      ...state,
      phase: "voting" as const,
      cardsForVoting,
    }));

    // Update game session phase
    if (currentState.roomId) {
      storage.updateGameSessionPhase(currentState.roomId, "voting");
    }
  };

  handlePlayerVoted = (playerId: string) => {
    const currentState = get(this.state);
    if (playerId === currentState.currentPlayer?.id) {
      this.state.update((state) => ({
        ...state,
        hasVoted: true,
      }));
    }
  };

  handlePhaseEndVote = (
    votes: Vote[],
    leaderCardId: string,
    players: Player[],
  ) => {
    const currentState = get(this.state);

    this.state.update((state) => ({
      ...state,
      phase: "results" as const,
      players,
      votes,
    }));

    // Update game session phase
    if (currentState.roomId) {
      storage.updateGameSessionPhase(currentState.roomId, "results");
    }
  };

  handleEndGame = (winnerId: string) => {
    const currentState = get(this.state);
    const winner = currentState.players.find((p) => p.id === winnerId) || null;

    this.state.update((state) => ({
      ...state,
      phase: "game_finished" as const,
      winner,
    }));

    // Update game session phase and remove it since game is finished
    if (currentState.roomId) {
      storage.updateGameSessionPhase(currentState.roomId, "game_finished");
      // Remove the session after a delay to let players see the results
      setTimeout(() => {
        if (currentState.roomId) {
          storage.removeGameSession(currentState.roomId);
        }
      }, 30000); // 30 seconds
    }
  };

  handleRoomState = (
    player: Player,
    room: PublicRoomState,
    hand?: PublicCard[],
  ) => {
    console.log("Handling room state - player:", player, "room:", room);

    // Map room stage to game phase
    let phase: GameState["phase"];
    switch (room.stage) {
      case "joining":
        phase = "joining";
        break;
      case "leader_submitting":
        phase = "leader_submitting";
        break;
      case "players_submitting":
        phase = "players_submitting";
        break;
      case "voting":
        phase = "voting";
        break;
      case "results":
        phase = "results";
        break;
      case "finished":
        phase = "game_finished";
        break;
      default:
        phase = "joining";
    }

    // Ensure current player is in the players list
    const updatedPlayers = [...room.players];
    const existingIndex = updatedPlayers.findIndex((p) => p.id === player.id);
    if (existingIndex === -1) {
      updatedPlayers.push(player);
    } else {
      updatedPlayers[existingIndex] = player;
    }

    this.state.update((state) => ({
      ...state,
      isJoining: false,
      currentPlayer: player,
      currentHand: hand || state.currentHand,
      roomId: room.id,
      roundNumber: room.roundNumber,
      leaderId: room.leaderId,
      currentDescription: room.currentDescription,
      votes: room.votes,
      cardsForVoting: room.submittedCards,
      players: updatedPlayers,
      phase,
    }));

    // Update or save game session with current room state
    storage.addGameSession({
      roomId: room.id,
      playerId: player.id,
      playerName: player.username,
      lastActive: Date.now(),
      gamePhase: room.stage,
      joinedAt: Date.now(),
    });
  };

  private autoJoinRoom = () => {
    const currentState = get(this.state);

    // Prevent multiple join attempts
    if (
      currentState.isConnecting ||
      currentState.isJoining ||
      currentState.currentPlayer
    ) {
      console.log(
        "Skipping auto-join - already connecting, joining, or player exists",
      );
      return;
    }

    // Get the stored nickname to auto-join
    const nickname = localStorage.getItem("narrari_nickname");
    console.log(
      "Auto-joining room with nickname:",
      nickname,
      "roomId:",
      currentState.roomId,
    );

    if (nickname && currentState.roomId) {
      // Set joining flag
      this.state.update((state) => ({
        ...state,
        isJoining: true,
      }));

      // Send join room message
      const message = {
        type: "JOIN_ROOM" as const,
        payload: {
          username: nickname,
          roomId: currentState.roomId,
        },
      };

      if (currentState.room && currentState.isConnected) {
        console.log("Sending JOIN_ROOM message:", message);
        currentState.room.send({ message });
      } else {
        console.log(
          "Cannot send JOIN_ROOM - no room connection or not connected",
        );
        this.state.update((state) => ({
          ...state,
          isJoining: false,
        }));
      }
    }
  };

  handleReconnectSuccess = (
    player: Player,
    room: PublicRoomState,
    hand?: PublicCard[],
  ) => {
    console.log("Reconnect successful:", player, room);

    // Handle the reconnection the same way as room state
    this.handleRoomState(player, room, hand);

    // Update the stored game session
    storage.addGameSession({
      roomId: room.id,
      playerId: player.id,
      playerName: player.username,
      lastActive: Date.now(),
      gamePhase: room.stage,
      joinedAt: Date.now(),
    });

    console.log("Successfully reconnected to game");
  };

  handleReconnectFailed = (message: string) => {
    console.log("Reconnect failed:", message);
    const currentState = get(this.state);

    // Clear stored session for this room if it exists
    if (currentState.roomId) {
      storage.removeGameSession(currentState.roomId);
    }

    this.state.update((state) => ({
      ...state,
      isJoining: false,
      error: `Reconnection failed: ${message}`,
      roomId: null,
      currentPlayer: null,
      phase: "joining" as const,
    }));

    console.log("Reconnection failed, cleared stored session");
  };
}
