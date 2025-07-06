import { Card } from "../models/card.model";

export function getImageUrl(card: Card) {
  const STORAGE_URL = "http://localhost:3000";
  return `${STORAGE_URL}/cards/${card.id}`;
}

export function drawFromDeck(deck: Card[], amount: number): Card[] {
  if (amount > deck.length) {
    throw new Error("Not enough cards in deck");
  }
  const drawnCards = deck.splice(0, amount);
  return drawnCards;
}

export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
