<script lang="ts">
  import { BookOpen, Sparkles, Plus } from "lucide-svelte";

  interface CreateDeckModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (topic: string) => void;
    isLoading?: boolean;
    error?: string | null;
  }

  let {
    show,
    onClose,
    onSubmit,
    isLoading = false,
    error = null,
  }: CreateDeckModalProps = $props();

  let topic = $state("");

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && topic.trim() && !isLoading) {
      handleSubmit();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  }

  function handleSubmit() {
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  }

  function handleClose() {
    if (!isLoading) {
      topic = "";
      onClose();
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    topic = target.value;
  }

  // Handle backdrop click
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="bg-background rounded-xl p-8 max-w-md w-full mx-4 border border-border shadow-lg"
    >
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-2 mb-4">
          <BookOpen size={24} class="text-primary" />
          <Sparkles size={20} class="text-primary/70" />
        </div>
        <h2 id="modal-title" class="text-2xl font-bold text-foreground mb-2">
          Create New Deck
        </h2>
        <p class="text-muted-foreground">Enter a topic to generate your deck</p>
      </div>

      <div class="space-y-4">
        <div>
          <input
            bind:value={topic}
            oninput={handleInput}
            onkeydown={handleKeydown}
            placeholder="Enter deck topic..."
            disabled={isLoading}
            class="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            autofocus
          />
          {#if error}
            <p class="text-destructive text-sm mt-2">{error}</p>
          {/if}
        </div>

        <div class="flex gap-3">
          <button
            onclick={handleClose}
            disabled={isLoading}
            class="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onclick={handleSubmit}
            disabled={!topic.trim() || isLoading}
            class="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {#if isLoading}
              <div
                class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
              ></div>
              Creating...
            {:else}
              <Plus size={20} />
              Create Deck
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
