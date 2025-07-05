import { Elysia } from "elysia";
import { websocket } from "./ws/handlers";
import { gameRoutes } from "./routes/game";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { cardsRoutes } from "./routes/cards";
import { logger } from "@bogeychan/elysia-logger";
const app = new Elysia({
  // Add WebSocket configuration
  prefix: "/api",
  websocket: {
    idleTimeout: 60,
    maxPayloadLength: 1024 * 1024, // 1MB
    perMessageDeflate: false,
  },
})
  .get("/", () => "Hello Elysia")
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(swagger())
  .use(
    logger({
      autoLogging: true,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    }),
  )
  .use(websocket)
  .use(gameRoutes)
  .use(cardsRoutes)
  .listen({
    port: 3000,
    hostname: "0.0.0.0", // Listen on all interfaces
  });
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
