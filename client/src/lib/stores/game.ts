import { writable, derived } from "svelte/store";
import type { PlayerEntity } from "$shared/types/player";
import { RoomStateEntity } from "$shared/types/room";
import { api } from "$/lib/utils";
import type { ClientMessage } from "$shared/types/client";
import type { ServerMessage } from "$shared/types/server";
import type { CardEntity } from "$shared/types/card";
// import type { WSEvent } from "$shared/types";

export interface GameState {
  currentPlayer: PlayerEntity | null;
  roomState: RoomStateEntity | null;
  isConnected: boolean;
  error: string | null;
  room: ReturnType<(typeof api)["ws"]["subscribe"]> | null;
}

// Основное состояние игры
export const gameState = writable<GameState>({
  roomState: null,
  currentPlayer: null,
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
  ($gameState) => $gameState.roomState?.currentDescription,
);

export const playersCount = derived(
  gameState,
  ($gameState) => $gameState.roomState?.players.size || 0,
);

// Действия для управления состоянием
export const gameActions = {
  // Подключение к игре
  connectToGame: (roomId: string, nickname: string) => {
    const room = api.ws.subscribe({ query: { roomId, playerId: nickname } });
    room.on("open", () => {
      console.log("WebSocket connected");
      gameState.update((state) => ({ ...state, isConnected: true, room }));

      // Отправляем запрос на присоединение к игре
      gameActions.sendMessage({
        roomId: roomId,
        type: "join_room",
        name: nickname,
      });
    });

    room.on("message", ({ data: message }) => {
      console.log("Get message");
      console.log(message);
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
        ws: null,
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
  handleWebSocketMessage: (message: ServerMessage | ClientMessage) => {
    switch (message.type) {
      case "game_update":
        gameState.update((state) => ({
          ...state,
          session: message.data.session,
          currentPlayer: message.data.playerId
            ? message.data.session.players.find(
                (p: Player) => p.id === message.data.playerId,
              ) || null
            : state.currentPlayer,
          error: null,
        }));
        break;

      case "error":
        gameState.update((state) => ({
          ...state,
          error: message.data.message,
        }));
        break;

      default:
        console.warn("Unknown WebSocket message type:", message.type);
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
        isConnected: false,
        error: null,
        room: null,
      };
    });
  },
};
