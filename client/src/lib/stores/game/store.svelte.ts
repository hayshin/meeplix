import { createInitialGameState, type GameState } from "./types";
import { ConnectionManager } from "./connection.svelte";
import { MessageHandlersManager } from "./message-handlers.svelte";
import { GameActionsManager } from "./actions.svelte";
import { GameHelpersManager } from "./helpers.svelte";
import type { ServerMessage } from "$shared/messages";

export class GameStore {
  // Core state
  private _state = $state<GameState>(createInitialGameState());

  // Managers
  private connectionManager: ConnectionManager = new ConnectionManager(
    this._state,
  );
  private messageHandlers: MessageHandlersManager = new MessageHandlersManager(
    this._state,
  );
  private actionsManager: GameActionsManager = new GameActionsManager(
    this._state,
  );
  private helpersManager: GameHelpersManager = new GameHelpersManager(
    this._state,
  );

  // constructor() {
  //   this.connectionManager = ;
  //   this.messageHandlers =;
  //   this.actionsManager = new GameActionsManager(this._state);
  //   this.helpersManager = new GameHelpersManager(this._state);
  // }

  // Derived state
  readonly state = $derived.by(() => ({ ...this._state }));

  readonly isGameStarted = $derived(this.helpersManager.isGameStarted());
  readonly isCurrentPlayerLeader = $derived(
    this.helpersManager.isCurrentPlayerLeader(),
  );
  readonly currentLeader = $derived(this.helpersManager.getCurrentLeader());
  readonly canStartGame = $derived(this.helpersManager.canStartGame());
  readonly allPlayersReady = $derived(this.helpersManager.allPlayersReady());
  readonly isGameFinished = $derived(this.helpersManager.isGameFinished());
  readonly readyPlayersCount = $derived(
    this.helpersManager.getReadyPlayersCount(),
  );
  readonly totalPlayersCount = $derived(
    this.helpersManager.getTotalPlayersCount(),
  );

  // Connection actions
  createRoom = (username: string) => {
    if (this._state.isConnecting) return;

    this.connectionManager.setConnecting(true);
    this.connectionManager.clearError();

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(true);
        this.connectionManager.setConnecting(false);
        this.actionsManager.createRoom(username);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(false);
        this.connectionManager.setConnecting(false);
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
    if (this.state.isConnecting) return;

    this.connectionManager.setConnecting(true);
    this.connectionManager.clearError();

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(true);
        this.connectionManager.setConnecting(false);
        this.actionsManager.reconnectToRoom(roomId, playerId, username);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(false);
        this.connectionManager.setConnecting(false);
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
    if (this._state.isConnecting) return;

    this.connectionManager.setConnecting(true);
    this.connectionManager.clearError();

    const room = this.connectionManager.createConnection();
    this.connectionManager.setupConnectionHandlers(room, {
      onOpen: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(true);
        this.connectionManager.setConnecting(false);
        this.actionsManager.joinRoom(roomId, username);
      },
      onMessage: (data) => {
        this.messageHandlers.handleServerMessage(data as ServerMessage);
      },
      onClose: () => {
        this.connectionManager.clearConnectionTimeout();
        this.connectionManager.setConnected(false);
        this.connectionManager.setConnecting(false);
      },
      onError: (error) => {
        this.connectionManager.handleConnectionError("Connection error");
      },
    });

    this.connectionManager.setConnectionTimeout(() => {
      this.connectionManager.handleConnectionError("Connection timeout");
    });
  };

  // Game actions (delegated to ActionsManager)
  startGame = this.actionsManager.startGame;
  setReady = this.actionsManager.setReady;
  submitLeaderCard = this.actionsManager.submitLeaderCard;
  submitPlayerCard = this.actionsManager.submitPlayerCard;
  submitVote = this.actionsManager.submitVote;
  startNextRound = this.actionsManager.startNextRound;
  clearError = this.actionsManager.clearError;
  reconnectToRoom = this.actionsManager.reconnectToRoom;

  // Disconnect with proper cleanup
  disconnect = () => {
    this.connectionManager.disconnect();
    this.actionsManager.disconnect();
  };

  // Helper methods (delegated to HelpersManager)
  getCardById = this.helpersManager.getCardById;
  getVotingCardById = this.helpersManager.getVotingCardById;
  getPlayerById = this.helpersManager.getPlayerById;
  canSubmitCard = this.helpersManager.canSubmitCard;
  canVote = this.helpersManager.canVote;
  canLeaderSubmitCard = this.helpersManager.canLeaderSubmitCard;

  // Additional helper methods
  getReadyPlayers = this.helpersManager.getReadyPlayers;
  getOnlinePlayers = this.helpersManager.getOnlinePlayers;
  hasCardInHand = this.helpersManager.hasCardInHand;
  getHandSize = this.helpersManager.getHandSize;
  getVotingCardsCount = this.helpersManager.getVotingCardsCount;
  canPlayerAct = this.helpersManager.canPlayerAct;

  // UI state helpers
  shouldShowReadyButton = this.helpersManager.shouldShowReadyButton;
  shouldShowStartGameButton = this.helpersManager.shouldShowStartGameButton;
  shouldShowLeaderCardSubmission =
    this.helpersManager.shouldShowLeaderCardSubmission;
  shouldShowPlayerCardSubmission =
    this.helpersManager.shouldShowPlayerCardSubmission;
  shouldShowVoting = this.helpersManager.shouldShowVoting;
  shouldShowResults = this.helpersManager.shouldShowResults;
  shouldShowNextRoundButton = this.helpersManager.shouldShowNextRoundButton;

  // Phase checks
  isJoiningPhase = this.helpersManager.isJoiningPhase;
  isLeaderSubmittingPhase = this.helpersManager.isLeaderSubmittingPhase;
  isPlayersSubmittingPhase = this.helpersManager.isPlayersSubmittingPhase;
  isVotingPhase = this.helpersManager.isVotingPhase;
  isResultsPhase = this.helpersManager.isResultsPhase;

  // Player info helpers
  getPlayerStatus = this.helpersManager.getPlayerStatus;
  getPlayerNickname = this.helpersManager.getPlayerNickname;
  getPlayerScore = this.helpersManager.getPlayerScore;
  getWinner = this.helpersManager.getWinner;
}
