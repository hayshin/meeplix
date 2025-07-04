<script lang="ts">
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import { gameActions, gameState } from "$lib/stores/game";
  import * as m from "$lib/paraglide/messages.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import {
    GradientBackground,
    PageHeader,
    MainGameCard,
    MagicalCursor,
  } from "$lib/components/home";

  let nickname = $state("");
  let isLoading = $state(false);
  let clientError = $state("");

  // Load saved nickname on component initialization
  const savedNickname = storage.getNickname();
  if (savedNickname) {
    nickname = savedNickname;
  }

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

<GradientBackground />
<MagicalCursor />

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <LanguageSelector />
</div>

<div class="min-h-screen relative z-10">
  <!-- Main content -->
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <PageHeader />

      <MainGameCard
        bind:nickname
        {clientError}
        {isLoading}
        onNicknameChange={(value) => (nickname = value)}
        onCreateGame={createGame}
        onJoinGame={joinByGameId}
        onEnterPress={createGame}
      />
    </div>
  </div>
</div>

<style>
  :global(html, body) {
    overflow: hidden;
    height: 100vh;
  }
</style>
