import { Card } from "../models/card";

export function getImageUrl(card: Card) {
  const STORAGE_URL = "http://localhost:3000";
  return `${STORAGE_URL}/cards/${card.id}.png`;
}

export function drawFromDeck(deck: Card[], amount: number): Card[] {
  if (amount > deck.length) {
    throw new Error("Not enough cards in deck");
  }
  const drawnCards = deck.splice(0, amount);
  return drawnCards;
}

export function shuffleDeck(deck: Card[]) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
