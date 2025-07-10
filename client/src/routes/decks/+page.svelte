<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { storage } from "$lib/utils";
  import { useGameStore } from "$lib/stores/game";
  import DecksLayout, {
    type Deck,
  } from "$lib/components/decks/decks-layout.svelte";
  import { ArrowLeftIcon } from "lucide-svelte";
  import { GradientBackground, MagicalCursor } from "$lib/components/home";

  // Use the game store
  const gameStore = useGameStore();
  const { gameState, actions } = gameStore;

  // Get URL parameters
  const searchParams = $derived($page.url.searchParams);
  const nickname = $derived(searchParams.get("nickname") || "");

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

  const handleDeckSelect = async (deck: Deck) => {
    console.log("Deck selected:", deck);

    isCreatingRoom = true;
    error = "";

    try {
      // Clear any previous errors
      actions.clearError();

      // Create room with selected deck
      // You might want to pass deck information to the room creation
      actions.createRoom(nickname, deck.id || `Playing with ${deck.name}`);

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

<GradientBackground />
<MagicalCursor />

<div class="min-h-screen relative z-10">
  <!-- Full height container with padding -->
  <div class="min-h-screen flex flex-col p-6">
    <!-- Header Section -->
    <div class="mb-8 flex items-center gap-4">
      <button
        onclick={handleGoBack}
        class="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 shadow-lg hover:scale-105"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Back
      </button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-white mb-2">
          Welcome, <span class="text-purple-300">{nickname}</span>!
        </h1>
        <p class="text-white/70 text-lg">
          Select a deck to begin your magical adventure
        </p>
      </div>
    </div>

    <!-- Error message -->
    {#if error}
      <div
        class="mb-6 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4"
      >
        <p class="text-red-300 text-sm font-medium">{error}</p>
      </div>
    {/if}

    <!-- Main Content Area - Full width container -->
    <div class="flex-1 max-w-none w-full">
      <div
        class="bg-black/40 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl h-full min-h-[calc(100vh-200px)]"
      >
        <!-- Decks layout takes full available space -->
        <DecksLayout onDeckSelect={handleDeckSelect} />
      </div>
    </div>
  </div>
</div>

<!-- Loading state overlay -->
{#if isCreatingRoom}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-black/40 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center shadow-2xl"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"
      ></div>
      <p class="text-white text-lg font-medium">
        Creating your magical realm...
      </p>
      <p class="text-white/70 text-sm mt-2">Preparing the adventure ahead</p>
    </div>
  </div>
{/if}
