<script lang="ts">
  import { api } from "$lib/utils";
  import DeckCard from "./deck-card.svelte";
  import CreateDeckModal from "./create-deck-modal.svelte";
  import { LoaderIcon, PlusIcon, SparklesIcon } from "lucide-svelte";

  export interface Deck {
    id: string;
    name: string;
    amount: number;
    description?: string | null;
    ai_model?: string | null;
    ai_provider?: string | null;
    createdAt: Date | null;
  }

  interface DecksLayoutProps {
    onDeckSelect?: (deck: Deck) => void;
  }

  let { onDeckSelect }: DecksLayoutProps = $props();

  let decks = $state<Deck[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  // Modal state
  let showCreateModal = $state(false);
  let isCreating = $state(false);
  let createError = $state<string | null>(null);

  const fetchDecks = async () => {
    try {
      isLoading = true;
      error = null;

      const response = await api.decks.all.get();

      if (response.error) {
        throw new Error(response.error.value as string);
      }

      if (response.data) {
        decks = response.data;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to fetch decks";
      console.error("Error fetching decks:", err);
    } finally {
      isLoading = false;
    }
  };

  const handleDeckClick = (deck: Deck) => {
    if (onDeckSelect) {
      onDeckSelect(deck);
    } else {
      // Default behavior if no callback provided
      console.log("Deck clicked:", deck);
    }
  };

  const handleCreateDeck = () => {
    showCreateModal = true;
    createError = null;
  };

  const handleModalClose = () => {
    showCreateModal = false;
    createError = null;
  };

  const handleDeckCreate = async (topic: string) => {
    try {
      isCreating = true;
      createError = null;

      const response = await api.decks.post({ topic });

      if (response.error) {
        throw new Error(response.error.value as string);
      }

      if (response.data) {
        // Add the new deck to the list
        decks = [...decks, response.data];
        // Close the modal
        showCreateModal = false;
      }
    } catch (err) {
      createError =
        err instanceof Error ? err.message : "Failed to create deck";
      console.error("Error creating deck:", err);
    } finally {
      isCreating = false;
    }
  };

  // Fetch decks on component mount
  $effect(() => {
    fetchDecks();
  });
</script>

<div class="w-full">
  <!-- Header Section -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <SparklesIcon class="h-6 w-6 text-purple-400" />
        Choose Your Magical Deck
      </h2>
      <p class="text-white/70 text-lg">
        Select a deck to begin your legendary adventure
      </p>
    </div>
    <button
      onclick={handleCreateDeck}
      class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
    >
      <PlusIcon class="h-4 w-4" />
      Create New Deck
    </button>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex h-96 items-center justify-center">
      <div
        class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center"
      >
        <div class="flex items-center gap-3 justify-center">
          <LoaderIcon class="h-8 w-8 animate-spin text-purple-400" />
          <span class="text-white text-lg font-medium"
            >Summoning magical decks...</span
          >
        </div>
      </div>
    </div>

    <!-- Error State -->
  {:else if error}
    <div class="flex h-96 items-center justify-center">
      <div
        class="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-8 text-center max-w-md"
      >
        <p class="text-red-300 text-lg font-medium mb-4">⚠️ {error}</p>
        <button
          onclick={fetchDecks}
          class="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-all duration-200 shadow-lg hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
  {:else if decks.length === 0}
    <div class="flex h-96 items-center justify-center">
      <div
        class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center max-w-md"
      >
        <SparklesIcon class="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <p class="text-white text-xl font-medium mb-2">No Decks Found</p>
        <p class="text-white/70 mb-6">
          Create your first magical deck to begin your adventure
        </p>
        <button
          onclick={handleCreateDeck}
          class="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Create Your First Deck
        </button>
      </div>
    </div>

    <!-- Decks Grid -->
  {:else}
    <div
      class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
    >
      {#each decks as deck (deck.id)}
        <DeckCard
          name={deck.name}
          cardAmount={deck.amount}
          description={deck.description}
          id={deck.id}
          onClick={() => handleDeckClick(deck)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Create Deck Modal -->
<CreateDeckModal
  show={showCreateModal}
  onClose={handleModalClose}
  onSubmit={handleDeckCreate}
  isLoading={isCreating}
  error={createError}
/>
