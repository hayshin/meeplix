<script lang="ts">
  import { onMount } from "svelte";
  import {
    useGameStore,
    useGameState,
    useGameActions,
    gameState,
    isGameStarted,
    isCurrentPlayerLeader,
    currentLeader,
    readyPlayersCount,
    totalPlayersCount,
  } from "$lib/stores/game";

  // Method 1: Using the main composable
  const gameStore = useGameStore();

  // Method 2: Using individual composables
  const state = useGameState();
  const actions = useGameActions();

  // Method 3: Direct store subscriptions (can use $ syntax)
  // These are already imported above: gameState, isGameStarted, etc.

  // Example of reactive statements with stores
  $: playerCount = $readyPlayersCount;
  $: totalCount = $totalPlayersCount;
  $: gamePhase = $state.phase;
  $: currentPlayerName = $state.currentPlayer?.username || "Unknown";
  $: roomId = $state.roomId;

  // Example actions
  function handleCreateRoom() {
    // Method 1: Using composable
    gameStore.actions.createRoom("TestPlayer");

    // Method 2: Using actions composable
    // actions.createRoom('TestPlayer');
  }

  function handleJoinRoom() {
    if (roomId) {
      gameStore.actions.joinRoom(roomId, "TestPlayer");
    }
  }

  function handleSetReady() {
    gameStore.actions.setReady();
  }

  function handleStartGame() {
    gameStore.actions.startGame();
  }

  function handleDisconnect() {
    gameStore.actions.disconnect();
  }

  // Example of using helpers
  function checkCanStartGame() {
    return gameStore.helpers.shouldShowStartGameButton();
  }

  onMount(() => {
    console.log("Game store example mounted");

    // Example of manually subscribing to stores
    const unsubscribe = gameState.subscribe((state) => {
      console.log("Game state updated:", state);
    });

    // Return cleanup function
    return () => {
      unsubscribe();
    };
  });
</script>

<div class="game-store-example">
  <h2>Game Store Example</h2>

  <!-- Connection Status -->
  <div class="status-section">
    <h3>Connection Status</h3>
    <p>Connected: {$gameState.isConnected ? "Yes" : "No"}</p>
    <p>Connecting: {$gameState.isConnecting ? "Yes" : "No"}</p>
    <p>Room ID: {roomId || "None"}</p>
  </div>

  <!-- Player Info -->
  <div class="player-section">
    <h3>Player Information</h3>
    <p>Current Player: {currentPlayerName}</p>
    <p>Is Leader: {$isCurrentPlayerLeader ? "Yes" : "No"}</p>
    <p>Leader: {$currentLeader?.username || "None"}</p>
  </div>

  <!-- Game State -->
  <div class="game-section">
    <h3>Game State</h3>
    <p>Phase: {gamePhase}</p>
    <p>Game Started: {$isGameStarted ? "Yes" : "No"}</p>
    <p>Round: {$gameState.roundNumber}</p>
    <p>Players: {playerCount} / {totalCount}</p>
  </div>

  <!-- Actions -->
  <div class="actions-section">
    <h3>Actions</h3>
    <button on:click={handleCreateRoom} disabled={$gameState.isConnecting}>
      Create Room
    </button>

    <button
      on:click={handleJoinRoom}
      disabled={!roomId || $gameState.isConnecting}
    >
      Join Room
    </button>

    <button on:click={handleSetReady} disabled={!$gameState.currentPlayer}>
      Set Ready
    </button>

    {#if checkCanStartGame()}
      <button on:click={handleStartGame}> Start Game </button>
    {/if}

    <button on:click={handleDisconnect} disabled={!$gameState.isConnected}>
      Disconnect
    </button>
  </div>

  <!-- Players List -->
  <div class="players-section">
    <h3>Players ({$gameState.players.length})</h3>
    {#each $gameState.players as player}
      <div class="player-item">
        <span class="player-name">{player.username}</span>
        <span class="player-status">{player.status}</span>
        <span class="player-score">Score: {player.score}</span>
      </div>
    {/each}
  </div>

  <!-- Cards -->
  {#if $gameState.currentHand.length > 0}
    <div class="cards-section">
      <h3>Current Hand ({gameStore.helpers.getHandSize()})</h3>
      {#each $gameState.currentHand as card}
        <div class="card-item">
          <!-- <span class="card-text">{card.text}</span> -->
        </div>
      {/each}
    </div>
  {/if}

  <!-- Voting Cards -->
  {#if $gameState.cardsForVoting.length > 0}
    <div class="voting-section">
      <h3>Voting Cards ({gameStore.helpers.getVotingCardsCount()})</h3>
      {#each $gameState.cardsForVoting as card}
        <div class="voting-card">
          <!-- <span class="card-text">{card.text}</span> -->
          {#if gameStore.helpers.canVote()}
            <button on:click={() => gameStore.actions.submitVote(card.id)}>
              Vote
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Error Display -->
  {#if $gameState.error}
    <div class="error-section">
      <h3>Error</h3>
      <p class="error-message">{$gameState.error}</p>
      <button on:click={() => gameStore.actions.clearError()}>
        Clear Error
      </button>
    </div>
  {/if}

  <!-- Helper States -->
  <div class="helpers-section">
    <h3>Helper States</h3>
    <p>Show Ready Button: {gameStore.helpers.shouldShowReadyButton()}</p>
    <p>
      Show Start Game Button: {gameStore.helpers.shouldShowStartGameButton()}
    </p>
    <p>
      Show Leader Card Submission: {gameStore.helpers.shouldShowLeaderCardSubmission()}
    </p>
    <p>
      Show Player Card Submission: {gameStore.helpers.shouldShowPlayerCardSubmission()}
    </p>
    <p>Show Voting: {gameStore.helpers.shouldShowVoting()}</p>
    <p>Show Results: {gameStore.helpers.shouldShowResults()}</p>
    <p>
      Show Next Round Button: {gameStore.helpers.shouldShowNextRoundButton()}
    </p>
  </div>
</div>

<style>
  .game-store-example {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .status-section,
  .player-section,
  .game-section,
  .actions-section,
  .players-section,
  .cards-section,
  .voting-section,
  .error-section,
  .helpers-section {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .actions-section button {
    margin-right: 10px;
    margin-bottom: 5px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .actions-section button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .actions-section button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .player-item {
    display: flex;
    gap: 10px;
    padding: 5px 0;
    border-bottom: 1px solid #eee;
  }

  .player-name {
    font-weight: bold;
    min-width: 120px;
  }

  .player-status {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    background-color: #e9ecef;
  }

  .player-score {
    margin-left: auto;
    font-weight: bold;
  }

  .card-item,
  .voting-card {
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
  }

  .voting-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-text {
    font-style: italic;
  }

  .error-section {
    background-color: #fee;
    border-color: #fcc;
  }

  .error-message {
    color: #d00;
    margin-bottom: 10px;
  }

  .helpers-section p {
    margin: 5px 0;
    font-size: 14px;
  }

  h2 {
    color: #333;
    text-align: center;
  }

  h3 {
    color: #666;
    margin-top: 0;
  }
</style>
