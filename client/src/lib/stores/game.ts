import { writable, derived } from "svelte/store";
import type { Player } from "$shared/types";
import { RoomState } from "$shared/types/server";
import { api } from "$/lib/utils";
import type { WSEvent } from "$shared/types";

export interface GameState {
  session: GameSession | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  room: ReturnType<(typeof api)["ws"]["subscribe"]> | null;
}

// Основное состояние игры
export const gameState = writable<GameState>({
  session: null,
  currentPlayer: null,
  isConnected: false,
  error: null,
  room: null,
});

// Производные состояния
export const isGameStarted = derived(
  gameState,
  ($gameState) => $gameState.session?.status !== "waiting",
);

export const isCurrentPlayerLeader = derived(
  gameState,
  ($gameState) =>
    $gameState.session?.leaderPlayerId === $gameState.currentPlayer?.id,
);

export const gamePhase = derived(
  gameState,
  ($gameState) => $gameState.session?.status || "waiting",
);

export const currentAssociation = derived(
  gameState,
  ($gameState) => $gameState.session?.association,
);

export const playersCount = derived(
  gameState,
  ($gameState) => $gameState.session?.players.length || 0,
);

// Действия для управления состоянием
export const gameActions = {
  // Подключение к игре
  connectToGame: (gameId: string, nickname: string) => {
    const room = api.ws.subscribe({ query: { gameId, playerId: nickname } });
    room.on("open", () => {
      console.log("WebSocket connected");
      gameState.update((state) => ({ ...state, isConnected: true, room }));

      // Отправляем запрос на присоединение к игре
      room.send({
        type: "join_game",
        data: { gameId, nickname },
      });
    });

    room.on("message", ({ data }) => {
      console.log("Get message");
      console.log(data);
      try {
        if (data) {
          gameActions.handleWebSocketMessage(data as WSEvent);
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
  handleWebSocketMessage: (event: WSEvent) => {
    switch (event.type) {
      case "game_update":
        gameState.update((state) => ({
          ...state,
          session: event.data.session,
          currentPlayer: event.data.playerId
            ? event.data.session.players.find(
                (p: Player) => p.id === event.data.playerId,
              ) || null
            : state.currentPlayer,
          error: null,
        }));
        break;

      case "error":
        gameState.update((state) => ({
          ...state,
          error: event.data.message,
        }));
        break;

      default:
        console.warn("Unknown WebSocket message type:", event.type);
    }
  },

  // Отправка сообщения через WebSocket
  sendMessage: (message: WSEvent) => {
    gameState.update((state) => {
      if (state.room && state.isConnected) {
        state.room.send(message);
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
      data: {},
    });
  },

  leaderSelectsCard: (cardId: string, association: string) => {
    gameActions.sendMessage({
      type: "leader_selects_card",
      data: { cardId, association },
    });
  },

  playerSubmitsCard: (cardId: string) => {
    gameActions.sendMessage({
      type: "player_submits_card",
      data: { cardId },
    });
  },

  playerVotes: (cardId: string) => {
    gameActions.sendMessage({
      type: "player_votes",
      data: { cardId },
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
        session: null,
        currentPlayer: null,
        isConnected: false,
        error: null,
        room: null,
      };
    });
  },
};
