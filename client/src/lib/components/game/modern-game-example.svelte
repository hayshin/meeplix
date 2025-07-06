<script lang="ts">
  import { useGameStore } from "$lib/stores/game";
  import { onMount } from "svelte";

  const game = useGameStore();

  // Example of using individual store methods
  let selectedCard = $state<string | null>(null);
  let description = $state("");

  // Example of reactive derived state
  const gameStatus = $derived({
    phase: game.state.phase,
    playerCount: game.totalPlayersCount,
    readyCount: game.readyPlayersCount,
    isConnected: game.state.isConnected,
    hasError: !!game.state.error,
  });

  // Example of using helper methods
  const canAct = $derived(game.canPlayerAct());
  const currentPlayerName = $derived(
    game.state.currentPlayer?.username || "Unknown",
  );

  // Example effect that reacts to phase changes
  $effect(() => {
    console.log(`Game phase changed to: ${game.state.phase}`);

    // Clear selections when phase changes
    if (
      game.state.phase !== "leader_submitting" &&
      game.state.phase !== "players_submitting"
    ) {
      selectedCard = null;
      description = "";
    }
  });

  // Action handlers using the new store
  const handleJoinRoom = () => {
    const nickname = prompt("Enter your nickname:");
    if (nickname) {
      game.joinRoom("demo-room", nickname);
    }
  };

  const handleReady = () => {
    game.setReady();
  };

  const handleStartGame = () => {
    game.startGame();
  };

  const handleSubmitLeaderCard = () => {
    if (selectedCard && description.trim()) {
      game.submitLeaderCard(selectedCard, description.trim());
      selectedCard = null;
      description = "";
    }
  };

  const handleSubmitPlayerCard = () => {
    if (selectedCard) {
      game.submitPlayerCard(selectedCard);
      selectedCard = null;
    }
  };

  const handleVote = (cardId: string) => {
    game.submitVote(cardId);
  };

  // Example of checking specific conditions
  const showJoinButton = $derived(
    !game.state.isConnected && !game.state.isConnecting,
  );
  const showReadyButton = $derived(game.shouldShowReadyButton());
  const showStartButton = $derived(game.shouldShowStartGameButton());
  const showLeaderSubmission = $derived(game.shouldShowLeaderCardSubmission());
  const showPlayerSubmission = $derived(game.shouldShowPlayerCardSubmission());
  const showVoting = $derived(game.shouldShowVoting());
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Modern Game Store Example</h1>

  <!-- Connection Status -->
  <div
    class="mb-6 p-4 rounded-lg {game.state.isConnected
      ? 'bg-green-100'
      : 'bg-red-100'}"
  >
    <h2 class="text-xl font-semibold mb-2">Connection Status</h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <strong>Status:</strong>
        {#if game.state.isConnecting}
          Connecting...
        {:else if game.state.isConnected}
          Connected
        {:else}
          Disconnected
        {/if}
      </div>
      <div><strong>Room ID:</strong> {game.state.roomId || "Not in room"}</div>
      <div><strong>Player:</strong> {currentPlayerName}</div>
      <div><strong>Phase:</strong> {gameStatus.phase}</div>
      <div>
        <strong>Players:</strong>
        {gameStatus.readyCount}/{gameStatus.playerCount} ready
      </div>
      <div><strong>Can Act:</strong> {canAct ? "Yes" : "No"}</div>
    </div>
  </div>

  <!-- Error Display -->
  {#if game.state.error}
    <div class="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="text-red-700">{game.state.error}</span>
        <button
          onclick={game.clearError}
          class="text-red-500 hover:text-red-700"
        >
          Clear
        </button>
      </div>
    </div>
  {/if}

  <!-- Game Actions -->
  <div class="mb-6 p-4 bg-gray-100 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Game Actions</h2>
    <div class="flex flex-wrap gap-2">
      {#if showJoinButton}
        <button
          onclick={handleJoinRoom}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join Room
        </button>
      {/if}

      {#if showReadyButton}
        <button
          onclick={handleReady}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Ready
        </button>
      {/if}

      {#if showStartButton}
        <button
          onclick={handleStartGame}
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Start Game
        </button>
      {/if}

      <button
        onclick={game.disconnect}
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={!game.state.isConnected}
      >
        Disconnect
      </button>
    </div>
  </div>

  <!-- Players List -->
  {#if game.state.players.length > 0}
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Players</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        {#each game.state.players as player}
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span class="font-medium">{player.username}</span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{player.score} pts</span>
              <span
                class="text-xs px-2 py-1 rounded {player.status === 'ready'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-yellow-200 text-yellow-800'}"
              >
                {player.status}
              </span>
              {#if player.id === game.state.leaderId}
                <span
                  class="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded"
                  >Leader</span
                >
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Leader Card Submission -->
  {#if showLeaderSubmission}
    <div class="mb-6 p-4 bg-purple-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">
        Leader: Choose Card & Description
      </h2>

      <div class="mb-4">
        <label for="description" class="block text-sm font-medium mb-2"
          >Description:</label
        >
        <input
          id="description"
          bind:value={description}
          placeholder="Describe your card..."
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="mb-4">
        <h3 class="text-lg font-medium mb-2">Your Cards:</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          {#each game.state.currentHand as card}
            <button
              onclick={() => (selectedCard = card.id)}
              class="p-3 border rounded text-center transition-colors {selectedCard ===
              card.id
                ? 'bg-blue-200 border-blue-500'
                : 'bg-white hover:bg-gray-50'}"
            >
              {card.name}
            </button>
          {/each}
        </div>
      </div>

      <button
        onclick={handleSubmitLeaderCard}
        disabled={!selectedCard || !description.trim()}
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        Submit Choice
      </button>
    </div>
  {/if}

  <!-- Player Card Submission -->
  {#if showPlayerSubmission}
    <div class="mb-6 p-4 bg-blue-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Choose Your Card</h2>
      <p class="mb-4 text-gray-700">
        Match this description: "{game.state.currentDescription}"
      </p>

      <div class="mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          {#each game.state.currentHand as card}
            <button
              onclick={() => (selectedCard = card.id)}
              class="p-3 border rounded text-center transition-colors {selectedCard ===
              card.id
                ? 'bg-blue-200 border-blue-500'
                : 'bg-white hover:bg-gray-50'}"
            >
              {card.name}
            </button>
          {/each}
        </div>
      </div>

      <button
        onclick={handleSubmitPlayerCard}
        disabled={!selectedCard}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Submit Card
      </button>
    </div>
  {/if}

  <!-- Voting -->
  {#if showVoting}
    <div class="mb-6 p-4 bg-green-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Vote for the Leader's Card</h2>
      <p class="mb-4 text-gray-700">
        Which card matches: "{game.state.currentDescription}"?
      </p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        {#each game.state.cardsForVoting as card}
          <button
            onclick={() => handleVote(card.id)}
            class="p-3 border rounded text-center bg-white hover:bg-gray-50 transition-colors"
          >
            {card.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if game.isResultsPhase()}
    <div class="mb-6 p-4 bg-yellow-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Round Results</h2>
      <p class="mb-4">Description was: "{game.state.currentDescription}"</p>
      <p class="mb-4">Votes received: {game.state.votes.length}</p>

      {#if game.shouldShowNextRoundButton()}
        <button
          onclick={game.startNextRound}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start Next Round
        </button>
      {/if}
    </div>
  {/if}

  <!-- Game Finished -->
  {#if game.isGameFinished}
    <div class="mb-6 p-4 bg-gold-100 rounded-lg border border-gold-400">
      <h2 class="text-2xl font-bold mb-4">🏆 Game Over!</h2>
      {#if game.getWinner()}
        <p class="text-xl">
          Winner: {game.getWinner()?.username} with {game.getWinner()?.score} points!
        </p>
      {/if}
    </div>
  {/if}

  <!-- Debug Info -->
  <details class="mt-8">
    <summary class="cursor-pointer font-semibold">Debug Information</summary>
    <pre class="mt-2 p-4 bg-gray-100 rounded overflow-auto text-sm">
{JSON.stringify(
        {
          state: game.state,
          derived: {
            isGameStarted: game.isGameStarted,
            isCurrentPlayerLeader: game.isCurrentPlayerLeader,
            currentLeader: game.currentLeader,
            canStartGame: game.canStartGame,
            allPlayersReady: game.allPlayersReady,
            isGameFinished: game.isGameFinished,
            readyPlayersCount: game.readyPlayersCount,
            totalPlayersCount: game.totalPlayersCount,
          },
        },
        null,
        2,
      )}
    </pre>
  </details>
</div>

<style>
  .bg-gold-100 {
    background-color: #fef3c7;
  }
  .border-gold-400 {
    border-color: #f59e0b;
  }
</style>
