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
  import {
    GradientBackground,
    MagicalCursor,
    StarryOverlage,
  } from "$lib/components/home";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";

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
  <meta
    name="description"
    content="Embark on a magical journey where imagination meets artificial intelligence"
  />
</svelte:head>

<GradientBackground />
<MagicalCursor />
<StarryOverlage />

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <LanguageSelector />
</div>

<!-- Nickname Modal -->
<NicknameModal
  show={showNicknameModal}
  {nickname}
  onNicknameChange={handleNicknameChange}
  onSubmit={handleNicknameSubmit}
/>

<!-- Main Game Container -->
<div class="min-h-screen relative z-10 game-page">
  <!-- Magical floating header -->
  <header
    class="relative z-20 bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl magical-glow"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
    ></div>
    <div class="relative mx-auto max-w-7xl px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <PixelButton variant="danger" size="sm" onclick={leaveGame}>
            {#snippet children()}
              <Home size={20} />
              Leave Game
            {/snippet}
          </PixelButton>
          <div
            class="flex items-center gap-3 px-4 py-2 glass-card rounded-lg hover-lift"
          >
            <Sparkles size={20} class="text-purple-400 animate-pulse" />
            <span class="text-sm font-medium text-purple-200"
              >Realm: {roomId}</span
            >
          </div>
        </div>
        <div class="flex items-center gap-3">
          {#if $gameState.roomState?.stage === "joining"}
            <PixelButton variant="secondary" size="sm" onclick={toggleReady}>
              {#snippet children()}
                <Users size={16} />
                Toggle Ready
              {/snippet}
            </PixelButton>
          {/if}
          {#if $gameState.roomState?.stage === "joining" && $canStartGame && $allPlayersReady}
            <PixelButton variant="success" size="sm" onclick={startGame}>
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
      <!-- Magical Status Bar -->
      <div class="mb-8">
        <div
          class="glass-card rounded-xl p-6 shadow-2xl hover-lift pulse-glow float-animation"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent rounded-xl"
          ></div>
          <div class="relative">
            <StatusBar
              session={$gameState.roomState}
              currentPlayer={$gameState.currentPlayer}
              isLeader={$isCurrentPlayerLeader}
            />
          </div>
        </div>
      </div>

      <!-- Enhanced Game Content Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Players List with magical styling -->
        <div class="lg:col-span-1">
          <div
            class="glass-card rounded-xl p-6 shadow-xl hover-lift shimmer-effect"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent rounded-xl"
            ></div>
            <div class="relative">
              <PlayersList players={$gameState.roomState.players.toArray()} />
            </div>
          </div>
        </div>

        <!-- Game Phases with enhanced styling -->
        <div class="space-y-8 lg:col-span-3">
          <div
            class="glass-card rounded-xl p-6 shadow-2xl hover-lift magical-glow"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent rounded-xl"
            ></div>
            <div class="relative">
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
            </div>
          </div>

          <!-- Score Table -->
          <!-- {#if $gameState.roomState && $gameState.roomState.players && $gameState.roomState.players.size > 0}
            <ScoreTable players={$gameState.roomState.players.toArray()} />
          {/if} -->
        </div>
      </div>
    </div>
  {:else if $gameState.error}
    <!-- Magical Error State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6">
      <div
        class="glass-card rounded-xl p-8 shadow-2xl hover-lift"
        style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-transparent via-red-500/10 to-transparent rounded-xl"
        ></div>
        <div class="relative text-center">
          <div class="flex items-center justify-center gap-4 mb-6">
            <AlertCircle size={40} class="text-red-400 animate-pulse" />
            <h2 class="text-3xl font-bold text-white text-gradient-primary">
              Connection Error
            </h2>
          </div>
          <p class="text-red-200 mb-8 text-lg leading-relaxed">
            {$gameState.error}
          </p>
          <div class="flex gap-4 justify-center">
            <PixelButton variant="danger" size="md" onclick={connectToGame}>
              {#snippet children()}
                <Wand2 size={20} />
                Try Again
              {/snippet}
            </PixelButton>
            <PixelButton variant="secondary" size="md" onclick={leaveGame}>
              {#snippet children()}
                <Home size={20} />
                Leave Game
              {/snippet}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  {:else if !$gameState.isConnected}
    <!-- Magical Connecting State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div class="glass-card rounded-xl p-8 shadow-2xl hover-lift pulse-glow">
        <div
          class="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent rounded-xl"
        ></div>
        <div class="relative">
          <div class="flex items-center justify-center gap-4 mb-6">
            <Clock size={40} class="text-purple-400 animate-spin" />
            <h2 class="text-3xl font-bold text-white text-gradient-primary">
              Connecting...
            </h2>
          </div>
          <p class="text-purple-200 mb-8 text-lg">
            Joining the mystical realm...
          </p>
          <div class="mb-6">
            <div class="flex justify-center space-x-2">
              {#each Array(3) as _, i}
                <div
                  class="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                  style="animation-delay: {i * 0.2}s"
                ></div>
              {/each}
            </div>
          </div>
          <PixelButton variant="primary" size="md" onclick={connectToGame}>
            {#snippet children()}
              <Wand2 size={20} />
              Reconnect
            {/snippet}
          </PixelButton>
        </div>
      </div>
    </div>
  {:else}
    <!-- Magical Loading State -->
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div class="glass-card rounded-xl p-8 shadow-2xl hover-lift">
        <div
          class="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent rounded-xl"
        ></div>
        <div class="relative">
          <div class="flex items-center justify-center gap-4 mb-6">
            <Sparkles size={40} class="text-blue-400 animate-pulse" />
            <h2 class="text-3xl font-bold text-white text-gradient-secondary">
              Loading Game...
            </h2>
          </div>
          <p class="text-blue-200 mb-8 text-lg">
            Preparing your magical experience...
          </p>
          <div class="mb-6">
            <div class="flex justify-center space-x-2">
              {#each Array(5) as _, i}
                <div
                  class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style="animation-delay: {i * 0.1}s"
                ></div>
              {/each}
            </div>
          </div>
          <div class="p-6 glass-card rounded-lg custom-scrollbar">
            <h4 class="font-semibold mb-3 text-blue-200">Game State:</h4>
            <pre class="text-sm text-gray-300 text-left overflow-auto max-h-64">
              {JSON.stringify($gameState, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Global game page styles */
  :global(.game-page) {
    font-family: "Nunito", sans-serif;
  }

  /* Enhanced glassmorphism effects */
  :global(.glass-card) {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Magical glow effects */
  :global(.magical-glow) {
    position: relative;
    overflow: hidden;
  }

  :global(.magical-glow::before) {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent,
      rgba(138, 109, 255, 0.1),
      transparent,
      rgba(168, 85, 247, 0.1),
      transparent
    );
    animation: rotate 8s linear infinite;
  }

  :global(.magical-glow::after) {
    content: "";
    position: absolute;
    inset: 1px;
    background: inherit;
    border-radius: inherit;
    z-index: 1;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Floating animation for UI elements */
  :global(.float-animation) {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* Pulse animation for important elements */
  :global(.pulse-glow) {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(138, 109, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(138, 109, 255, 0.6);
    }
  }

  /* Shimmer effect for cards */
  :global(.shimmer-effect) {
    position: relative;
    overflow: hidden;
  }

  :global(.shimmer-effect::before) {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  /* Enhanced text gradients */
  :global(.text-gradient-primary) {
    background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.text-gradient-secondary) {
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Hover effects for interactive elements */
  :global(.hover-lift) {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  :global(.hover-lift:hover) {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  /* Custom scrollbar for better UI */
  :global(.custom-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: rgba(138, 109, 255, 0.3) transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
    background: rgba(138, 109, 255, 0.3);
    border-radius: 4px;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
    background: rgba(138, 109, 255, 0.5);
  }
</style>
