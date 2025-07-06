import { Card } from "../models/card.model";
import { Hand } from "../models/hand.model";
import { shuffle } from "./card.service";

export function hasCard(hand: Hand, card: Card): boolean {
  return hand.cards.includes(card);
}

export function addCard(hand: Hand, card: Card): Hand {
  return {
    ...hand,
    cards: [...hand.cards, card],
  };
}

export function removeCard(hand: Hand, card: Card): Hand {
  if (!hasCard(hand, card)) throw new Error("Card not found");
  const index = hand.cards.indexOf(card);
  return {
    ...hand,
    cards: [...hand.cards.slice(0, index), ...hand.cards.slice(index + 1)],
  };
}

export function replaceCard(hand: Hand, oldCard: Card, newCard: Card): Hand {
  hand = removeCard(hand, oldCard);
  hand = addCard(hand, newCard);
  return hand;
}

export function getCards(hand: Hand): Card[] {
  return hand.cards;
}
