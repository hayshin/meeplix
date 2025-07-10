<script lang="ts">
  import { useGameStore } from "$lib/stores/game";
  import GameHeader from "./game-header.svelte";
  import GameStatusBar from "./game-status-bar.svelte";
  import NicknameModal from "./nickname-modal.svelte";
  import PlayerHand from "./player-hand.svelte";
  import GameCard from "./game-card.svelte";

  interface GameLayoutProps {
    showNicknameModal: boolean;
    nickname: string;
    selectedCardId: string | null;
    selectedVoteCardId: string | null;
    enlargedCardId: string | null;
    associationInput: string;
    onNicknameChange: (value: string) => void;
    onNicknameSubmit: () => void;
    onLeaveGame: () => void;
    onAssociationChange: (value: string) => void;
    onCardSelect: (cardId: string) => void;
    onCardEnlarge: (cardId: string | null) => void;
    onVoteCardSelect: (cardId: string) => void;
    onConnectToGame: () => void;
  }

  let {
    showNicknameModal,
    nickname,
    selectedCardId,
    selectedVoteCardId,
    enlargedCardId,
    associationInput,
    onNicknameChange,
    onNicknameSubmit,
    onLeaveGame,
    onAssociationChange,
    onCardSelect,
    onCardEnlarge,
    onVoteCardSelect,
    onConnectToGame,
  }: GameLayoutProps = $props();

  // Use the game store
  const gameStore = useGameStore();

  // Destructure individual stores
  const {
    gameState,
    isGameStarted,
    isCurrentPlayerLeader,
    canStartGame,
    allPlayersReady,
    currentLeader,
    isGameFinished,
  } = gameStore;

  // Derived values from store using $derived
  const roomState = $derived($gameState);
  const gamePhase = $derived(roomState.phase);
  const roomId = $derived(roomState.roomId);
  const association = $derived(roomState.currentDescription);
  const votingCards = $derived(roomState.cardsForVoting);
  const currentPlayerHand = $derived(roomState.currentHand);
  const votedPairs = $derived(roomState.votes);
  const players = $derived(roomState.players);
  const winner = $derived(roomState.winner);
  let hasSubmitted = $derived(false);
  let hoveredCard = $state<string | null>(null);

  // Store actions and helpers
  const actions = gameStore.actions;
  const helpers = gameStore.helpers;

  // Action handlers using store
  function handleToggleReady() {
    actions.setReady();
  }

  function handleStartGame() {
    actions.startGame();
  }

  function handleSubmitLeaderChoice() {
    if (selectedCardId && associationInput.trim()) {
      actions.submitLeaderCard(selectedCardId, associationInput.trim());
    }
  }

  function handleSubmitPlayerCard() {
    if (selectedCardId) {
      hasSubmitted = true;
      actions.submitPlayerCard(selectedCardId);
    }
  }

  function handleSubmitVote() {
    if (selectedVoteCardId) {
      actions.submitVote(selectedVoteCardId);
    }
  }

  function handleStartNextRound() {
    actions.startNextRound();
  }

  function handleClearError() {
    actions.clearError();
  }

  // Debug logging for gamePhase changes using $effect
  $effect(() => {
    console.log("=== GAME LAYOUT DEBUG ===");
    console.log("gamePhase:", gamePhase);
    console.log("isCurrentPlayerLeader:", $isCurrentPlayerLeader);
    console.log("roomState.phase:", roomState.phase);
    console.log("========================");
  });

  function handleCardHover(cardId: string | null) {
    hoveredCard = cardId;
  }
</script>

<div
  class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col"
