import { RoomState } from "../models/room.model";
import { Player } from "$shared/models/player";
import { Card } from "../models/card.model";
import { Submit } from "../models/submit.model";
import { GAME_CONFIG } from "$shared/constants";
import {
  getPlayersIDsInRoom,
  getRoomById,
  updateRoom,
} from "../stores/room.store";
import { getPlayerById, getPlayersByIds } from "../stores/player.store";

export function startRound(room: RoomState, leaderId: string) {
  room.roundNumber += 1;
  room.leaderId = leaderId;
  room.currentDescription = "";
  room.submittedCards = [];
  room.phase = "leader_submitting";
  room.votes = [];
}

export function getNextLeader(room: RoomState): Player {
  const leaderId = room.leaderId;
  const leaderIndex = room.players.findIndex(
    (player) => player.id === leaderId,
  );
  const nextIndex = (leaderIndex + 1) % room.players.length;
  return room.players[nextIndex];
}

// export function getPlayer(roomId: roomId, playerId: string): Player {
//   const room = getRoom(roomId);
//   const player = room.players.find((player) => player.id === playerId);
//   if (!player) {
//     throw new Error(`Player with id ${playerId} not found`);
//   }
//   return player;
// }

// export function addPlayer(room: RoomState, player: Player): void {
//   room.players.push(player);
// }

// export function getNonLeaderPlayers(room: RoomState): Player[] {
//   const leaderId = room.leaderId;
//   return room.players.filter((player) => player.id !== leaderId);
// }
//

export function getPlayerInRoom(roomId: string, playerId: string): Player {
  const player = getPlayerById(playerId);
  const roomOfPlayer = player.roomId;
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  } else if (roomOfPlayer !== roomId) {
    throw new Error(`Player with id ${playerId} is not in room ${roomId}`);
  }
  return player;
}

export function getPlayersInRoom(roomId: string): Player[] {
  const playerIds = getPlayersIDsInRoom(roomId);
  const players = getPlayersByIds(playerIds);
  return players;
}

export function getCardsOfPlayer(roomId: string, playerId: string): Card[] {
  const room = getRoomById(roomId);
  const player = getPlayerInRoom(roomId, playerId);
  const hands = room.hands;
  const hand = hands.find((hand) => hand.playerId === playerId);
  if (!hand) {
    throw new Error(`Hand not found for player ${playerId}`);
  }
  return hand.cards;
}

export function getCardOfPlayer(
  roomId: string,
  playerId: string,
  cardId: string,
) {
  const cards = getCardsOfPlayer(roomId, playerId);
  const card = cards.find((card) => card.id === cardId);
  if (!card) {
    throw new Error(`Card with id ${cardId} not found`);
  }
  return card;
}

export function getCardsOfRoom(roomId: string): Card[] {
  const room = getRoomById(roomId);
  const hands = room.hands;
  const cards = hands.flatMap((hand) => hand.cards);
  return cards;
}

export function getCardById(roomId: string, cardId: string): Card {
  const cards = getCardsOfRoom(roomId);
  const card = cards.find((card) => card.id === cardId);
  if (!card) {
    throw new Error(`Card with id ${cardId} not found`);
  }
  return card;
}

export function playerSubmitCard(
  roomId: string,
  playerId: string,
  cardId: string,
): void {
  const room = getRoomById(roomId);
  const leaderId = room.leaderId;
  if (playerId === leaderId) {
    throw new Error(`Player ${playerId} is the leader ${leaderId}`);
  }
  const card = getCardOfPlayer(room.id, leaderId, cardId);
  room.submittedCards.push({ playerId: leaderId, card });
  updateRoom(roomId, room);
}

export function playerVote(
  roomId: string,
  playerId: string,
  cardId: string,
): void {
  const room = getRoomById(roomId);
  const leaderId = room.leaderId;
  if (playerId === leaderId) {
    throw new Error(`Player ${playerId} is the leader ${leaderId}`);
  }
  const card = getCardById(room.id, cardId);
  room.votes.push({ playerId, card });
  updateRoom(roomId, room);
}

export function getSubmittedLeaderCard(room: RoomState): Card {
  const leaderId = room.leaderId;
  const leaderCard = room.submittedCards.find(
    (card) => card.playerId === leaderId,
  );
  if (!leaderCard) {
    throw new Error(`Leader card not found`);
  }
  return leaderCard.card;
}
export function calculatePoints(room: RoomState): void {
  const leaderId = room.leaderId;
  const leaderCard = getSubmittedLeaderCard(room);

  // Count votes for leader's card
  const votesForLeader = room.votes.filter(
    (vote) => vote.card.id === leaderCard.id,
  ).length;

  const totalVotes = room.votes.length;

  // Points for leader
  const leaderPlayer = getPlayerInRoom(room, leaderId);
  if (votesForLeader > 0 && votesForLeader < totalVotes) {
    leaderPlayer.score += GAME_CONFIG.pointsForLeaderSuccess;
  }

  // Points for other players
  room.players.forEach((player) => {
    if (player.id === leaderId) return; // Leader already processed

    // Check if player guessed the leader's card
    const playerVote = room.votes.find(
      (vote) =>
        vote.card.id === leaderCard.id &&
        // Assuming we need to identify the voter somehow - this might need adjustment
        // based on your Vote model structure
        player.id, // This might need to be adjusted based on how votes are structured
    );

    if (playerVote) {
      player.score += GAME_CONFIG.pointsForGuessingLeader;
    }

    // Points for votes received on their card
    const playerSubmittedCard = room.submittedCards.find(
      (submission) => submission.playerId === player.id,
    );

    if (playerSubmittedCard) {
      const votesForPlayerCard = room.votes.filter(
        (vote) => vote.card.id === playerSubmittedCard.card.id,
      ).length;
      player.score += votesForPlayerCard * GAME_CONFIG.pointsPerVote;
    }
  });
}

export function assertPhase(room: RoomState, phase: string): void {
  if (room.phase !== phase) {
    throw new Error(
      `Invalid phase of game: expected ${phase}, got ${room.phase}`,
    );
  }
}

export function isGameFinished(room: RoomState): boolean {
  return room.players.some(
    (player) => player.score >= GAME_CONFIG.winningScore,
  );
}

export function getWinner(room: RoomState): Player {
  if (!isGameFinished(room)) throw new Error("Game is not finished");

  const winner = room.players.reduce(
    (max, player) => (player.score > max.score ? player : max),
    room.players[0],
  );
  return winner;
}

export function canStartGame(room: RoomState): boolean {
  return (
    room.players.length >= GAME_CONFIG.minPlayers &&
    room.players.length <= GAME_CONFIG.maxPlayers
  );
}

export function getNonLeaderSubmissions(room: RoomState): Submit[] {
  return room.submittedCards.filter((card) => card.playerId !== room.leaderId);
}

export function getReadyPlayers(room: RoomState): Player[] {
  return room.players.filter((player) => player.status === "ready");
}

export function getActivePlayers(room: RoomState): Player[] {
  return room.players.filter(
    (player) => player.status === "online" || player.status === "ready",
  );
}

export function allPlayersReady(room: RoomState): boolean {
  return room.players.every((player) => player.status === "ready");
}

export function allPlayersSubmitted(room: RoomState): boolean {
  return room.submittedCards.length === getActivePlayers(room).length;
}

export function allPlayersVoted(room: RoomState): boolean {
  // All players except the leader should vote
  return room.votes.length === getActivePlayers(room).length - 1;
}
