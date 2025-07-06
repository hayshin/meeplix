import { createPlayer, Player } from "$shared/models/player";

// player id -> player
const players = new Map<string, Player>();

export function addPlayer(nickname: string, roomId: string): Player {
  const player = createPlayer(nickname, roomId);
  players.set(player.id, player);
  return player;
}

export function removePlayerById(id: string): void {
  players.delete(id);
}

export function getPlayerById(id: string): Player {
  const player = players.get(id);
  if (!player) throw new Error("Player not found");
  return player;
}

export function getPlayersByIds(ids: string[]): Player[] {
  return ids.map((id) => getPlayerById(id));
}

export function updatePlayer(player: Player): void {
  players.set(player.id, player);
}
