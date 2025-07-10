<script lang="ts">
  import { BookOpen, Sparkles, Plus, X } from "lucide-svelte";

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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative"
    >
      <!-- Close button -->
      <button
        onclick={handleClose}
        disabled={isLoading}
        class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 disabled:opacity-50"
      >
        <X size={16} />
      </button>

      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-2 mb-4">
          <div
            class="p-3 rounded-full bg-purple-500/20 border border-purple-400/30"
          >
            <BookOpen size={24} class="text-purple-300" />
          </div>
          <Sparkles size={20} class="text-purple-400 animate-pulse" />
        </div>
        <h2 id="modal-title" class="text-2xl font-bold text-white mb-2">
          Create New Deck
        </h2>
        <p class="text-white/70">Enter a topic to generate your magical deck</p>
      </div>

      <!-- Form -->
      <div class="space-y-6">
        <div>
          <label class="block text-white/90 text-sm font-medium mb-2">
            Deck Topic
          </label>
          <input
            bind:value={topic}
            oninput={handleInput}
            onkeydown={handleKeydown}
            placeholder="e.g., Fantasy Adventures, Space Exploration, Mystery Stories..."
            disabled={isLoading}
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            autofocus
          />
          {#if error}
            <p class="text-red-300 text-sm mt-2 flex items-center gap-2">
              <span class="text-red-400">⚠️</span>
              {error}
            </p>
          {/if}
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3">
          <button
            onclick={handleClose}
            disabled={isLoading}
            class="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-lg font-medium hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onclick={handleSubmit}
            disabled={!topic.trim() || isLoading}
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-105"
          >
            {#if isLoading}
              <div
                class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              Creating magic...
            {:else}
              <Plus size={20} />
              Create Deck
            {/if}
          </button>
        </div>
      </div>

      <!-- Magical decoration -->
      <div class="absolute -top-2 -right-2 text-purple-400 animate-bounce">
        <Sparkles size={16} />
      </div>
      <div class="absolute -bottom-2 -left-2 text-pink-400 animate-pulse">
        <Sparkles size={12} />
      </div>
    </div>
  </div>
{/if}
