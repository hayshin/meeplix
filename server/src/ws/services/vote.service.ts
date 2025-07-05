import { Vote } from "$shared/models/vote";

export function isPlayerVoted(votes: Vote[], playerId: string) {
  return votes.some((vote) => vote.playerId === playerId);
}
