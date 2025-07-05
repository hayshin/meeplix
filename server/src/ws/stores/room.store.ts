import {
  createEmptyRoomState,
  createRoomState,
  RoomState,
} from "../models/room.model";
// roomId -> room
const rooms = new Map<string, RoomState>();

export function addRoom(deckId?: string): RoomState {
  const room = createEmptyRoomState();
  rooms.set(room.id, room);
  return room;
}

export function removeRoom(id: string): void {
  rooms.delete(id);
}

export function getRoom(id: string): RoomState | undefined {
  const room = rooms.get(id);
  if (!room) throw new Error("Room not found");
  return room;
}
