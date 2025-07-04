<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import {
    gameState,
    gameActions,
    gamePhase,
    currentPlayerHand,
    isCurrentPlayerLeader,
    canStartGame,
    allPlayersReady,
    cardsForVoting,
  } from "$lib/stores/game";
  import {
    Play,
    Home,
    Send,
    Users,
    Clock,
    Sparkles,
    Stars,
    Wand2,
    AlertCircle,
  } from "lucide-svelte";
  import StatusBar from "$lib/components/StatusBar.svelte";
  import PlayersList from "$lib/components/PlayersList.svelte";
  import GameCard from "$lib/components/game/game-card.svelte";
  import ScoreTable from "$lib/components/ScoreTable.svelte";
  import PixelButton from "$lib/components/ui/PixelButton.svelte";
  import NicknameModal from "$lib/components/game/nickname-modal.svelte";
  import GamePhases from "$lib/components/game/game-phases.svelte";

  const roomId = $page.params.id;
  let nickname = $state("");
  let showNicknameModal = $state(false);
  let associationInput = $state("");
  let selectedCardId = $state<string | null>(null);
  let selectedVoteCardId = $state<string | null>(null);
  let enlargedCardId = $state<string | null>(null);

  $effect(() => {
    console.log(roomId);
    gameActions.setRoomId(roomId);
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      connectToGame();
    } else {
      showNicknameModal = true;
    }
  });

  const connectToGame = async () => {
    if (!nickname.trim()) return;

    storage.saveNickname(nickname.trim());
    gameActions.joinRoom(roomId, nickname.trim());
    showNicknameModal = false;
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) return;

    await connectToGame();
  };

  const startGame = async () => {
    gameActions.startGame();
  };

  const toggleReady = async () => {
    gameActions.sendReady();
  };

  const submitLeaderChoice = async () => {
    if (!selectedCardId || !associationInput.trim()) return;

    const selectedCard = $currentPlayerHand.get(selectedCardId);
    if (selectedCard) {
      gameActions.leaderSelectsCard(selectedCard, associationInput.trim());
      selectedCardId = null;
      associationInput = "";
    }
  };

  const submitPlayerCard = async () => {
    if (!selectedCardId) return;

    const selectedCard = $currentPlayerHand.get(selectedCardId);
    if (selectedCard) {
      gameActions.playerSubmitsCard(selectedCard);
      selectedCardId = null;
    }
  };

  const submitVote = async () => {
    if (!selectedVoteCardId) return;

    const selectedCard = $cardsForVoting.get(selectedVoteCardId);
    if (selectedCard) {
      gameActions.playerVotes(selectedCard);
      selectedVoteCardId = null;
    }
  };

  const leaveGame = async () => {
    gameActions.disconnect();
    goto("/");
  };

  const getVotingCards = () => {
    return $cardsForVoting.toArray() || [];
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

  const startNextRound = () => {
    gameActions.startNextRound();
  };

  // Derived values for the components
  let currentLeader = $derived(
    $gameState.roomState?.players.find(
      (p) => p.id === $gameState.roomState?.leaderId,
    ) || null,
  );
  let association = $derived($gameState.roomState?.currentDescription || "");
  let votingCards = $derived(getVotingCards());
  let playerHandCards = $derived($currentPlayerHand.toArray());
  let leaderCard = $derived(
    $gameState.roomState
      ? (() => {
          try {
            return $gameState.roomState.getSubmittedLeaderCard();
          } catch {
            return null;
          }
        })()
      : null,
  );
  let votedPairs = $derived($gameState.roomState?.votedPairs?.toArray() || []);
  let players = $derived($gameState.roomState?.players?.toArray() || []);
  let isGameFinished = $derived(
    $gameState.roomState?.isGameFinished() || false,
  );
  let winner = $derived($gameState.roomState?.getWinner() || null);
</script>

<svelte:head>
  <title>Narrari - Mystical Game Realm</title>
  <script
    src="https://cdn.jsdelivr.net/gh/thelevicole/stripe-gradient@main/dist/stripe-gradient.js"
  ></script>
</svelte:head>

<!-- Nickname Modal -->
<NicknameModal
  show={showNicknameModal}
  {nickname}
  onNicknameChange={handleNicknameChange}
  onSubmit={handleNicknameSubmit}
/>

<!-- Main Game Container -->
<div
  class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
>
  <!-- Header -->
  <header class="bg-white/5 backdrop-blur-sm border-b border-white/10">
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <PixelButton variant="danger" size="sm" onClick={leaveGame}>
            {#snippet children()}
              <Home size={20} />
              Leave Game
            {/snippet}
          </PixelButton>
          <div class="flex items-center gap-2 text-slate-300">
            <Sparkles size={20} class="text-purple-400" />
            <span class="text-sm">Room: {roomId}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          {#if $gameState.roomState?.stage === "joining"}
            <PixelButton variant="secondary" size="sm" onClick={toggleReady}>
              {#snippet children()}
                <Users size={16} />
                Toggle Ready
              {/snippet}
            </PixelButton>
          {/if}
          {#if $gameState.roomState?.stage === "joining" && $canStartGame && $allPlayersReady}
            <PixelButton variant="success" size="sm" onClick={startGame}>
              {#snippet children()}
                <Play size={16} />
                Start Game
              {/snippet}
            </PixelButton>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  {#if $gameState.roomState}
    <div class="relative z-10 mx-auto max-w-7xl p-6">
      <!-- Status Bar -->
      <div class="mb-8">
        <StatusBar
          session={$gameState.roomState}
          currentPlayer={$gameState.currentPlayer}
          isLeader={$isCurrentPlayerLeader}
        />
      </div>

      <!-- Game Content Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Players List -->
        <div class="lg:col-span-1">
          <PlayersList players={$gameState.roomState.players.toArray()} />
        </div>

        <!-- Game Phases -->
        <div class="space-y-8 lg:col-span-3">
          <GamePhases
            gamePhase={$gamePhase}
            allPlayersReady={$allPlayersReady}
            canStartGame={$canStartGame}
            isCurrentPlayerLeader={$isCurrentPlayerLeader}
            {currentLeader}
            {association}
            {selectedCardId}
            {selectedVoteCardId}
            {enlargedCardId}
            {associationInput}
            onAssociationChange={handleAssociationChange}
            onSubmitLeaderChoice={submitLeaderChoice}
            onSubmitPlayerCard={submitPlayerCard}
            onSubmitVote={submitVote}
            onStartNextRound={startNextRound}
            onCardSelect={handleCardSelect}
            onCardEnlarge={handleCardEnlarge}
            onVoteCardSelect={handleVoteCardSelect}
            {votingCards}
            currentPlayerHand={playerHandCards}
            {leaderCard}
            {votedPairs}
            {players}
            {isGameFinished}
            {winner}
          />

          <!-- Score Table -->
          {#if $gameState.roomState && $gameState.roomState.players && $gameState.roomState.players.size > 0}
            <ScoreTable players={$gameState.roomState.players.toArray()} />
          {/if}
        </div>
      </div>
    </div>
  {:else if $gameState.error}
    <!-- Error State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6">
      <div
        class="bg-red-500/10 backdrop-blur-sm rounded-xl p-8 border border-red-500/20"
      >
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-4">
            <AlertCircle size={32} class="text-red-400" />
            <h2 class="text-2xl font-bold text-white">Connection Error</h2>
          </div>
          <p class="text-red-200 mb-6 text-lg">{$gameState.error}</p>
          <div class="flex gap-4 justify-center">
            <PixelButton variant="danger" size="md" onClick={connectToGame}>
              {#snippet children()}
                Try Again
              {/snippet}
            </PixelButton>
            <PixelButton variant="secondary" size="md" onClick={leaveGame}>
              {#snippet children()}
                Leave Game
              {/snippet}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  {:else if !$gameState.isConnected}
    <!-- Connecting State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div
        class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
      >
        <div class="flex items-center justify-center gap-3 mb-4">
          <Clock size={32} class="text-purple-400" />
          <h2 class="text-2xl font-bold text-white">Connecting...</h2>
        </div>
        <p class="text-slate-300 mb-6">Joining the mystical realm...</p>
        <button
          onclick={connectToGame}
          class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <Wand2 size={20} />
          Reconnect
        </button>
      </div>
    </div>
  {:else}
    <!-- Loading State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div
        class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
      >
        <div class="flex items-center justify-center gap-3 mb-4">
          <Sparkles size={32} class="text-blue-400" />
          <h2 class="text-2xl font-bold text-white">Loading Game...</h2>
        </div>
        <p class="text-slate-300 mb-6">Preparing your magical experience...</p>
        <div class="p-6 bg-white/5 rounded-lg border border-white/10">
          <h4 class="font-semibold mb-3 text-purple-200">Game State:</h4>
          <pre class="text-sm text-gray-300 text-left overflow-auto">
            {JSON.stringify($gameState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  {/if}
</div>
