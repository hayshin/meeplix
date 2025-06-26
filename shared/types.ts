import type {Static} from "elysia";
import {t} from "elysia";

export interface Card {
  id: string;
  imageUrl: string;
  description?: string;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  cards: Card[];
  isConnected: boolean;
  joinedAt: Date;
}

export interface GameSession {
  id: string;
  status: 'waiting' | 'leader_turn' | 'player_selection' | 'voting' | 'results' | 'finished';
  players: Player[];
  currentRound: number;
  leaderPlayerId?: string;
  currentAssociation?: string;
  roundData: {
    leaderCard?: Card;
    playerCards: { playerId: string; card: Card }[];
    votes: { playerId: string; cardId: string }[];
  };
  createdAt: string;
  maxPlayers: number;
}

export interface GameState {
  session: GameSession | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error?: string;
}

// WebSocket Events
export interface WSEvent {
  type: string;
  data: any;
}

export interface JoinGameEvent extends WSEvent {
  type: 'join_game';
  data: {
    gameId: string;
    nickname: string;
  };
}

export interface LeaderSelectsCardEvent extends WSEvent {
  type: 'leader_selects_card';
  data: {
    cardId: string;
    association: string;
  };
}

export interface PlayerSubmitsCardEvent extends WSEvent {
  type: 'player_submits_card';
  data: {
    cardId: string;
  };
}

export interface PlayerVotesEvent extends WSEvent {
  type: 'player_votes';
  data: {
    cardId: string;
  };
}

export interface StartGameEvent extends WSEvent {
  type: 'start_game';
  data: {};
}

export interface GameUpdateEvent extends WSEvent {
  type: 'game_update';
  data: {
    session: GameSession;
    playerId?: string;
  };
}

export interface ErrorEvent extends WSEvent {
  type: 'error';
  data: {
    message: string;
  };
}

export type WSEventType =
  | JoinGameEvent
  | LeaderSelectsCardEvent
  | PlayerSubmitsCardEvent
  | PlayerVotesEvent
  | StartGameEvent
  | GameUpdateEvent
  | ErrorEvent;

// Предопределенные карты для MVP
export const PREDEFINED_CARDS: Card[] = [
  { id: '1', imageUrl: '/cards/card1.svg', description: 'Солнце' },
  { id: '2', imageUrl: '/cards/card2.svg', description: 'Море' },
  { id: '3', imageUrl: '/cards/card3.svg', description: 'Лес' },
  { id: '4', imageUrl: '/cards/card4.svg', description: 'Город' },
  { id: '5', imageUrl: '/cards/card5.svg', description: 'Мечта' },
  { id: '6', imageUrl: '/cards/card1.svg', description: 'Дружба' },
  { id: '7', imageUrl: '/cards/card2.svg', description: 'Путешествие' },
  { id: '8', imageUrl: '/cards/card3.svg', description: 'Музыка' },
  { id: '9', imageUrl: '/cards/card4.svg', description: 'Танец' },
  { id: '10', imageUrl: '/cards/card5.svg', description: 'Книга' },
  { id: '11', imageUrl: '/cards/card1.svg', description: 'Дом' },
  { id: '12', imageUrl: '/cards/card2.svg', description: 'Семья' },
  { id: '13', imageUrl: '/cards/card3.svg', description: 'Работа' },
  { id: '14', imageUrl: '/cards/card4.svg', description: 'Любовь' },
  { id: '15', imageUrl: '/cards/card5.svg', description: 'Свобода' },
  { id: '16', imageUrl: '/cards/card1.svg', description: 'Смех' },
  { id: '17', imageUrl: '/cards/card2.svg', description: 'Грусть' },
  { id: '18', imageUrl: '/cards/card3.svg', description: 'Надежда' },
  { id: '19', imageUrl: '/cards/card4.svg', description: 'Время' },
  { id: '20', imageUrl: '/cards/card5.svg', description: 'Память' },
  { id: '21', imageUrl: '/cards/card1.svg', description: 'Тайна' },
  { id: '22', imageUrl: '/cards/card2.svg', description: 'Магия' },
  { id: '23', imageUrl: '/cards/card3.svg', description: 'Детство' },
  { id: '24', imageUrl: '/cards/card4.svg', description: 'Старость' },
  { id: '25', imageUrl: '/cards/card5.svg', description: 'Будущее' },
  { id: '26', imageUrl: '/cards/card1.svg', description: 'Прошлое' },
  { id: '27', imageUrl: '/cards/card2.svg', description: 'Настоящее' },
  { id: '28', imageUrl: '/cards/card3.svg', description: 'Удача' },
  { id: '29', imageUrl: '/cards/card4.svg', description: 'Успех' },
  { id: '30', imageUrl: '/cards/card5.svg', description: 'Победа' },
];

// Константы игры
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 8,
  MIN_PLAYERS: 3,
  CARDS_PER_PLAYER: 6,
  WINNING_SCORE: 20,
  POINTS_FOR_GUESSING_LEADER: 3,
  POINTS_FOR_LEADER_SUCCESS: 3,
  POINTS_PER_VOTE: 1,
} as const;
