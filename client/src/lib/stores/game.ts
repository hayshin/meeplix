import { writable, derived, get } from "svelte/store";
import { PlayerEntity, PlayerCollection, PlayerCardCollection, PlayerCardEntity } from "$shared/types/player";
import { RoomStateEntity, type RoomStateType } from "$shared/types/room";
import { api } from "$/lib/utils";
import type { ClientMessage } from "$shared/types/client";
import type { ServerMessage } from "$shared/types/server";
import { CardEntity, CardCollection } from "$shared/types/card";

export interface GameState {
  currentPlayer: PlayerEntity | null;
  roomState: RoomStateEntity | null;
  currentHand: CardCollection | null;
  roomId: string | null;
  playerId: string | null;
  isConnected: boolean;
  error: string | null;
  room: ReturnType<(typeof api)["ws"]["subscribe"]> | null;
}

// Основное состояние игры
export const gameState = writable<GameState>({
  roomState: null,
  currentPlayer: null,
  currentHand: null,
  roomId: null,
  playerId: null,
  isConnected: false,
  error: null,
  room: null,
});

// Производные состояния
export const isGameStarted = derived(
  gameState,
  ($gameState) => $gameState.roomState?.stage !== "joining",
);

export const isCurrentPlayerLeader = derived(
  gameState,
  ($gameState) =>
    $gameState.roomState?.leaderId === $gameState.currentPlayer?.id,
);

export const gamePhase = derived(
  gameState,
  ($gameState) => $gameState.roomState?.stage || "joining",
);

export const currentDescription = derived(
  gameState,
  ($gameState) => $gameState.roomState?.currentDescription || "",
);

export const playersCount = derived(
  gameState,
  ($gameState) => $gameState.roomState?.players.size || 0,
);

export const currentPlayerHand = derived(
  gameState,
  ($gameState) => $gameState.currentHand || new CardCollection([]),
);

export const canStartGame = derived(
  gameState,
  ($gameState) => $gameState.roomState?.canStartGame() || false,
);

export const allPlayersReady = derived(
  gameState,
  ($gameState) => $gameState.roomState?.players.every(p => p.isReady) || false,
);

export const gameWinner = derived(
  gameState,
  ($gameState) => $gameState.roomState?.getWinner(),
);

export const isGameFinished = derived(
  gameState,
  ($gameState) => $gameState.roomState?.isGameFinished() || false,
);

