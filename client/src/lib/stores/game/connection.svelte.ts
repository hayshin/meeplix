import { api } from "$lib/utils";
import type { GameState, ConnectionHandlers } from "./types";

export class ConnectionManager {
  private connectionTimeout: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_DURATION = 10000; // 10 seconds

  constructor(private state: GameState) {}

  createConnection = (): ReturnType<typeof api.ws.subscribe> => {
    const room = api.ws.subscribe();
    this.state.room = room;
    return room;
  };

  setupConnectionHandlers = (
    room: ReturnType<typeof api.ws.subscribe>,
    handlers: ConnectionHandlers,
  ) => {
    room.on("message", ({ data }) => {
      try {
        if (data) {
          handlers.onMessage(data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        this.state.error = "Error processing server message";
      }
    });

    room.on("close", () => {
      console.log("WebSocket disconnected");
      handlers.onClose();
    });

    room.on("error", (error) => {
      console.error("WebSocket error:", error);
      handlers.onError(error);
    });

    room.on("open", () => {
      handlers.onOpen();
    });
  };

  setConnectionTimeout = (callback: () => void) => {
    this.connectionTimeout = setTimeout(callback, this.TIMEOUT_DURATION);
  };

  clearConnectionTimeout = () => {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  };

  handleConnectionError = (message: string) => {
    this.clearConnectionTimeout();
    this.state.error = message;
    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.isJoining = false;

    if (this.state.room) {
      this.state.room.close();
      this.state.room = null;
    }
  };

  setConnecting = (isConnecting: boolean) => {
    this.state.isConnecting = isConnecting;
  };

  setConnected = (isConnected: boolean) => {
    this.state.isConnected = isConnected;
  };

  clearError = () => {
    this.state.error = null;
  };

  disconnect = () => {
    this.clearConnectionTimeout();

    if (this.state.room) {
      this.state.room.close();
      this.state.room = null;
    }

    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.isJoining = false;
  };
}
