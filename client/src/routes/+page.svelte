<script lang="ts">
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import { useGameStore } from "$lib/stores/game";
  import * as m from "$lib/paraglide/messages.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import {
    GradientBackground,
    PageHeader,
    MainGameCard,
    MagicalCursor,
  } from "$lib/components/home";

  // Use the game store
  const gameStore = useGameStore();
  const { gameState, actions } = gameStore;

  // Local component state
  let nickname = $state("");
  let topic = $state("");
  let isLoading = $state(false);
  let clientError = $state("");

  // Load saved nickname on component initialization
  const savedNickname = storage.getNickname();
  if (savedNickname) {
    nickname = savedNickname;
  }

  // Derived values from store
  const roomState = $derived($gameState);
  const roomId = $derived(roomState.roomId);
  const currentPlayer = $derived(roomState.currentPlayer);
  const error = $derived(roomState.error);

  // Effect to handle navigation after room creation (kept for direct join functionality)
  $effect(() => {
    console.log("Navigation effect triggered:", {
      roomId,
      currentPlayer,
      isLoading,
    });

    if (roomId && currentPlayer && isLoading) {
      // Room was created successfully, navigate to game
      console.log("Navigating to game:", roomId);
      storage.saveLastGameId(roomId);
      goto(`/game/${roomId}`);
      isLoading = false;
    }
  });

  // Effect to handle errors
  $effect(() => {
    console.log("Error effect triggered:", {
      error,
      isLoading,
    });

    if (error && isLoading) {
      // Error occurred during room creation
      clientError = error;
      isLoading = false;
      actions.clearError();
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

    try {
      // Save nickname
      storage.saveNickname(nickname.trim());

      // Navigate to decks page with nickname and topic as URL parameters
      const searchParams = new URLSearchParams({
        nickname: nickname.trim(),
        ...(topic.trim() && { topic: topic.trim() }),
      });

      goto(`/decks?${searchParams.toString()}`);
    } catch (error) {
      console.error("Error navigating to decks:", error);
      clientError = "Failed to navigate to deck selection. Please try again.";
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
        actions.clearError();

        // Use WebSocket-based room joining
        actions.joinRoom(gameId.trim(), nickname.trim());

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
  <title>Meeplix - AI-Enhanced Storytelling Adventure</title>
  <meta
    name="description"
    content="Embark on a magical journey where imagination meets artificial intelligence"
  />
</svelte:head>

<GradientBackground />
<MagicalCursor />

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <!-- <LanguageSelector /> -->
</div>

<div class="min-h-screen relative z-10">
  <!-- Main content -->
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <PageHeader />

      <MainGameCard
        bind:nickname
        bind:topic
        {clientError}
        {isLoading}
        onNicknameChange={(value) => (nickname = value)}
        onTopicChange={(value) => (topic = value)}
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
