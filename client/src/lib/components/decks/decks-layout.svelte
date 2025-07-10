<script lang="ts">
  import { api } from "$lib/utils";
  import DeckCard from "./deck-card.svelte";
  import { LoaderIcon, PlusIcon } from "lucide-svelte";

  interface Deck {
    id: string;
    name: string;
    amount: number;
    description?: string | null | undefined;
    ai_model?: string | null;
    ai_provider?: string | null;
    createdAt: Date | null;
  }

  let decks = $state<Deck[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

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
    // Navigate to deck details or start game
    console.log("Deck clicked:", deck);
    // TODO: Implement navigation to deck details or game start
  };

  const handleCreateDeck = () => {
    // Navigate to deck creation
    console.log("Create deck clicked");
    // TODO: Implement navigation to deck creation
  };

  // Fetch decks on component mount
  $effect(() => {
    fetchDecks();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Decks</h1>
      <p class="text-muted-foreground">Choose a deck to start playing</p>
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