>
  <!-- Header -->
  <GameHeader
    roomId={roomId || ""}
    gameState={roomState}
    canStartGame={$canStartGame}
    allPlayersReady={$allPlayersReady}
    isCurrentPlayerLeader={$isCurrentPlayerLeader}
    {onLeaveGame}
    onToggleReady={handleToggleReady}
    onStartGame={handleStartGame}
  />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col">
    <!-- Top Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Game Status Bar -->
      <GameStatusBar
        gameState={roomState}
        isCurrentPlayerLeader={$isCurrentPlayerLeader}
      />

      <!-- Error Display -->
      {#if roomState.error}
        <div class="mb-4 p-4 bg-red-500 text-white rounded-lg">
          <div class="flex justify-between items-center">
            <span>{roomState.error}</span>
            <button
              onclick={handleClearError}
              class="text-white hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Center Preview Area -->
    <div class="flex-1 flex items-center justify-center px-4">
      {#if hoveredCard}
        {@const card = [...currentPlayerHand, ...votingCards].find(
          (c) => c.id === hoveredCard,
        )}
        {#if card}
          <div class="w-80 h-96 transition-all duration-300 ease-out">
            <GameCard
              {card}
              isSelected={selectedCardId === card.id ||
                selectedVoteCardId === card.id}
              isClickable={false}
              isEnlarged={false}
            />
          </div>
        {/if}
      {:else}
        <div class="text-center text-white/60">
          <div class="text-6xl mb-4">🎭</div>
          <p class="text-lg">Hover over a card to preview it here</p>
        </div>
      {/if}
    </div>

    <!-- Game Phase Info -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
      <!-- Joining Phase -->
      {#if gamePhase === "joining"}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Waiting for Players</h2>
          <div class="flex justify-center gap-4 mb-4">
            {#each players as player}
              <div class="bg-white/20 rounded-lg p-2">
                <div class="text-white text-sm font-medium">
                  {player.username}
                </div>
                <div
                  class="text-xs {player.status === 'ready'
                    ? 'text-green-300'
                    : 'text-yellow-300'}"
                >
                  {player.status === "ready" ? "Ready" : "Not Ready"}
                </div>
              </div>
            {/each}
          </div>
          <div class="flex justify-center gap-4">
            {#if helpers.shouldShowReadyButton()}
              <button
                onclick={handleToggleReady}
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Ready
              </button>
            {/if}
            {#if helpers.shouldShowStartGameButton()}
              <button
                onclick={handleStartGame}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Start Game
              </button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Leader Submitting Phase -->
      {#if gamePhase === "leader_submitting" && $isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">
            Choose a Card and Description
          </h2>
          <div class="mb-4">
            <input
              id="description-input"
              bind:value={associationInput}
              oninput={(e) =>
                onAssociationChange((e.target as HTMLInputElement).value)}
              placeholder="Describe your card..."
              class="w-full max-w-md p-2 rounded-lg bg-white/20 text-white placeholder-white/60"
            />
          </div>
          <button
            onclick={handleSubmitLeaderChoice}
            disabled={!selectedCardId || !associationInput.trim()}
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Submit Choice
          </button>
        </div>
      {:else if gamePhase === "leader_submitting" && !$isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Waiting for Leader</h2>
          <p class="text-white/80">
            {$currentLeader?.username} is choosing a card and description...
          </p>
        </div>
      {/if}

      <!-- Players Submitting Phase -->
      {#if gamePhase === "players_submitting" && !$isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Choose Your Card</h2>
          <p class="text-white/80 mb-2">
            Choose a card that matches: "{association}"
          </p>
          {#if selectedCardId && !hasSubmitted}
            <button
              onclick={handleSubmitPlayerCard}
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Submit Card
            </button>
          {/if}
        </div>
      {:else if gamePhase === "players_submitting" && $isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Waiting for Players</h2>
          <p class="text-white/80">
            Players are choosing cards that match: "{association}"
          </p>
        </div>
      {/if}

      <!-- Voting Phase -->
      {#if gamePhase === "voting" && !$isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">
            Vote for the Leader's Card
          </h2>
          <p class="text-white/80 mb-2">Which card matches: "{association}"?</p>
          {#if selectedVoteCardId}
            <button
              onclick={handleSubmitVote}
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Submit Vote
            </button>
          {/if}
        </div>
      {:else if gamePhase === "voting" && $isCurrentPlayerLeader}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Voting in Progress</h2>
          <p class="text-white/80">
            Players are voting for your card: "{association}"
          </p>
        </div>
      {/if}

      <!-- Results Phase -->
      {#if gamePhase === "results"}
        <div class="text-center">
          <h2 class="text-xl font-bold text-white mb-2">Round Results</h2>
          <div class="text-white mb-4">
            <p>Description: "{association}"</p>
            <p>Votes: {votedPairs.length}</p>
          </div>
          <div class="flex justify-center gap-4 mb-4">
            {#each players as player}
              <div class="bg-white/20 rounded-lg p-2">
                <div class="text-white text-sm font-medium">
                  {player.username}
                </div>
                <div class="text-white text-xs">{player.score} points</div>
              </div>
            {/each}
          </div>
          {#if helpers.shouldShowNextRoundButton()}
            <button
              onclick={handleStartNextRound}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Next Round
            </button>
          {/if}
        </div>
      {/if}

      <!-- Game Finished -->
      {#if gamePhase === "game_finished"}
        <div class="text-center">
          <h2 class="text-2xl font-bold text-white mb-2">Game Over!</h2>
          {#if winner}
            <p class="text-xl text-yellow-300 mb-4">
              🏆 {winner.username} wins with {winner.score} points!
            </p>
          {/if}
          <button
            onclick={onLeaveGame}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Leave Game
          </button>
        </div>
      {/if}
    </div>

    <!-- Bottom Cards Area -->
    <div class="bg-white/10 backdrop-blur-sm rounded-t-lg p-4">
      <!-- Current Player Hand -->
      {#if gamePhase === "leader_submitting" && $isCurrentPlayerLeader}
        <div class="text-center mb-2">
          <h3 class="text-white font-medium">Your Cards</h3>
        </div>
        <div class="flex justify-center gap-2 overflow-x-auto pb-2">
          {#each currentPlayerHand as card}
            <div class="flex-shrink-0 w-24 h-32">
              <GameCard
                {card}
                isSelected={selectedCardId === card.id}
                onclick={() => onCardSelect(card.id)}
                onEnlarge={() => onCardEnlarge(card.id)}
                onmouseenter={() => handleCardHover(card.id)}
                onmouseleave={() => handleCardHover(null)}
              />
            </div>
          {/each}
        </div>
      {/if}

      {#if gamePhase === "players_submitting" && !$isCurrentPlayerLeader}
        <div class="text-center mb-2">
          <h3 class="text-white font-medium">Your Cards</h3>
        </div>
        <div class="flex justify-center gap-2 overflow-x-auto pb-2">
          {#each currentPlayerHand as card}
            <div class="flex-shrink-0 w-24 h-32">
              <GameCard
                {card}
                isSelected={selectedCardId === card.id}
                onclick={() => onCardSelect(card.id)}
                onEnlarge={() => onCardEnlarge(card.id)}
                onmouseenter={() => handleCardHover(card.id)}
                onmouseleave={() => handleCardHover(null)}
              />
            </div>
          {/each}
        </div>
      {/if}

      <!-- Voting Cards -->
      {#if gamePhase === "voting" && !$isCurrentPlayerLeader}
        <div class="text-center mb-2">
          <h3 class="text-white font-medium">Vote for the Leader's Card</h3>
        </div>
        <div class="flex justify-center gap-2 overflow-x-auto pb-2">
          {#each votingCards as card}
            <div class="flex-shrink-0 w-24 h-32">
              <GameCard
                {card}
                isSelected={selectedVoteCardId === card.id}
                onclick={() => onVoteCardSelect(card.id)}
                onEnlarge={() => onCardEnlarge(card.id)}
                onmouseenter={() => handleCardHover(card.id)}
                onmouseleave={() => handleCardHover(null)}
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Nickname Modal -->
  {#if showNicknameModal}
    <NicknameModal
      show={showNicknameModal}
      {nickname}
      {onNicknameChange}
      onSubmit={onNicknameSubmit}
    />
  {/if}
</div>
