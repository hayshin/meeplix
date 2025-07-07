<script lang="ts">
  import { AlertCircle, Clock, Send } from "lucide-svelte";

  interface VotingPhaseProps {
    isCurrentPlayerLeader: boolean;
    association: string;
    selectedVoteCardId: string | null;
    onSubmitVote: () => void;
  }

  let {
    isCurrentPlayerLeader,
    association,
    selectedVoteCardId,
    onSubmitVote,
  }: VotingPhaseProps = $props();
</script>

<div class="space-y-6">
  <!-- Phase Status -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-4">
      <AlertCircle size={24} class="text-green-400" />
      <h3 class="text-2xl font-bold text-white">
        {#if !isCurrentPlayerLeader}
          Vote for the Leader's Card
        {:else}
          Voting in Progress
        {/if}
      </h3>
    </div>
    <div class="text-slate-300 text-lg">
      <p>
        Association: <strong class="text-green-300">{association}</strong>
      </p>
      {#if !isCurrentPlayerLeader}
        <p class="mt-2">Choose the card that best matches the association.</p>
      {:else}
        <p class="mt-2">Players are voting for your card...</p>
      {/if}
    </div>
  </div>

  <!-- Voting Interface for Non-Leaders -->
  {#if !isCurrentPlayerLeader}
    <div class="bg-white/5 rounded-xl p-6 border border-white/10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <AlertCircle size={24} class="text-green-400" />
          <h3 class="text-xl font-bold text-white">Cast Your Vote</h3>
        </div>
        <div class="text-slate-300">
          Selected: {selectedVoteCardId ? "✓" : "None"}
        </div>
      </div>
      <button
        onclick={onSubmitVote}
        disabled={!selectedVoteCardId}
        class="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Send size={20} />
        Submit Vote
      </button>
    </div>
  {:else}
    <!-- Leader Waiting View -->
    <div class="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
      <div class="flex items-center justify-center gap-3 mb-4">
        <Clock size={24} class="text-slate-400" />
        <h3 class="text-xl font-bold text-white">Waiting for Votes</h3>
      </div>
      <p class="text-slate-300">
        Players are deciding which card matches your association.
      </p>
    </div>
  {/if}
</div>
