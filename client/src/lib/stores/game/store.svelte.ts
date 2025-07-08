import { writable, derived, get } from "svelte/store";
import { createInitialGameState, type GameState } from "./types";
import { ConnectionManager } from "./connection.svelte";
import { MessageHandlersManager } from "./message-handlers.svelte";
import { GameActionsManager } from "./actions.svelte";
import { GameHelpersManager } from "./helpers.svelte";
import type { ServerMessage } from "$shared/messages";

export class GameStore {
  // Core state as writable store
  private _state = writable<GameState>(createInitialGameState());

  // Managers - they'll need to be updated to work with stores
  private connectionManager: ConnectionManager;
  private messageHandlers: MessageHandlersManager;
  private actionsManager: GameActionsManager;
  private helpersManager: GameHelpersManager;

  // Derived stores for computed values
  readonly isGameStarted = derived(
    this._state,
    ($state) => $state.phase !== "joining",
  );
  readonly isCurrentPlayerLeader = derived(
    this._state,
    ($state) => $state.currentPlayer?.id === $state.leaderId,
  );
  readonly currentLeader = derived(
    this._state,
    ($state) => $state.players.find((p) => p.id === $state.leaderId) || null,
  );
  readonly canStartGame = derived(this._state, ($state) => true);
  readonly allPlayersReady = derived(this._state, ($state) => true);
  readonly isGameFinished = derived(
    this._state,
    ($state) => $state.phase === "game_finished",
  );
  readonly readyPlayersCount = derived(
    this._state,
    ($state) => $state.players.filter((p) => p.status === "ready").length,
  );
  readonly totalPlayersCount = derived(
    this._state,
    ($state) => $state.players.length,
  );

  constructor() {
    // Initialize managers with store instead of direct state
    this.connectionManager = new ConnectionManager(this._state);
    this.messageHandlers = new MessageHandlersManager(this._state);
    this.actionsManager = new GameActionsManager(this._state);
    this.helpersManager = new GameHelpersManager(this._state);

    // Initialize method bindings after managers are created
    this.initializeMethodBindings();
  }

  private initializeMethodBindings() {
    // Game actions (delegated to ActionsManager)
    this.startGame = this.actionsManager.startGame;
    this.setReady = this.actionsManager.setReady;
    this.submitLeaderCard = this.actionsManager.submitLeaderCard;
    this.submitPlayerCard = this.actionsManager.submitPlayerCard;
    this.submitVote = this.actionsManager.submitVote;
    this.startNextRound = this.actionsManager.startNextRound;
    this.clearError = this.actionsManager.clearError;
    this.reconnectToRoom = this.actionsManager.reconnectToRoom;

    // Helper methods (delegated to HelpersManager)
    this.getCardById = this.helpersManager.getCardById;
    this.getVotingCardById = this.helpersManager.getVotingCardById;
    this.getPlayerById = this.helpersManager.getPlayerById;
    this.canSubmitCard = this.helpersManager.canSubmitCard;
    this.canVote = this.helpersManager.canVote;
    this.canLeaderSubmitCard = this.helpersManager.canLeaderSubmitCard;

    // Additional helper methods
    this.getReadyPlayers = this.helpersManager.getReadyPlayers;
    this.getOnlinePlayers = this.helpersManager.getOnlinePlayers;
    this.hasCardInHand = this.helpersManager.hasCardInHand;
    this.getHandSize = this.helpersManager.getHandSize;
    this.getVotingCardsCount = this.helpersManager.getVotingCardsCount;
    this.canPlayerAct = this.helpersManager.canPlayerAct;

    // UI state helpers
    this.shouldShowReadyButton = this.helpersManager.shouldShowReadyButton;
    this.shouldShowStartGameButton =
      this.helpersManager.shouldShowStartGameButton;
    this.shouldShowLeaderCardSubmission =
      this.helpersManager.shouldShowLeaderCardSubmission;
    this.shouldShowPlayerCardSubmission =
      this.helpersManager.shouldShowPlayerCardSubmission;
    this.shouldShowVoting = this.helpersManager.shouldShowVoting;
    this.shouldShowResults = this.helpersManager.shouldShowResults;
    this.shouldShowNextRoundButton =
      this.helpersManager.shouldShowNextRoundButton;

    // Phase checks
    this.isJoiningPhase = this.helpersManager.isJoiningPhase;
    this.isLeaderSubmittingPhase = this.helpersManager.isLeaderSubmittingPhase;
    this.isPlayersSubmittingPhase =
      this.helpersManager.isPlayersSubmittingPhase;
    this.isVotingPhase = this.helpersManager.isVotingPhase;
    this.isResultsPhase = this.helpersManager.isResultsPhase;

    // Player info helpers
    this.getPlayerStatus = this.helpersManager.getPlayerStatus;
    this.getPlayerNickname = this.helpersManager.getPlayerNickname;
    this.getPlayerScore = this.helpersManager.getPlayerScore;
    this.getWinner = this.helpersManager.getWinner;
  }

