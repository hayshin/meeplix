import { Elysia } from "elysia";
import { gameManager } from "$/ws/handlers";
import { t } from "elysia";
import { RoomStateSchema } from "$shared/types/room";

export const gameRoutes = new Elysia({ prefix: "game" }).get(
  "/:id",
  async ({ params, status }) => {
    try {
      const game = gameManager.getRoom(params.id);
      return game.cloneForClient();
    } catch (error) {
      return status(404, "Game not found");
    }
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
);
