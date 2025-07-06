import { RoomState } from "../models/room.model";
import { Player } from "$shared/models/player";
import { Card, serializeCardForClient } from "../models/card.model";
import { Submit } from "../models/submit.model";
import { Hand } from "../models/hand.model";
import { GAME_CONFIG } from "$shared/constants";
import {
  getPlayersIDsInRoom,
  getRoomById,
  updateRoom,
} from "../stores/room.store";
import { getPlayerById, getPlayersByIds } from "../stores/player.store";
import { loadCardsFromAssets } from "$/game/cards";
import { drawFromDeck, shuffle } from "./card.service";
import { removeCard } from "./hand.service";
import { broadcastMessage } from "..";
import { ServerMessage } from "$shared/messages";

export function getNextLeader(roomId: string): Player {
  const room = getRoomById(roomId);
  const players = getPlayersInRoom(roomId);
  let leaderId = room.leaderId;
  if (!leaderId) leaderId = players[0].id;
  const leaderIndex = players.findIndex((player) => player.id === leaderId);
  const nextIndex = (leaderIndex + 1) % players.length;
  return players[nextIndex];
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

export function getHandOfPlayer(roomId: string, playerId: string): Hand {
  const room = getRoomById(roomId);
  const player = getPlayerInRoom(roomId, playerId);
  const hands = room.hands;
  let hand = hands.find((hand) => hand.playerId === playerId);
  if (!hand) {
    throw new Error(`Hand not found for player ${playerId}`);
  }
  return hand;
}

export function getCardsOfPlayer(roomId: string, playerId: string): Card[] {
  const hand = getHandOfPlayer(roomId, playerId);
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

export function removeCardFromPlayer(
  roomId: string,
  playerId: string,
  card: Card,
) {
  const room = getRoomById(roomId);
  let hand = getHandOfPlayer(roomId, playerId);
  hand = removeCard(hand, card);
  room.hands = room.hands.map((h) => (h.playerId === playerId ? hand : h));
  updateRoom(roomId, room);
  return hand;
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

export function setDeck(roomId: string, deck?: Card[]): void {
  const room = getRoomById(roomId);
  if (!deck) {
    deck = loadCardsFromAssets();
  }
  deck = shuffle(deck);
  room.deck = deck;
  updateRoom(roomId, room);
}
export function dealCards(roomId: string, amountPerPlayer: number): void {
  const room = getRoomById(roomId);
  const deck = room.deck;
  const players = getPlayersInRoom(roomId);
  players.forEach((player) => {
    const cards = drawFromDeck(deck, amountPerPlayer);
    room.hands.push({
      playerId: player.id,
      cards,
    });
  });
  updateRoom(roomId, room);
}

export function startGame(roomId: string, playerId: string): Hand[] {
  const room = getRoomById(roomId);
  const players = getPlayersInRoom(roomId);
  if (players[0].id !== playerId) {
    throw new Error("You are not the leader");
  }
  if (!canStartGame(roomId)) {
    throw new Error("Game cannot be started");
  }
  if (!allPlayersReady(roomId)) {
    throw new Error("Not all players are ready");
  }
  const leader = getNextLeader(roomId);
  setDeck(roomId);
  dealCards(roomId, 6);
  updateRoom(roomId, room);
  return startRound(roomId, leader.id);
}

export function startRound(roomId: string, leaderId: string): Hand[] {
  const room = getRoomById(roomId);
  room.leaderId = leaderId;
  room.roundNumber += 1;
  room.currentDescription = "";
  room.submittedCards = [];
  room.votes = [];
  room.phase = "leader_submitting";
  updateRoom(roomId, room);
  return room.hands;
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
  const card = getCardOfPlayer(room.id, playerId, cardId);
  room.submittedCards.push({ playerId: playerId, card });
  removeCardFromPlayer(roomId, playerId, card);
  if (allPlayersSubmitted(roomId)) {
    startVoting(roomId);
  }
  updateRoom(roomId, room);
}

export function startVoting(roomId: string): void {
  const room = getRoomById(roomId);
  room.phase = "voting";
  console.log(`All players submitted cards, moving to voting stage`);
  updateRoom(roomId, room);
  const submittedCards = room.submittedCards.map((card) =>
    serializeCardForClient(card.card),
  );
  const cardsForVoting = shuffle(submittedCards);
  const message: ServerMessage = {
    type: "PHASE_BEGIN_VOTE",
    payload: { cardsForVoting },
  };
  broadcastMessage(roomId, message);
}

export function leaderSubmitCard(
  roomId: string,
  playerId: string,
  cardId: string,
  description: string,
): void {
  const room = getRoomById(roomId);
  const leaderId = room.leaderId;
  if (playerId !== leaderId) {
    throw new Error(`Player ${playerId} is not the leader ${leaderId}`);
  }
  const card = getCardOfPlayer(room.id, leaderId, cardId);
  room.submittedCards.push({ playerId: leaderId, card });
  room.currentDescription = description;
  removeCardFromPlayer(roomId, leaderId, card);
  room.phase = "players_submitting";
  updateRoom(roomId, room);
}

export function hasVoted(roomId: string, playerId: string): boolean {
  const room = getRoomById(roomId);
  return room.votes.some((vote) => vote.playerId === playerId);
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
  } else if (hasVoted(roomId, playerId)) {
    throw new Error(`Player ${playerId} has already voted`);
  }
  const card = getCardById(room.id, cardId);
  room.votes.push({ playerId, card });
  if (allPlayersVoted(roomId)) {
    endVote(roomId);
  }
  updateRoom(roomId, room);
}
export function endVote(roomId: string): void {
  console.log(`Room ${roomId} has ended voting`);
  const room = getRoomById(roomId);
  room.phase = "results";
  calculatePoints(roomId);
  updateRoom(roomId, room);
  broadcastMessage(roomId, {
    type: "PHASE_END_VOTE",
    payload: {
      leaderCardId: getSubmittedLeaderCard(room).id,
      votes: room.votes,
    },
  });
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
export function calculatePoints(roomId: string): void {
  const room = getRoomById(roomId);
  const leaderId = room.leaderId;
  const leaderCard = getSubmittedLeaderCard(room);

  // Count votes for leader's card
  const votesForLeader = room.votes.filter(
    (vote) => vote.card.id === leaderCard.id,
  ).length;

  const totalVotes = room.votes.length;

  // Points for leader
  const leaderPlayer = getPlayerInRoom(room.id, leaderId);
  if (votesForLeader > 0 && votesForLeader < totalVotes) {
    leaderPlayer.score += GAME_CONFIG.pointsForLeaderSuccess;
  }

  // Points for other players
  const players = getPlayersInRoom(roomId).filter(
    (player) => player.id !== leaderId,
  );
  players.forEach((player) => {
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

export function isGameFinished(roomId: string): boolean {
  const room = getRoomById(roomId);
  return getPlayersInRoom(roomId).some(
    (player) => player.score >= GAME_CONFIG.winningScore,
  );
}

export function getWinner(roomId: string): Player {
  if (!isGameFinished(roomId)) throw new Error("Game is not finished");

  const players = getPlayersInRoom(roomId);
  const winner = players.reduce(
    (max, player) => (player.score > max.score ? player : max),
    players[0],
  );
  return winner;
}

export function canStartGame(roomId: string): boolean {
  const players = getPlayersInRoom(roomId);
  return (
    players.length >= GAME_CONFIG.minPlayers &&
    players.length <= GAME_CONFIG.maxPlayers
  );
}

export function getNonLeaderSubmissions(room: RoomState): Submit[] {
  return room.submittedCards.filter((card) => card.playerId !== room.leaderId);
}

export function getReadyPlayers(roomId: string): Player[] {
  return getPlayersInRoom(roomId).filter((player) => player.status === "ready");
}

export function getActivePlayers(roomId: string): Player[] {
  return getPlayersInRoom(roomId).filter(
    (player) => player.status === "online" || player.status === "ready",
  );
}

export function allPlayersReady(roomId: string): boolean {
  return getPlayersInRoom(roomId).every((player) => player.status === "ready");
}

export function allPlayersSubmitted(roomId: string): boolean {
  const room = getRoomById(roomId);
  return room.submittedCards.length === getActivePlayers(roomId).length;
}

export function allPlayersVoted(roomId: string): boolean {
  const room = getRoomById(roomId);
  // All players except the leader should vote
  return room.votes.length === getActivePlayers(roomId).length - 1;
}
