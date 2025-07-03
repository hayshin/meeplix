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
  import GameCard from "$lib/components/GameCard.svelte";
  import ScoreTable from "$lib/components/ScoreTable.svelte";

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
</script>

<svelte:head>
  <title>Narrari - Mystical Game Realm</title>
  <script
    src="https://cdn.jsdelivr.net/gh/thelevicole/stripe-gradient@main/dist/stripe-gradient.js"
  ></script>
</svelte:head>

<!-- Magical background -->

<!-- Nickname Modal -->
{#if showNicknameModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div
      class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl max-w-md mx-4"
    >
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-2 mb-4">
          <Wand2 size={24} class="text-purple-400" />
          <Sparkles size={20} class="text-pink-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Enter the Realm</h2>
        <p class="text-slate-300">Choose your name</p>
      </div>

      <div class="space-y-4">
        <input
          type="text"
          bind:value={nickname}
          placeholder="Your name..."
          class="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg
                 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                 focus:bg-white/10 transition-all duration-200"
          maxlength="20"
          autocomplete="off"
        />

        <button
          onclick={handleNicknameSubmit}
          disabled={!nickname.trim()}
          class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                 px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                 flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Join Adventure
        </button>
      </div>
    </div>
  </div>
{/if}

<div
  class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
>
  <header class="bg-white/5 backdrop-blur-sm border-b border-white/10">
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            onclick={leaveGame}
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium
                   transition-colors duration-200 flex items-center gap-2"
          >
            <Home size={20} />
            Leave Realm
          </button>

          <div class="flex items-center gap-2 text-slate-300">
            <Sparkles size={20} class="text-purple-400" />
            <span class="text-sm">Realm ID: {roomId}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          {#if $gameState.roomState?.stage === "joining"}
            <button
              onclick={toggleReady}
              class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium
                     transition-colors duration-200 flex items-center gap-2"
            >
              <Users size={16} />
              Ready
            </button>
          {/if}

          {#if $gameState.roomState?.stage === "joining" && $canStartGame && $allPlayersReady}
            <button
              onclick={startGame}
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium
                     transition-colors duration-200 flex items-center gap-2"
            >
              <Play size={16} />
              Start Game
            </button>
          {/if}
        </div>
      </div>
    </div>
  </header>

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

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Players List -->
        <div class="lg:col-span-1">
          <PlayersList players={$gameState.roomState.players.toArray()} />
        </div>

        <!-- Main Game Area -->
        <div class="space-y-8 lg:col-span-3">
          <!-- Game Phase Instructions -->
          {#if $gamePhase === "joining"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-4">
                <Users size={24} class="text-blue-400" />
                <h3 class="text-2xl font-bold text-white">
                  Gathering Adventurers
                </h3>
              </div>
              <div class="space-y-3 text-slate-300">
                {#if !$allPlayersReady}
                  <p class="text-lg">Waiting for all players to ready up...</p>
                {:else if !$canStartGame}
                  <p class="text-lg">
                    Need at least 3 players to start the adventure
                  </p>
                {:else}
                  <p class="text-lg">
                    All adventurers are ready! Begin the magical journey!
                  </p>
                {/if}
              </div>
            </div>
          {:else if $gamePhase === "leader_choosing"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-4">
                <Wand2 size={24} class="text-yellow-400" />
                <h3 class="text-2xl font-bold text-white">
                  {#if $isCurrentPlayerLeader}
                    Your Turn to Lead
                  {:else}
                    Awaiting the Storyteller
                  {/if}
                </h3>
              </div>
              <div class="text-slate-300 text-lg">
                {#if $isCurrentPlayerLeader}
                  <p>
                    Choose a card from your hand and create a magical
                    association for it. Other players will try to match your
                    story!
                  </p>
                {:else}
                  <p>
                    The current storyteller is weaving their tale. Prepare your
                    cards...
                  </p>
                {/if}
              </div>
            </div>
          {:else if $gamePhase === "players_choosing"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-4">
                <Stars size={24} class="text-purple-400" />
                <h3 class="text-2xl font-bold text-white">
                  {#if !$isCurrentPlayerLeader}
                    Choose Your Card
                  {:else}
                    Waiting for Players
                  {/if}
                </h3>
              </div>
              <div class="text-slate-300 text-lg">
                <p>
                  Association: <strong class="text-purple-300">
                    "{$gameState.roomState.currentDescription}"
                  </strong>
                </p>
                {#if !$isCurrentPlayerLeader}
                  <p class="mt-2">
                    Select a card that matches this mystical association!
                  </p>
                {:else}
                  <p class="mt-2">
                    Other players are selecting their cards based on your
                    association.
                  </p>
                {/if}
              </div>
            </div>
          {:else if $gamePhase === "voting"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-4">
                <AlertCircle size={24} class="text-green-400" />
                <h3 class="text-2xl font-bold text-white">Voting Phase</h3>
              </div>
              <div class="text-slate-300 text-lg">
                {#if !$isCurrentPlayerLeader}
                  <p>
                    Which card do you think belongs to the storyteller? Choose
                    wisely!
                  </p>
                {:else}
                  <p>
                    Players are voting on which card they think is yours. The
                    suspense builds...
                  </p>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Leader Association Input -->
          {#if $isCurrentPlayerLeader && $gamePhase === "leader_choosing"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-6">
                <Wand2 size={24} class="text-purple-400" />
                <h3 class="text-xl font-bold text-white">
                  Craft Your Association
                </h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label
                    for="association"
                    class="block text-sm font-medium text-white mb-2"
                    >Association</label
                  >
                  <input
                    id="association"
                    type="text"
                    bind:value={associationInput}
                    placeholder="Describe your chosen card..."
                    class="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:bg-white/10 transition-all duration-200"
                  />
                </div>

                <button
                  onclick={submitLeaderChoice}
                  disabled={!selectedCardId || !associationInput.trim()}
                  class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                         px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                         flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Cast Your Spell
                </button>
              </div>
            </div>
          {/if}

          <!-- Player Card Selection -->
          {#if !$isCurrentPlayerLeader && $gamePhase === "players_choosing"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <Stars size={24} class="text-blue-400" />
                  <h3 class="text-xl font-bold text-white">Choose Your Card</h3>
                </div>
                <p class="text-slate-300">
                  Selected: {selectedCardId ? "✓" : "None"}
                </p>
              </div>

              <button
                onclick={submitPlayerCard}
                disabled={!selectedCardId}
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                       flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Submit Card
              </button>
            </div>
          {/if}

          <!-- Voting Cards -->
          {#if $gamePhase === "voting" && !$isCurrentPlayerLeader}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <AlertCircle size={24} class="text-green-400" />
                  <h3 class="text-xl font-bold text-white">Cast Your Vote</h3>
                </div>
                <button
                  onclick={submitVote}
                  disabled={!selectedVoteCardId}
                  class="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                         px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200
                         flex items-center gap-2"
                >
                  <Send size={16} />
                  Vote
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                {#each getVotingCards() as card (card.id)}
                  <GameCard
                    {card}
                    isSelected={selectedVoteCardId === card.id}
                    onclick={() => (selectedVoteCardId = card.id)}
                  />
                {/each}
              </div>
            </div>
          {:else if $gamePhase === "voting"}
            <div
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
            >
              <div class="flex items-center gap-3 mb-6">
                <Clock size={24} class="text-slate-400" />
                <h3 class="text-xl font-bold text-white">Voting in Progress</h3>
              </div>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                {#each getVotingCards() as card (card.id)}
                  <GameCard {card} isClickable={false} />
                {/each}
              </div>
            </div>
          {/if}

          <!-- Player Hand -->
          {#if $currentPlayerHand && $currentPlayerHand.size > 0}
            <div class="relative group">
              <div
                class="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-30"
              ></div>
              <div
                class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
              >
                <div class="flex items-center gap-3 mb-6">
                  <Sparkles size={24} class="text-indigo-300 animate-pulse" />
                  <h3 class="text-xl font-bold text-white">
                    Your Mystical Hand
                  </h3>
                </div>
                <div class="grid grid-cols-2 gap-4 md:grid-cols-6">
                  {#each $currentPlayerHand.toArray() as card (card.id)}
                    <GameCard
                      {card}
                      isSelected={selectedCardId === card.id}
                      isClickable={true}
                      onclick={() => {
                        selectedCardId = card.id;
                      }}
                    />
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Score Table -->
          {#if $gameState.roomState && $gameState.roomState.players && $gameState.roomState.players.size > 0}
            <ScoreTable players={$gameState.roomState.players.toArray()} />
          {/if}
        </div>
      </div>
    </div>
  {:else if $gameState.error}
    <div class="relative z-10 mx-auto max-w-2xl p-6">
      <div
        class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
      >
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-4">
            <AlertCircle size={32} class="text-red-400" />
            <h2 class="text-2xl font-bold text-white">Connection Lost</h2>
          </div>
          <p class="text-red-200 mb-6 text-lg">{$gameState.error}</p>
          <div class="flex gap-4 justify-center">
            <button
              onclick={connectToGame}
              class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold
                     transition-colors duration-200"
            >
              Reconnect
            </button>
            <button
              onclick={leaveGame}
              class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold
                     transition-colors duration-200"
            >
              Leave Game
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if !$gameState.isConnected}
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div
        class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
      >
        <div class="flex items-center justify-center gap-3 mb-4">
          <Clock size={32} class="text-purple-400" />
          <h2 class="text-2xl font-bold text-white">Connecting to the Realm</h2>
        </div>
        <p class="text-slate-300 mb-6">Establishing connection...</p>
        <button
          onclick={connectToGame}
          class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-semibold
                 transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          <Wand2 size={20} />
          Retry Connection
        </button>
      </div>
    </div>
  {:else}
    <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
      <div
        class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
      >
        <div class="flex items-center justify-center gap-3 mb-4">
          <Sparkles size={32} class="text-blue-400" />
          <h2 class="text-2xl font-bold text-white">Loading Game State</h2>
        </div>
        <p class="text-slate-300 mb-6">
          Gathering information from the realm...
        </p>
        <div class="p-6 bg-white/5 rounded-lg border border-white/10">
          <h4 class="font-semibold mb-3 text-purple-200">Debug Information:</h4>
          <pre class="text-sm text-gray-300 text-left overflow-auto">
            {JSON.stringify($gameState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  {/if}
</div>
