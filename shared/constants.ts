export type GameConfig = {
  minPlayers: number;
  maxPlayers: number;
  cardsPerPlayer: number;
  winningScore: number;
  roundTimeLimit: number;
  votingTimeLimit: number;

  pointsForGuessingLeader: number;
  pointsForLeaderSuccess: number;
  pointsPerVote: number;
};

export const GAME_CONFIG: GameConfig = {
  minPlayers: 3,
  maxPlayers: 8,
  cardsPerPlayer: 6,
  winningScore: 20,
  roundTimeLimit: 120,
  votingTimeLimit: 60,

  pointsForGuessingLeader: 3,
  pointsForLeaderSuccess: 3,
  pointsPerVote: 1,
};
