import type { App } from "$server/src";
import { treaty } from "@elysiajs/eden";
import { PUBLIC_API } from "$env/static/public";

import { browser } from "$app/environment";

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
export const api = treaty<App>(PUBLIC_API_URL);

export const storage = {
  // Сохранить никнейм
  saveNickname: (nickname: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("narrari_nickname", nickname);
    }
  },

  // Получить никнейм
  getNickname: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("narrari_nickname");
    }
    return null;
  },

  // Очистить никнейм
  clearNickname: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("narrari_nickname");
    }
  },

  // Сохранить ID последней игры
  saveLastGameId: (gameId: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("narrari_last_game", gameId);
    }
  },

  // Получить ID последней игры
  getLastGameId: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("narrari_last_game");
    }
    return null;
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
