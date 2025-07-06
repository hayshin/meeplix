import { addRoom, getRoomById } from "$/ws/stores/room.store";
import { Elysia } from "elysia";
import { t } from "elysia";

export const gameRoutes = new Elysia({ prefix: "/game" }).get(
  "/:id",
  async ({ params, status }) => {
    try {
      const room = getRoomById(params.id);
      return room.id;
    } catch (error) {
      return status(404, "Game not found");
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      200: t.String(),
      404: t.String(),
    },
  },
);
