<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import { useGameStore } from "$lib/stores/game";
  import GameLayout from "$lib/components/game/game-layout.svelte";

  // Use the game store
  const gameStore = useGameStore();
  const {
    gameState,
    actions,
    isCurrentPlayerLeader,
    canStartGame,
    allPlayersReady,
  } = gameStore;

  // Get room ID from page params
  const roomId = $page.params.id;

  // Local component state (not managed by game store)
  let nickname = $state("");
  let showNicknameModal = $state(false);
  let showGameSessionsModal = $state(false);
  let associationInput = $state("");
  let selectedCardId = $state<string | null>(null);
  let selectedVoteCardId = $state<string | null>(null);
  let enlargedCardId = $state<string | null>(null);
  let initialized = $state(false);

  // Initialize the game page
  $effect(() => {
    if (initialized) return;
    initialized = true;
    console.log("Game page initialized for room:", roomId);

    // Try to reconnect to existing session first
    const gameSession = storage.getGameSession(roomId);
    if (gameSession) {
      console.log(
        "Found existing game session, attempting reconnect:",
        gameSession,
      );
      nickname = gameSession.playerName;
      attemptReconnect(gameSession);
      return;
    }

    // Check for saved nickname for new connections
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      // Only connect if we don't already have a current player AND we're not already in this room
      if (
        !$gameState.currentPlayer &&
        $gameState.roomId !== roomId &&
        !$gameState.isJoining
      ) {
        connectToGame();
      }
    } else {
      showNicknameModal = true;
    }
  });

  // Reconnection logic
  const attemptReconnect = async (gameSession: any) => {
    if (
      $gameState.isConnecting ||
      $gameState.isJoining ||
      ($gameState.currentPlayer && $gameState.roomId === roomId)
    ) {
      console.log("Already connecting or connected to this room");
      return;
    }

    console.log("Attempting to reconnect to game session:", gameSession);
    actions.reconnect(
      gameSession.roomId,
      gameSession.playerId,
      gameSession.playerName,
    );
  };

  // Connect to game
  const connectToGame = async () => {
    if (!nickname.trim()) return;

    // Prevent multiple connection attempts
    if (
      $gameState.isJoining ||
      $gameState.isConnecting ||
      ($gameState.currentPlayer && $gameState.roomId === roomId)
    ) {
      console.log("Already connecting or connected to this room");
      return;
    }

    storage.saveNickname(nickname.trim());
    actions.joinRoom(roomId, nickname.trim());
    showNicknameModal = false;
  };

  // Event handlers for GameLayout
  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) return;
    await connectToGame();
  };

  const handleLeaveGame = async () => {
    actions.disconnect();
    goto("/");
  };

  const handleCardSelect = (cardId: string) => {
    selectedCardId = cardId;
  };

  const handleVoteCardSelect = (cardId: string) => {
    selectedVoteCardId = cardId;
  };

  const handleCardEnlarge = (cardId: string | null) => {
    enlargedCardId = cardId;
  };

  const handleAssociationChange = (value: string) => {
    associationInput = value;
  };

  const handleNicknameChange = (value: string) => {
    nickname = value;
  };

  // Game session modal handlers
  const handleSessionSelect = (session: any) => {
    console.log("Selected session:", session);
    if (session.roomId === roomId) {
      // Reconnect to the current room
      nickname = session.playerName;
      attemptReconnect(session);
    } else {
      // Navigate to the selected room
      goto(`/game/${session.roomId}`);
    }
    showGameSessionsModal = false;
  };

  const handleCreateNewSession = () => {
    showGameSessionsModal = false;
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      connectToGame();
    } else {
      showNicknameModal = true;
    }
  };

  const handleClearAllSessions = () => {
    storage.clearAllGameSessions();
    showGameSessionsModal = false;
    showNicknameModal = true;
  };

  const getAllGameSessions = () => {
    return storage.getAllGameSessions();
  };

  const formatLastActive = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Debug logging for reactivity
  $effect(() => {
    console.log("=== GAME STATE DEBUG ===");
    console.log("Players:", $gameState.players);
    console.log("Players count:", $gameState.players.length);
    console.log(
      "Ready players:",
      $gameState.players.filter((p) => p.status === "ready"),
    );
    console.log("Current player:", $gameState.currentPlayer);
    console.log("Leader ID:", $gameState.leaderId);
    console.log("Is current player leader:", $isCurrentPlayerLeader);
    console.log("Can start game:", $canStartGame);
    console.log("All players ready:", $allPlayersReady);
    console.log("Game phase:", $gameState.phase);
    console.log("========================");
  });
</script>

<svelte:head>
  <title>Narrari - Mystical Game Realm</title>
  <meta
    name="description"
    content="Embark on a magical journey where imagination meets artificial intelligence"
  />
</svelte:head>

<GameLayout
  {showNicknameModal}
  {nickname}
  {selectedCardId}
  {selectedVoteCardId}
  {enlargedCardId}
  {associationInput}
  onNicknameChange={handleNicknameChange}
  onNicknameSubmit={handleNicknameSubmit}
  onLeaveGame={handleLeaveGame}
  onAssociationChange={handleAssociationChange}
  onCardSelect={handleCardSelect}
  onCardEnlarge={handleCardEnlarge}
  onVoteCardSelect={handleVoteCardSelect}
  onConnectToGame={connectToGame}
/>

<!-- Game Sessions Modal -->
{#if showGameSessionsModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h2 class="text-xl font-bold mb-4">Existing Game Sessions</h2>
      <p class="text-gray-600 mb-4">
        You have existing game sessions. Would you like to reconnect to one or
        create a new session?
      </p>

      <div class="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {#each getAllGameSessions() as session (session.roomId)}
          <div
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            onclick={() => handleSessionSelect(session)}
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{session.playerName}</div>
                <div class="text-sm text-gray-500">Room: {session.roomId}</div>
                <div class="text-sm text-gray-500">
                  Phase: {session.gamePhase || "Unknown"}
                </div>
              </div>
              <div class="text-xs text-gray-400">
                {formatLastActive(session.lastActive)}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onclick={handleCreateNewSession}
        >
          Create New Session
        </button>
        <button
          class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          onclick={handleClearAllSessions}
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
{/if}
