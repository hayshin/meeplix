<script lang="ts">
  import { type GameState } from "$lib/stores/game/types";
  import { type Player } from "$shared/models/player";
  import { type PublicCard } from "$shared/models/public_card";
  import { type Vote } from "$shared/models/vote";
  import GameHeader from "./game-header.svelte";
  import GameStatusBar from "./game-status-bar.svelte";
  import NicknameModal from "./nickname-modal.svelte";
  import PlayerHand from "./player-hand.svelte";

  interface GameLayoutProps {
    roomId: string;
    gameState: GameState;
    gamePhase: string;
    showNicknameModal: boolean;
    nickname: string;
    isCurrentPlayerLeader: boolean;
    canStartGame: boolean;
    allPlayersReady: boolean;
    currentLeader: Player | null;
    association: string;
    selectedCardId: string | null;
    selectedVoteCardId: string | null;
    enlargedCardId: string | null;
    associationInput: string;
    votingCards: PublicCard[];
    currentPlayerHand: PublicCard[];
    leaderCard: PublicCard | null;
    votedPairs: Vote[];
    players: Player[];
    isGameFinished: boolean;
    winner: Player | null;
    onNicknameChange: (value: string) => void;
    onNicknameSubmit: () => void;
    onLeaveGame: () => void;
    onToggleReady: () => void;
    onStartGame: () => void;
    onAssociationChange: (value: string) => void;
    onSubmitLeaderChoice: () => void;
    onSubmitPlayerCard: () => void;
    onSubmitVote: () => void;
    onStartNextRound: () => void;
    onCardSelect: (cardId: string) => void;
    onCardEnlarge: (cardId: string | null) => void;
    onVoteCardSelect: (cardId: string) => void;
    onConnectToGame: () => void;
  }

  let {
    roomId,
    gameState,
    gamePhase,
    showNicknameModal,
    nickname,
    isCurrentPlayerLeader,
    canStartGame,
    allPlayersReady,
    currentLeader,
    association,
    selectedCardId,
    selectedVoteCardId,
    enlargedCardId,
    associationInput,
    votingCards,
    currentPlayerHand,
    leaderCard,
    votedPairs,
    players,
    isGameFinished,
    winner,
    onNicknameChange,
    onNicknameSubmit,
    onLeaveGame,
    onToggleReady,
    onStartGame,
    onAssociationChange,
    onSubmitLeaderChoice,
    onSubmitPlayerCard,
    onSubmitVote,
    onStartNextRound,
    onCardSelect,
    onCardEnlarge,
    onVoteCardSelect,
    onConnectToGame,
  }: GameLayoutProps = $props();

  // Debug logging for gamePhase changes
  $effect(() => {
    console.log("=== GAME LAYOUT DEBUG ===");
    console.log("gamePhase:", gamePhase);
    console.log("isCurrentPlayerLeader:", isCurrentPlayerLeader);
    console.log("gameState.phase:", gameState.phase);
    console.log("========================");
  });
</script>

<div
  class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
