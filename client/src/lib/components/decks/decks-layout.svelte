<script lang="ts">
  import { api } from "$lib/utils";
  import DeckCard from "./deck-card.svelte";
  import CreateDeckModal from "./create-deck-modal.svelte";
  import { LoaderIcon, PlusIcon } from "lucide-svelte";

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

<div class="mx-auto">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Choose Your Deck</h2>
      <p class="text-muted-foreground">Select a deck to start your adventure</p>
    </div>
    <button
      onclick={handleCreateDeck}
      class="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <PlusIcon class="h-4 w-4" />
      Create Deck
    </button>
  </div>

  {#if isLoading}
    <div class="flex h-64 items-center justify-center">
      <div class="flex items-center gap-2">
        <LoaderIcon class="h-6 w-6 animate-spin" />
        <span>Loading decks...</span>
      </div>
    </div>
  {:else if error}
    <div class="flex h-64 items-center justify-center">
      <div class="text-center">
        <p class="text-destructive">Error: {error}</p>
        <button
          onclick={fetchDecks}
          class="mt-4 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  {:else if decks.length === 0}
    <div class="flex h-64 items-center justify-center">
      <div class="text-center">
        <p class="text-muted-foreground">No decks found</p>
        <button
          onclick={handleCreateDeck}
          class="mt-4 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Create Your First Deck
        </button>
      </div>
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
