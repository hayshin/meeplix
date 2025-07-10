import { Elysia, t } from "elysia";
import { db, decks as decksTable } from "../db";
import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";

const deckSelect = createSelectSchema(decksTable);

export const decksRoute = new Elysia({
  name: "decks",
  prefix: "/decks",
})
  .get(
    "/:id",
    async ({ params, status }) => {
      const { id } = params;
      const decksSelected = await db
        .select()
        .from(decksTable)
        .where(eq(decksTable.id, id))
        .limit(1);
      if (decksSelected.length === 0) {
        return status(404, "Deck not found");
      }
      const deck = decksSelected[0];
      return deck;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: deckSelect,
        404: t.String(),
        500: t.String(),
      },
    },
  )
  .get(
    "/all",
    async () => {
      const decks = await db.select().from(decksTable);
      return decks;
    },
    {
      response: {
        200: t.Array(deckSelect),
        500: t.String(),
      },
    },
  )
  .post("/", ({ body }) => body)
  .put("/", ({ body }) => body)
  .patch("/", ({ body }) => body)
  .delete("/", ({ body }) => body);
