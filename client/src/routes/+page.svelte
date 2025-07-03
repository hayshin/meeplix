<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import { gameActions, gameState } from "$lib/stores/game";
  import { Play, Users, Sparkles, Stars, Wand2 } from "lucide-svelte";
  import * as m from "$lib/paraglide/messages.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";

  let nickname = $state("");
  let isLoading = $state(false);
  let clientError = $state("");
  let isFloating = $state(false);

  onMount(() => {
    // Load saved nickname
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
    }
  });

  // Effect to handle navigation after room creation
  $effect(() => {
    if ($gameState.roomId && $gameState.playerId && isLoading) {
      // Room was created successfully, navigate to game
      storage.saveLastGameId($gameState.roomId);
      goto(`/game/${$gameState.roomId}`);
      isLoading = false;
    }
  });

  // Effect to handle errors
  $effect(() => {
    if ($gameState.error && isLoading) {
      // Error occurred during room creation
      clientError = $gameState.error;
      isLoading = false;
      gameActions.clearError();
    }
  });

  const createGame = async () => {
    if (!nickname.trim()) {
      clientError = "Please enter your avatar name";
      return;
    }

    if (nickname.trim().length < 2) {
      clientError = "Avatar name must be at least 2 characters";
      return;
    }

    isLoading = true;
    clientError = "";

    try {
      storage.saveNickname(nickname.trim());

      // Clear any previous errors
      gameActions.clearError();

      // Use WebSocket-based room creation
      gameActions.createRoom(nickname.trim());

      // Navigation will be handled by the reactive statement
    } catch (error) {
      console.error("Error creating room:", error);
      clientError = "Failed to create room. Please try again.";
      isLoading = false;
    }
  };

  const joinByGameId = () => {
    if (!nickname.trim()) {
      clientError = "Please enter your avatar name";
      return;
    }

    if (nickname.trim().length < 2) {
      clientError = "Avatar name must be at least 2 characters";
      return;
    }

    const gameId = prompt("Enter the Realm ID:");
    if (gameId && gameId.trim()) {
      isLoading = true;
      clientError = "";

      try {
        storage.saveNickname(nickname.trim());

        // Clear any previous errors
        gameActions.clearError();

        // Use WebSocket-based room joining
        gameActions.joinRoom(gameId.trim(), nickname.trim());

        // Navigate to game page immediately
        storage.saveLastGameId(gameId.trim());
        goto(`/game/${gameId.trim()}`);

        // Reset loading state after navigation
        isLoading = false;
      } catch (error) {
        console.error("Error joining room:", error);
        clientError = "Failed to join room. Please try again.";
        isLoading = false;
      }
    }
  };
</script>

<svelte:head>
  <title>Narrari - AI-Enhanced Storytelling Adventure</title>
  <meta
    name="description"
    content="Embark on a magical journey where imagination meets artificial intelligence"
  />
</svelte:head>

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <LanguageSelector />
</div>

<div
  class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
>
  <!-- Main content -->
  <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 mb-6">
          <Sparkles size={32} class="text-purple-400" />
          <Wand2 size={28} class="text-pink-400" />
          <Stars size={30} class="text-blue-400" />
        </div>

        <h1 class="text-5xl font-bold mb-4 text-white">Narrari</h1>

        <p class="text-xl mb-3 text-slate-300 font-light">
          AI-Enhanced Storytelling Adventure
        </p>

        <p class="text-lg text-slate-400 italic">
          Embark on a magical journey where imagination meets artificial
          intelligence
        </p>
      </div>

      <!-- Main card -->
      <div
        class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl"
      >
        <!-- Nickname input section -->
        <div class="mb-8">
          <label
            for="nickname"
            class="flex text-lg font-medium text-white mb-3 items-center gap-2"
          >
            <Wand2 size={20} class="text-purple-400" />
            Your Avatar Name
          </label>

          <input
            id="nickname"
            type="text"
            bind:value={nickname}
            placeholder="Enter your name..."
            class="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg
                     text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                     focus:bg-white/10 transition-all duration-200
                     hover:border-white/50"
            class:border-red-400={clientError}
            class:ring-red-400={clientError}
            disabled={isLoading}
            onkeydown={(e) => {
              if (e.key === "Enter") {
                createGame();
              }
            }}
          />

          {#if clientError}
            <div
              class="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-lg"
            >
              <p class="text-red-200 text-sm">{clientError}</p>
            </div>
          {/if}
        </div>

        <!-- Action buttons -->
        <div class="space-y-4 mb-8">
          <!-- Create game button -->
          <button
            onclick={createGame}
            disabled={isLoading || !nickname.trim()}
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                     px-6 py-4 rounded-lg text-white font-semibold text-lg transition-colors duration-200
                     flex items-center justify-center gap-3"
          >
            {#if isLoading}
              <div
                class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              ></div>
              Creating game...
            {:else}
              <Play size={20} />
              Create New Realm
            {/if}
          </button>

          <!-- Join game button -->
          <button
            onclick={joinByGameId}
            disabled={isLoading || !nickname.trim()}
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     px-6 py-4 rounded-lg text-white font-semibold text-lg transition-colors duration-200
                     flex items-center justify-center gap-3"
          >
            <Users size={20} />
            Join Existing Realm
          </button>
        </div>

        <!-- How to play section -->
        <div class="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 class="font-bold text-white mb-4 text-xl flex items-center gap-2">
            <Wand2 size={20} class="text-purple-400" />
            How to Play:
          </h3>

          <ul class="space-y-3">
            <li class="text-slate-300 flex items-start gap-3">
              <span
                class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span>Minimum 3 storytellers to begin the adventure</span>
            </li>
            <li class="text-slate-300 flex items-start gap-3">
              <span
                class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span>The narrator chooses a card and weaves an association</span>
            </li>
            <li class="text-slate-300 flex items-start gap-3">
              <span
                class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span>Other players select cards that match the story</span>
            </li>
            <li class="text-slate-300 flex items-start gap-3">
              <span
                class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span>Everyone votes for the narrator's mysterious card</span>
            </li>
            <li class="text-slate-300 flex items-start gap-3">
              <span
                class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"
              ></span>
              <span>First to 20 points becomes the Master Storyteller!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
