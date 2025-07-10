import { Card } from "../models/card.model";
import {
  createEmptyRoomState,
  createRoomState,
  RoomState,
} from "../models/room.model";
// roomId -> room
const rooms = new Map<string, RoomState>();

// room id -> set of player ids
const roomToPlayers = new Map<string, string[]>();

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
function createRoomId(): string {
  let id = generateId();
  while (rooms.has(id)) {
    id = generateId();
  }
  return id;
}

export function addRoom(deck: Card[]): RoomState {
  const id = createRoomId();
  const room = createEmptyRoomState(id);
  room.deck = deck;
  rooms.set(room.id, room);
  return room;
}

export function removeRoomById(id: string): void {
  rooms.delete(id);
}

export function getRoomById(id: string): RoomState {
  const room = rooms.get(id);
  if (!room) throw new Error("Room not found");
  return room;
}

export function addPlayerToRoom(roomId: string, playerId: string): void {
  if (!rooms.has(roomId)) {
    throw new Error("Room not found");
  }
  if (!roomToPlayers.has(roomId)) {
    roomToPlayers.set(roomId, []);
  }
  roomToPlayers.get(roomId)!.push(playerId);
}

export function removePlayerFromRoom(roomId: string, playerId: string): void {
  const players = roomToPlayers.get(roomId);
  if (!players) return;
  players.splice(players.indexOf(playerId), 1);
}

export function getPlayersIDsInRoom(roomId: string): string[] {
  return roomToPlayers.get(roomId) || [];
}

export function updateRoom(roomId: string, room: RoomState): void {
  rooms.set(roomId, room);
}
