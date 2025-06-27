import { Elysia } from "elysia";
import { initDB } from "./db";
import { websocket } from "./ws/handlers";
import { gameRoutes } from "./routes/game";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import cardsRoutes from "./routes/cards";
const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(cors())
  .use(swagger())
  .use(websocket)
  .use(gameRoutes)
  .use(cardsRoutes)
  .listen(3000);

await initDB();

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