>
  <!-- Header -->
  <GameHeader
    {roomId}
    {gameState}
    {canStartGame}
    {allPlayersReady}
    {isCurrentPlayerLeader}
    {onLeaveGame}
    {onToggleReady}
    {onStartGame}
  />

  <!-- Main Content -->
  <div class="container mx-auto px-4 py-8">
    <!-- Game Status Bar -->
    <GameStatusBar {gameState} {isCurrentPlayerLeader} />

    <!-- Error Display -->
    {#if gameState.error}
      <div class="mb-4 p-4 bg-red-500 text-white rounded-lg">
        <div class="flex justify-between items-center">
          <span>{gameState.error}</span>
          <button
            onclick={() => (gameState.error = null)}
            class="text-white hover:text-red-200"
          >
            ×
          </button>
        </div>
      </div>
    {/if}

    <!-- Game Phases -->
    <div class="space-y-8">
      <!-- Joining Phase -->
      {#if gamePhase === "joining"}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-4">
            Waiting for Players
          </h2>

          <div class="space-y-4">
            <!-- Players List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each players as player}
                <div class="bg-white/20 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-white font-medium">{player.username}</span
                    >
                    <span
                      class="text-sm {player.status === 'ready'
                        ? 'text-green-300'
                        : 'text-yellow-300'}"
                    >
                      {player.status === "ready" ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              {#if gameState.currentPlayer?.status !== "ready"}
                <button
                  onclick={onToggleReady}
                  class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Ready
                </button>
              {/if}

              {#if canStartGame && isCurrentPlayerLeader}
                <button
                  onclick={onStartGame}
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Start Game
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Leader Submitting Phase -->
      {#if gamePhase === "leader_submitting" && isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-4">
            Choose a Card and Description
          </h2>

          <div class="space-y-4">
            <div>
              <label for="description-input" class="block text-white mb-2"
                >Description:</label
              >
              <input
                id="description-input"
                bind:value={associationInput}
                placeholder="Describe your card..."
                class="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60"
              />
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {#each currentPlayerHand as card}
                <button
                  onclick={() => onCardSelect(card.id)}
                  class="p-4 rounded-lg transition-all {selectedCardId ===
                  card.id
                    ? 'bg-blue-500'
                    : 'bg-white/20 hover:bg-white/30'}"
                >
                  <div class="text-white text-center">
                    {card.name}
                  </div>
                </button>
              {/each}
            </div>

            <button
              onclick={onSubmitLeaderChoice}
              disabled={!selectedCardId || !associationInput.trim()}
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Submit Choice
            </button>
          </div>
        </div>
      {:else if gamePhase === "leader_submitting" && !isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <h2 class="text-2xl font-bold text-white mb-4">Waiting for Leader</h2>
          <p class="text-white/80">
            {currentLeader?.username} is choosing a card and description...
          </p>
        </div>
      {/if}

      <!-- Players Submitting Phase -->
      {#if gamePhase === "players_submitting" && !isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-4">Choose Your Card</h2>
          <p class="text-white/80 mb-4">
            Choose a card that matches: "{association}"
          </p>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each currentPlayerHand as card}
              <button
                onclick={() => onCardSelect(card.id)}
                class="p-4 rounded-lg transition-all {selectedCardId === card.id
                  ? 'bg-blue-500'
                  : 'bg-white/20 hover:bg-white/30'}"
              >
                <div class="text-white text-center">
                  {card.name}
                </div>
              </button>
            {/each}
          </div>

          {#if selectedCardId}
            <button
              onclick={onSubmitPlayerCard}
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Submit Card
            </button>
          {/if}
        </div>
      {:else if gamePhase === "players_submitting" && isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <h2 class="text-2xl font-bold text-white mb-4">
            Waiting for Players
          </h2>
          <p class="text-white/80">
            Players are choosing cards that match: "{association}"
          </p>
        </div>
      {/if}

      <!-- Voting Phase -->
      {#if gamePhase === "voting" && !isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-4">
            Vote for the Leader's Card
          </h2>
          <p class="text-white/80 mb-4">Which card matches: "{association}"?</p>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each votingCards as card}
              <button
                onclick={() => onVoteCardSelect(card.id)}
                class="p-4 rounded-lg transition-all {selectedVoteCardId ===
                card.id
                  ? 'bg-blue-500'
                  : 'bg-white/20 hover:bg-white/30'}"
              >
                <div class="text-white text-center">
                  {card.name}
                </div>
              </button>
            {/each}
          </div>

          {#if selectedVoteCardId}
            <button
              onclick={onSubmitVote}
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Submit Vote
            </button>
          {/if}
        </div>
      {:else if gamePhase === "voting" && isCurrentPlayerLeader}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <h2 class="text-2xl font-bold text-white mb-4">Voting in Progress</h2>
          <p class="text-white/80">
            Players are voting for your card: "{association}"
          </p>
        </div>
      {/if}

      <!-- Results Phase -->
      {#if gamePhase === "results"}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-4">Round Results</h2>

          <div class="space-y-4">
            <div class="text-white">
              <p>Description: "{association}"</p>
              <p>Votes: {votedPairs.length}</p>
            </div>

            <!-- Players and Scores -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each players as player}
                <div class="bg-white/20 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-white font-medium">{player.username}</span
                    >
                    <span class="text-white">{player.score} points</span>
                  </div>
                </div>
              {/each}
            </div>

            {#if isCurrentPlayerLeader && !isGameFinished}
              <button
                onclick={onStartNextRound}
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Next Round
              </button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Game Finished -->
      {#if gamePhase === "game_finished"}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Game Over!</h2>
          {#if winner}
            <p class="text-2xl text-yellow-300 mb-4">
              🏆 {winner.username} wins with {winner.score} points!
            </p>
          {/if}

          <button
            onclick={onLeaveGame}
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Leave Game
          </button>
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