// Действия для управления состоянием
export const gameActions = {
  // Helper function to create RoomStateEntity from server data
  createRoomStateFromData: (data: RoomStateType): RoomStateEntity => {
    const players = new PlayerCollection(
      data.players.items.map((p) => new PlayerEntity(
        p.id,
        p.nickname,
        p.score,
        new CardCollection([]), // Client doesn't get other players' cards in room state
        p.isConnected,
        p.joinedAt,
        p.isReady
      ))
    );

    const deck = new CardCollection(
      data.deck.items.map((c) => CardEntity.fromType(c))
    );

    const choosedCards = new PlayerCardCollection(
      data.choosedCards.items.map((pc) => PlayerCardEntity.fromIds(pc.playerId, pc.cardId))
    );

    const votedCards = new PlayerCardCollection(
      data.votedCards.items.map((pc) => PlayerCardEntity.fromIds(pc.playerId, pc.cardId))
    );

    return new RoomStateEntity(
      data.id,
      players,
      deck,
      data.roundNumber,
      data.leaderId,
      data.currentDescription,
      choosedCards,
      data.stage,
      votedCards
    );
  },

  // Подключение к игре
  createRoom: (nickname: string) => {
    const room = api.ws.subscribe({ query: {} });

    room.on("open", () => {
      console.log("WebSocket connected");
      gameState.update((state) => ({ ...state, isConnected: true, room }));

      // Отправляем запрос на создание комнаты
      gameActions.sendMessage({
        type: "create_room",
        name: nickname,
      });
    });

    room.on("message", ({ data: message }) => {
      console.log("Received message:", message);
      try {
        if (message) {
          gameActions.handleWebSocketMessage(message as ServerMessage);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    room.on("close", () => {
      console.log("WebSocket disconnected");
      gameState.update((state) => ({
        ...state,
        isConnected: false,
        room: null,
      }));
    });

    room.on("error", (error) => {
      console.error("WebSocket error:", error);
      gameState.update((state) => ({
        ...state,
        error: "Connection error",
        isConnected: false,
      }));
    });
  },

  // Подключение к существующей игре
  joinRoom: (roomId: string, nickname: string) => {
    const room = api.ws.subscribe({ query: { roomId } });

    room.on("open", () => {
      console.log("WebSocket connected");
      gameState.update((state) => ({
        ...state,
        isConnected: true,
        room,
        roomId,
      }));

      // Отправляем запрос на присоединение к игре
      gameActions.sendMessage({
        type: "join_room",
        roomId: roomId,
        name: nickname,
      });
    });

    room.on("message", ({ data: message }) => {
      console.log("Received message:", message);
      try {
        if (message) {
          gameActions.handleWebSocketMessage(message as ServerMessage);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    room.on("close", () => {
      console.log("WebSocket disconnected");
      gameState.update((state) => ({
        ...state,
        isConnected: false,
        room: null,
      }));
    });

    room.on("error", (error) => {
      console.error("WebSocket error:", error);
      gameState.update((state) => ({
        ...state,
        error: "Connection error",
        isConnected: false,
      }));
    });
  },

  // Обработка сообщений WebSocket
  handleWebSocketMessage: (message: ServerMessage) => {
    switch (message.type) {
      case "room_created":
        gameState.update((state) => ({
          ...state,
          roomId: message.roomId,
          playerId: message.playerId,
          error: null,
        }));
        break;

      case "room_joined":
        gameState.update((state) => ({
          ...state,
          roomId: message.roomId,
          playerId: message.playerId,
          error: null,
        }));
        break;

      case "start_round":
        gameState.update((state) => ({
          ...state,
          currentHand: new CardCollection(
            message.currentHand.items.map((card) => CardEntity.fromType(card)),
          ),
          error: null,
        }));
        break;

      case "players_choose_card":
        gameState.update((state) => ({
          ...state,
          currentHand: new CardCollection(
            message.currentHand.items.map((card) => CardEntity.fromType(card)),
          ),
          error: null,
        }));
        break;

      case "room_state_update":
        gameState.update((state) => {
          const roomState = gameActions.createRoomStateFromData(message.roomState);
          return {
            ...state,
            roomState,
            currentPlayer: state.playerId ? (roomState.players.get(state.playerId) || state.currentPlayer) : state.currentPlayer,
            error: null,
          };
        });
        break;

      case "begin_vote":
        gameState.update((state) => ({
          ...state,
          error: null,
        }));
        break;

      case "end_vote":
        gameState.update((state) => ({
          ...state,
          error: null,
        }));
        break;

      case "point_change":
        // Handle individual point changes if needed
        break;

      case "end_game":
        gameState.update((state) => ({
          ...state,
          error: null,
        }));
        break;

      case "error":
        gameState.update((state) => ({
          ...state,
          error: message.message,
        }));
        break;

      default:
        console.warn("Unknown WebSocket message type:", message);
    }
  },

  // Отправка сообщения через WebSocket
  sendMessage: (message: ClientMessage) => {
    gameState.update((state) => {
      if (state.room && state.isConnected) {
        state.room.send({ message });
      } else {
        console.error("WebSocket not connected");
      }
      return state;
    });
  },

  // Отправка готовности
  sendReady: () => {
    gameActions.sendMessage({
      type: "ready",
    });
  },

  // Игровые действия
  startGame: () => {
    gameActions.sendMessage({
      type: "start_game",
    });
  },

  leaderSelectsCard: (card: CardEntity, description: string) => {
    gameActions.sendMessage({
      type: "leader_player_choose_card",
      card,
      description,
    });
  },

  playerSubmitsCard: (card: CardEntity) => {
    gameActions.sendMessage({
      type: "player_choose_card",
      card,
    });
  },

  playerVotes: (card: CardEntity) => {
    gameActions.sendMessage({
      type: "player_vote",
      card,
    });
  },

  // Player ready toggle
  setPlayerReady: (isReady: boolean = true) => {
    // Note: This might need to be implemented as a separate message type
    // For now, using the ready message
    if (isReady) {
      gameActions.sendReady();
    }
  },

  // Get current player's cards
  getCurrentPlayerCards: (): CardCollection => {
    const state = get(gameState);
    return state.currentHand || new CardCollection([]);
  },

  // Get room players (excluding current player's private data)
  getRoomPlayers: (): PlayerEntity[] => {
    const state = get(gameState);
    return state.roomState?.players.toArray() || [];
  },

  // Check if current player can perform actions
  canPlayerAct: (): boolean => {
    const state = get(gameState);
    return state.isConnected && state.currentPlayer !== null && state.roomState !== null;
  },

  // Очистка ошибки
  clearError: () => {
    gameState.update((state) => ({ ...state, error: null }));
  },

  // Отключение от игры
  disconnect: () => {
    gameState.update((state) => {
      if (state.room) {
        state.room.close();
      }
      return {
        roomState: null,
        currentPlayer: null,
        currentHand: null,
        roomId: null,
        playerId: null,
        isConnected: false,
        error: null,
        room: null,
      };
    });
  },
};
