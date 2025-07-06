import type { App } from "$server/src";
import { treaty } from "@elysiajs/eden";
import { PUBLIC_API } from "$env/static/public";

import { browser, dev } from "$app/environment";
import { isProduction } from "elysia/error";

// Environment check utilities
export const env = {
  // Check if in production environment
  isProduction: !dev,

  // Check if in development environment
  isDevelopment: dev,

  // Check NODE_ENV (fallback method)
  isNodeProduction:
    typeof process !== "undefined" && process.env.NODE_ENV === "production",
};
let api_ip = PUBLIC_API ?? "localhost:3000";

// Determine protocol based on environment
const getProtocol = () => {
  if (browser) {
    // In browser, use the same protocol as the current page
    return window.location.protocol === "https:" ? "https" : "http";
  }
  // Server-side fallback
  return "http";
};

export const PUBLIC_API_URL = `${getProtocol()}://${api_ip}`;
const native_api = treaty<App>(PUBLIC_API_URL);
export let api = native_api.api;
// if (env.isProduction) {
//   // In browser, use the same protocol as the current page
//   api = native_api.api;
// }

// Game session interfaces
export interface GameSession {
  roomId: string;
  playerId: string;
  playerName: string;
  lastActive: number; // timestamp
  gamePhase?: string; // for UI hints
  joinedAt: number; // timestamp
}

export interface GameSessionStorage {
  activeGameId: string | null; // Currently active game
  games: Record<string, GameSession>; // All game sessions
  maxSessions: number; // Limit for cleanup
}

const STORAGE_KEYS = {
  NICKNAME: "narrari_nickname",
  LAST_GAME: "narrari_last_game",
  GAME_SESSIONS: "narrari_game_sessions",
} as const;

const DEFAULT_SESSION_STORAGE: GameSessionStorage = {
  activeGameId: null,
  games: {},
  maxSessions: 5,
};

export const storage = {
  // Сохранить никнейм
  saveNickname: (nickname: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
    }
  },

  // Получить никнейм
  getNickname: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.NICKNAME);
    }
    return null;
  },

  // Очистить никнейм
  clearNickname: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.NICKNAME);
    }
  },

  // Сохранить ID последней игры
  saveLastGameId: (gameId: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LAST_GAME, gameId);
    }
  },

  // Получить ID последней игры
  getLastGameId: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.LAST_GAME);
    }
    return null;
  },

  // Game session management
  getGameSessions: (): GameSessionStorage => {
    if (typeof window === "undefined") {
      return DEFAULT_SESSION_STORAGE;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
      if (!stored) {
        return DEFAULT_SESSION_STORAGE;
      }

      const parsed = JSON.parse(stored) as GameSessionStorage;
      return {
        ...DEFAULT_SESSION_STORAGE,
        ...parsed,
      };
    } catch (error) {
      console.error("Failed to parse game sessions:", error);
      return DEFAULT_SESSION_STORAGE;
    }
  },

  saveGameSessions: (sessions: GameSessionStorage): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.GAME_SESSIONS,
        JSON.stringify(sessions),
      );
    }
  },

  // Add or update a game session
  addGameSession: (session: GameSession): void => {
    const sessions = storage.getGameSessions();

    // Update existing or add new session
    sessions.games[session.roomId] = {
      ...session,
      lastActive: Date.now(),
    };

    // Set as active game
    sessions.activeGameId = session.roomId;

    // Cleanup old sessions if we exceed the limit
    const sessionEntries = Object.entries(sessions.games);
    if (sessionEntries.length > sessions.maxSessions) {
      // Sort by lastActive and remove oldest
      sessionEntries.sort(([, a], [, b]) => b.lastActive - a.lastActive);
      const keepSessions = sessionEntries.slice(0, sessions.maxSessions);
      sessions.games = Object.fromEntries(keepSessions);
    }

    storage.saveGameSessions(sessions);
  },

  // Get active game session
  getActiveGameSession: (): GameSession | null => {
    const sessions = storage.getGameSessions();
    if (!sessions.activeGameId) {
      return null;
    }

    const session = sessions.games[sessions.activeGameId];
    if (!session) {
      // Clean up invalid active game ID
      sessions.activeGameId = null;
      storage.saveGameSessions(sessions);
      return null;
    }

    return session;
  },

  // Set active game
  setActiveGame: (roomId: string): void => {
    const sessions = storage.getGameSessions();
    if (sessions.games[roomId]) {
      sessions.activeGameId = roomId;
      sessions.games[roomId].lastActive = Date.now();
      storage.saveGameSessions(sessions);
    }
  },

  // Remove a game session
  removeGameSession: (roomId: string): void => {
    const sessions = storage.getGameSessions();
    delete sessions.games[roomId];

    // Clear active game if it was the removed one
    if (sessions.activeGameId === roomId) {
      sessions.activeGameId = null;
    }

    storage.saveGameSessions(sessions);
  },

  // Get all game sessions
  getAllGameSessions: (): GameSession[] => {
    const sessions = storage.getGameSessions();
    return Object.values(sessions.games).sort(
      (a, b) => b.lastActive - a.lastActive,
    );
  },

  // Clear all game sessions
  clearAllGameSessions: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.GAME_SESSIONS);
    }
  },

  // Update game session phase
  updateGameSessionPhase: (roomId: string, phase: string): void => {
    const sessions = storage.getGameSessions();
    if (sessions.games[roomId]) {
      sessions.games[roomId].gamePhase = phase;
      sessions.games[roomId].lastActive = Date.now();
      storage.saveGameSessions(sessions);
    }
  },

  // Check if a game session exists
  hasGameSession: (roomId: string): boolean => {
    const sessions = storage.getGameSessions();
    return roomId in sessions.games;
  },

  // Get specific game session
  getGameSession: (roomId: string): GameSession | null => {
    const sessions = storage.getGameSessions();
    return sessions.games[roomId] || null;
  },
};

export const ui = {
  // Генерировать случайный цвет для аватара игрока
  getPlayerColor: (playerId: string): string => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];

    const hash = playerId.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  },

  // Получить инициалы из никнейма
  getInitials: (nickname: string): string => {
    return nickname
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  },

  // Форматировать время
  formatTime: (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  },
};
