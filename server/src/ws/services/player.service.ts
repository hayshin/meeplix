import { Player, PlayerStatus } from "$shared/models/player";
// export function createPlayer(name: string): Player {
//   return {
//     id: uuidv4(),
//     name,
//     hand: createHand(),
//   };
// }

export function updateScore(player: Player, score: number): Player {
  return {
    ...player,
    score,
  };
}

export function addScore(player: Player, score: number): Player {
  return {
    ...player,
    score: player.score + score,
  };
}

export function updateStatus(player: Player, status: PlayerStatus): Player {
  return {
    ...player,
    status,
  };
}
