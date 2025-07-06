<script lang="ts">
  import { Stars, Send } from "lucide-svelte";
  import type { Player } from "$shared/models/player";

  interface PlayersChoosingPhaseProps {
    isCurrentPlayerLeader: boolean;
    currentLeader: Player | null;
    association: string;
    selectedCardId: string | null;
    onSubmitPlayerCard: () => void;
  }

  let {
    isCurrentPlayerLeader,
    currentLeader,
    association,
    selectedCardId,
    onSubmitPlayerCard,
  }: PlayersChoosingPhaseProps = $props();
</script>

<div class="space-y-6">
  <!-- Phase Status -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-4">
      <Stars size={24} class="text-purple-400" />
      <h3 class="text-2xl font-bold text-white">
        {#if !isCurrentPlayerLeader}
          Choose Your Card
        {:else}
          Players are Choosing
        {/if}
      </h3>
    </div>
    <div class="text-slate-300 text-lg">
      <p>
        Association:
        <strong class="text-purple-300">
          {association}
        </strong>
      </p>
      {#if !isCurrentPlayerLeader}
        <p class="mt-2">
          Select a card from your hand that matches the association.
        </p>
      {:else}
        <p class="mt-2">Waiting for other players to choose their cards...</p>
      {/if}
    </div>
  </div>

  <!-- Player Card Submission -->
  {#if !isCurrentPlayerLeader}
    <div class="bg-white/5 rounded-xl p-6 border border-white/10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <Stars size={24} class="text-blue-400" />
          <h3 class="text-xl font-bold text-white">Submit Your Card</h3>
        </div>
        <p class="text-slate-300">
          Selected: {selectedCardId ? "✓" : "None"}
        </p>
      </div>
      <button
        onclick={onSubmitPlayerCard}
        disabled={!selectedCardId}
        class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        Submit Card
      </button>
    </div>
  {/if}
</div>
