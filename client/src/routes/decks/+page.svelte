<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { storage } from "$lib/utils";
  import { useGameStore } from "$lib/stores/game";
  import DecksLayout from "$lib/components/decks/decks-layout.svelte";
  import { ArrowLeftIcon } from "lucide-svelte";
  import { GradientBackground, MagicalCursor } from "$lib/components/home";

  // Use the game store
  const gameStore = useGameStore();
  const { gameState, actions } = gameStore;

  // Get URL parameters
  const searchParams = $derived($page.url.searchParams);
  const nickname = $derived(searchParams.get("nickname") || "");
  const topic = $derived(searchParams.get("topic") || "");

  // Redirect back to home if no nickname is provided
  $effect(() => {
    if (!nickname) {
      goto("/");
    }
  });

  // Local state
  let isCreatingRoom = $state(false);
  let error = $state("");

  // Listen for game state changes
  const roomState = $derived($gameState);
  const roomId = $derived(roomState.roomId);
  const currentPlayer = $derived(roomState.currentPlayer);
  const gameError = $derived(roomState.error);

  // Effect to handle navigation after room creation
  $effect(() => {
    if (roomId && currentPlayer && isCreatingRoom) {
      // Room was created successfully, navigate to game
      console.log("Navigating to game:", roomId);
      storage.saveLastGameId(roomId);
      goto(`/game/${roomId}`);
      isCreatingRoom = false;
    }
  });

  // Effect to handle errors
  $effect(() => {
    if (gameError && isCreatingRoom) {
      error = gameError;
      isCreatingRoom = false;
      actions.clearError();
    }
  });

  const handleDeckSelect = async (deck: any) => {
    console.log("Deck selected:", deck);

    isCreatingRoom = true;
    error = "";

    try {
      // Clear any previous errors
      actions.clearError();

      // Create room with selected deck
      // You might want to pass deck information to the room creation
      actions.createRoom(nickname, topic || `Playing with ${deck.name}`);

      // Navigation will be handled by the reactive effect
    } catch (err) {
      console.error("Error creating room:", err);
      error = "Failed to create room. Please try again.";
      isCreatingRoom = false;
    }
  };

  const handleGoBack = () => {
    goto("/");
  };
</script>

<svelte:head>
  <title>Select Deck - Meeplix</title>
  <meta name="description" content="Choose a deck to start your adventure" />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- <GradientBackground />
  <MagicalCursor /> -->
  <div class="container mx-auto px-4 py-8">
    <!-- Header with back button -->
    <div class="mb-8 flex items-center gap-4">
      <button
        onclick={handleGoBack}
        class="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Back
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold">Welcome, {nickname}!</h1>
        <p class="text-muted-foreground">
          Select a deck to begin your adventure
        </p>
      </div>
    </div>

    <!-- Error message -->
    {#if error}
      <div
        class="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4"
      >
        <p class="text-destructive text-sm font-medium">{error}</p>
      </div>
    {/if}

    <!-- Loading state -->
    {#if isCreatingRoom}
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-card rounded-lg p-6 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
          ></div>
          <p class="text-card-foreground">Creating your game...</p>
        </div>
      </div>
    {/if}

    <!-- Decks layout -->
    <DecksLayout onDeckSelect={handleDeckSelect} />
  </div>
</div>

<style>
  :global(html, body) {
    overflow: hidden;
    height: 100vh;
  }
</style>