  // Expose state store for reactivity
  get state() {
    return this._state;
  }

  // Helper method to get current state value
  private getCurrentState(): GameState {
    return get(this._state);
  }

  // Helper method to update state
  private updateState(updater: (state: GameState) => GameState) {
    this._state.update(updater);
  }

  // Connection actions
  createRoom = (username: string, topic: string) => {
    const currentState = this.getCurrentState();
    if (currentState.isConnecting) return;

    this.updateState((state) => ({
      ...state,
      isConnecting: true,
      error: null,
    }));

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: true,
          isConnecting: false,
        }));
        this.actionsManager.createRoom(username, topic);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: false,
          isConnecting: false,
        }));
      },
      onError: (error) => {
        this.connectionManager.handleConnectionError("Connection error");
      },
    });

    this.connectionManager.setConnectionTimeout(() => {
      this.connectionManager.handleConnectionError("Connection timeout");
    });
  };

  reconnect = (roomId: string, playerId: string, username: string) => {
    const currentState = this.getCurrentState();
    if (currentState.isConnecting) return;

    this.updateState((state) => ({
      ...state,
      isConnecting: true,
      error: null,
    }));

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: true,
          isConnecting: false,
        }));
        this.actionsManager.reconnectToRoom(roomId, playerId, username);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: false,
          isConnecting: false,
        }));
      },
      onError: (error) => {
        this.connectionManager.handleConnectionError("Connection error");
      },
    });

    this.connectionManager.setConnectionTimeout(() => {
      this.connectionManager.handleConnectionError("Connection timeout");
    });
  };

  joinRoom = (roomId: string, username: string) => {
    const currentState = this.getCurrentState();
    if (currentState.isConnecting) return;

    this.updateState((state) => ({
      ...state,
      isConnecting: true,
      error: null,
    }));

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: true,
          isConnecting: false,
        }));
        this.actionsManager.joinRoom(roomId, username);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.updateState((state) => ({
          ...state,
          isConnected: false,
          isConnecting: false,
        }));
      },
      onError: (error) => {
        this.connectionManager.handleConnectionError("Connection error");
      },
    });

    this.connectionManager.setConnectionTimeout(() => {
      this.connectionManager.handleConnectionError("Connection timeout");
    });
  };

  // Game actions (will be bound in constructor)
  startGame!: () => void;
  setReady!: () => void;
  submitLeaderCard!: (cardId: string, description: string) => void;
  submitPlayerCard!: (cardId: string) => void;
  submitVote!: (cardId: string) => void;
  startNextRound!: () => void;
  clearError!: () => void;
  reconnectToRoom!: (
    roomId: string,
    playerId: string,
    username: string,
  ) => void;

  // Disconnect with proper cleanup
  disconnect = () => {
    this.connectionManager.disconnect();
    this.actionsManager.disconnect();
  };

  // Helper methods (will be bound in constructor)
  getCardById!: (
    cardId: string,
  ) => import("$shared/models/public_card").PublicCard | null;
  getVotingCardById!: (
    cardId: string,
  ) => import("$shared/models/public_card").PublicCard | null;
  getPlayerById!: (
    playerId: string,
  ) => import("$shared/models/player").Player | null;
  canSubmitCard!: () => boolean;
  canVote!: () => boolean;
  canLeaderSubmitCard!: () => boolean;

  // Additional helper methods
  getReadyPlayers!: () => import("$shared/models/player").Player[];
  getOnlinePlayers!: () => import("$shared/models/player").Player[];
  hasCardInHand!: (cardId: string) => boolean;
  getHandSize!: () => number;
  getVotingCardsCount!: () => number;
  canPlayerAct!: () => boolean;

  // UI state helpers
  shouldShowReadyButton!: () => boolean;
  shouldShowStartGameButton!: () => boolean;
  shouldShowLeaderCardSubmission!: () => boolean;
  shouldShowPlayerCardSubmission!: () => boolean;
  shouldShowVoting!: () => boolean;
  shouldShowResults!: () => boolean;
  shouldShowNextRoundButton!: () => boolean;

  // Phase checks
  isJoiningPhase!: () => boolean;
  isLeaderSubmittingPhase!: () => boolean;
  isPlayersSubmittingPhase!: () => boolean;
  isVotingPhase!: () => boolean;
  isResultsPhase!: () => boolean;

  // Player info helpers
  getPlayerStatus!: (playerId: string) => string | null;
  getPlayerNickname!: (playerId: string) => string | null;
  getPlayerScore!: (playerId: string) => number | null;
  getWinner!: () => import("$shared/models/player").Player | null;
}
