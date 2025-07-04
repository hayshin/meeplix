<script lang="ts">
  import { Sparkles } from "lucide-svelte";

  import GameCard from "$lib/components/game/game-card.svelte";
  import type { CardEntity } from "$types/card";

  interface PlayerHandProps {
    cards: CardEntity[];
    selectedCardId: string | null;
    enlargedCardId: string | null;
    onCardSelect: (cardId: string) => void;
    onCardEnlarge: (cardId: string | null) => void;
  }

  let {
    cards,
    selectedCardId,
    enlargedCardId,
    onCardSelect,
    onCardEnlarge,
  }: PlayerHandProps = $props();
</script>

{#if cards.length > 0}
  <div class="relative group">
    <div
      class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"
    ></div>
    <div class="relative bg-slate-900 rounded-xl p-6 border border-white/10">
      <div class="flex items-center gap-3 mb-6">
        <Sparkles size={24} class="text-indigo-300 animate-pulse" />
        <h3 class="text-xl font-bold text-white">Your Hand</h3>
      </div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-6">
        {#each cards as card (card.id)}
          <GameCard
            {card}
            isClickable={true}
            isSelected={selectedCardId === card.id}
            isEnlarged={enlargedCardId === card.id}
            onclick={() => onCardSelect(card.id)}
            onEnlarge={() =>
              onCardEnlarge(enlargedCardId === card.id ? null : card.id)}
          />
        {/each}
      </div>
    </div>
  </div>
{/if}
