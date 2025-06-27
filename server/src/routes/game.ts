import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { GameManager } from "../game/manager";
import { t } from "elysia";
import { GameSessionSchema, PlayerSchema } from "$shared/types";

const gameManager = new GameManager();

export const gameRoutes = new Elysia({ prefix: "game" })
  .post(
    "/create",
    async () => {
      const gameId = await gameManager.createGame();
      return gameId;
    },
    {
      response: t.String(),
    }
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const game = await gameManager.getGame(params.id);
      return game ?? status(404, "Game not found");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: GameSessionSchema,
        404: t.String(),
      },
    }
  )

  .post(
    "/:id/join",
    async ({ params, body, status }) => {
      const { nickname } = body;
      if (!nickname || nickname.trim().length === 0) {
        return status(400, "Nickname is required");
      }

      const player = await gameManager.addPlayerToGame(
        params.id,
        nickname.trim()
      );
      if (!player) {
        return status(400, "Could not join game");
      }

      // Отправить обновление всем игрокам
      await gameManager.broadcastGameUpdate(params.id);

      return player;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        nickname: t.String(),
      }),
      response: {
        200: PlayerSchema,
        400: t.String(),
      },
    }
  )

  .post(
    "/:id/start",
    async ({ params, set }) => {
      await gameManager.startGame(params.id);
      await gameManager.broadcastGameUpdate(params.id);
      return "Game started successfully";
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
