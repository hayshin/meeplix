import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { gameManager } from "$/ws/handlers";
import { t } from "elysia";
import { PlayerSchema } from "$shared/types/player";
import { RoomStateSchema } from "$shared/types/room";

export const gameRoutes = new Elysia({ prefix: "game" })
  .post(
    "/create",
    async () => {
      const roomId = await gameManager.addRoom();
      return roomId;
    },
    {
      response: t.String(),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const game = gameManager.getRoom(params.id);
      return game ?? status(404, "Game not found");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: RoomStateSchema,
        404: t.String(),
      },
    },
  )

  .post(
    "/:id/join",
    async ({ params, body, status }) => {
      const { nickname } = body;
      if (!nickname || nickname.trim().length === 0) {
        return status(400, "Nickname is required");
      }

      const player = await gameManager.addPlayerToRoom(
        params.id,
        nickname.trim(),
      );
      if (!player) {
        return status(400, "Could not join game");
      }

      // Отправить обновление всем игрокам
      // await gameManager.broadcastRoomUpdate(params.id);
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
    },
  )

  .post(
    "/:id/start",
    async ({ params, set }) => {
      await gameManager.startGame(params.id);
      // await gameManager.broadcastRoomUpdate(params.id);
      return "Game started successfully";
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
