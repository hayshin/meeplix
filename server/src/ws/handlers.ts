import type { ServerWebSocket } from "bun";
import { GameManager } from "../game/manager";

const gameManager = new GameManager();

import {
  JoinGameEvent,
  LeaderSelectsCardEvent,
  PlayerSubmitsCardEvent,
  PlayerVotesEvent,
  StartGameEvent,
  WSEvent,
  WSEventSchema,
} from "$shared/types";
import Elysia, { Context } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { t } from "elysia";

const WSDataSchema = t.Object({
  gameId: t.String(),
  playerId: t.String(),
});

type WSData = typeof WSDataSchema.static;

type WS = ElysiaWS<{
  query: WSData;
  body: { message: WSEvent };
}>;

export const websocket = new Elysia().ws("/ws", {
  query: WSDataSchema,
  body: WSEventSchema,

  open(ws: WS) {
    const { gameId, playerId } = ws.data.query;
    console.log(`WebSocket opened - Game: ${gameId}, Player: ${playerId}`);
    ws.subscribe(gameId);
  },

  message: async (ws: WS, message: WSEvent) => {
    const { gameId, playerId } = ws.data.query;
    const game = await gameManager.getGame(gameId);
    console.log(game);
    const event = message;
    console.log("WebSocket message:", event);

    switch (event.type) {
      case "join_game":
        await handleJoinGame(ws, event);
        break;

      case "start_game":
        await handleStartGame(ws, event);
        break;

      case "leader_selects_card":
        await handleLeaderSelectsCard(ws, event);
        break;

      case "player_submits_card":
        await handlePlayerSubmitsCard(ws, event);
        console.log("Player submits card");
        console.log(game);

        break;

      case "player_votes":
        await handlePlayerVotes(ws, event);
        break;

      // case "next_round":
      //   await handleNextRound(ws, event);
      //   break;

      // case "leave_game":
      //   await handleLeaveGame(ws, event);
      //   break;

      // case "restart_game":
      //   await handleRestartGame(ws, event);
      //   break;

      // case "get_game_state":
      //   await handleGetGameState(ws, event);
      //   break;

      // case "player_ready":
      //   await handlePlayerReady(ws, event);
      //   break;

      default:
        ws.send({
          type: "error",
          data: { message: "Unknown message type" },
        });
    }
  },

  close: (ws: WS) => {
    console.log("WebSocket connection closed");
    if (ws.data.query.gameId) {
      gameManager.removeConnection(ws.data.query.gameId, ws);
    }
  },
});

async function handleJoinGame(ws: WS, event: JoinGameEvent) {
  const { gameId, nickname } = event.data;

  // Check if game exists
  const game = await gameManager.getGame(gameId);
  if (!game) {
    ws.send({
      type: "error",
      data: { message: "Game not found" },
    });
    return;
  }

  // Add player if not added
  let player = game.players.find((p) => p.nickname === nickname);
  if (!player) {
    player = await gameManager.addPlayerToGame(gameId, nickname);
    if (!player) {
      ws.send({
        type: "error",
        data: { message: "Could not join game" },
      });
      return;
    }
  }

  // Save data WebSocket
  ws.data.query.gameId = gameId;
  ws.data.query.playerId = player.id;

  gameManager.addConnection(gameId, ws);

  // Send current state to new player
  const updatedGame = await gameManager.getGame(gameId);
  ws.send({
    type: "game_update",
    data: { session: updatedGame, playerId: player.id },
  });

  // Notify other players
  await gameManager.broadcastGameUpdate(gameId);
}

async function handleLeaderSelectsCard(ws: WS, event: LeaderSelectsCardEvent) {
  const { gameId, playerId } = ws.data.query;
  const { cardId, association } = event.data;
  await gameManager.leaderSelectsCard(gameId, playerId, cardId, association);
  await gameManager.broadcastGameUpdate(gameId);
}

async function handlePlayerSubmitsCard(ws: WS, event: PlayerSubmitsCardEvent) {
  const { gameId, playerId } = ws.data.query;
  const { cardId } = event.data;
  await gameManager.playerSubmitsCard(gameId, playerId, cardId);
  await gameManager.broadcastGameUpdate(gameId);
}

async function handlePlayerVotes(ws: WS, event: PlayerVotesEvent) {
  const { gameId, playerId } = ws.data.query;
  const { cardId } = event.data;
  await gameManager.playerVotes(gameId, playerId, cardId);
  await gameManager.broadcastGameUpdate(gameId);
}

async function handleStartGame(ws: WS, event: StartGameEvent) {
  const { gameId, playerId } = ws.data.query;

  await gameManager.startGame(gameId);
  await gameManager.broadcastGameUpdate(gameId);
}

// async function handleNextRound(ws: WS, event: any) {
//   const { gameId, playerId } = ws.data.query;

//   try {
//     await gameManager.nextRound(gameId, playerId);
//     await gameManager.broadcastGameUpdate(gameId);
//   } catch (error) {
//     ws.send({
//       type: "error",
//       data: { message: error.message || "Could not start next round" },
//     });
//   }
// }

// async function handleLeaveGame(ws: WS, event: any) {
//   const { gameId, playerId } = ws.data.query;

//   try {
//     await gameManager.removePlayerFromGame(gameId, playerId);
//     await gameManager.broadcastGameUpdate(gameId);
//     ws.close();
//   } catch (error) {
//     ws.send({
//       type: "error",
//       data: { message: error.message || "Could not leave game" },
//     });
//   }
// }

// async function handleRestartGame(ws: WS, event: any) {
//   const { gameId, playerId } = ws.data.query;

//   try {
//     await gameManager.restartGame(gameId, playerId);
//     await gameManager.broadcastGameUpdate(gameId);
//   } catch (error) {
//     ws.send({
//       type: "error",
//       data: { message: error.message || "Could not restart game" },
//     });
//   }
// }

// async function handleGetGameState(ws: WS, event: any) {
//   const { gameId, playerId } = ws.data.query;

//   try {
//     const game = await gameManager.getGame(gameId);
//     if (game) {
//       ws.send({
//         type: "game_update",
//         data: { session: game, playerId },
//       });
//     } else {
//       ws.send({
//         type: "error",
//         data: { message: "Game not found" },
//       });
//     }
//   } catch (error) {
//     ws.send({
//       type: "error",
//       data: { message: error.message || "Could not get game state" },
//     });
//   }
// }

// async function handlePlayerReady(ws: WS, event: any) {
//   const { gameId, playerId } = ws.data.query;

//   try {
//     await gameManager.setPlayerReady(gameId, playerId);
//     await gameManager.broadcastGameUpdate(gameId);
//   } catch (error) {
//     ws.send({
//       type: "error",
//       data: { message: error.message || "Could not set player ready" },
//     });
//   }
// }
