<script lang="ts">
  import { AlertCircle, Clock, Send } from "lucide-svelte";
  import GameCard from "$lib/components/game/game-card.svelte";
  import type { PublicCard } from "$shared/models/public_card";

  interface VotingPhaseProps {
    isCurrentPlayerLeader: boolean;
    votingCards: PublicCard[];
    selectedVoteCardId: string | null;
    onCardSelect: (cardId: string) => void;
    onSubmitVote: () => void;
    enlargedCardId: string | null;
    onCardEnlarge: (cardId: string | null) => void;
  }

  let {
    isCurrentPlayerLeader,
    votingCards,
    selectedVoteCardId,
    onCardSelect,
    onSubmitVote,
    enlargedCardId,
    onCardEnlarge,
  }: VotingPhaseProps = $props();
</script>

<div class="space-y-6">
  <!-- Phase Status -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-4">
      <AlertCircle size={24} class="text-green-400" />
      <h3 class="text-2xl font-bold text-white">Vote for the Best Card</h3>
    </div>
    <div class="text-slate-300 text-lg">
      {#if !isCurrentPlayerLeader}
        <p>
          Choose the card that best matches the association (excluding your own
          card).
        </p>
      {:else}
        <p>Waiting for players to vote...</p>
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
        <button
          onclick={onSubmitVote}
          disabled={!selectedVoteCardId}
          class="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send size={16} />
          Vote
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each votingCards as card (card.id)}
          <GameCard
            {card}
            isClickable={true}
            isSelected={selectedVoteCardId === card.id}
            isEnlarged={enlargedCardId === card.id}
            onclick={() => onCardSelect(card.id)}
            onEnlarge={() =>
              onCardEnlarge(enlargedCardId === card.id ? null : card.id)}
          />
        {/each}
      </div>
    </div>
  {:else}
    <!-- Leader Waiting View -->
    <div class="bg-white/5 rounded-xl p-6 border border-white/10">
      <div class="flex items-center gap-3 mb-6">
        <Clock size={24} class="text-slate-400" />
        <h3 class="text-xl font-bold text-white">Waiting for Votes</h3>
      </div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each votingCards as card (card.id)}
          <GameCard {card} isClickable={false} />
        {/each}
      </div>
    </div>
  {/if}
</div>
