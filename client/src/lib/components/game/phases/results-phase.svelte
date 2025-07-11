<script lang="ts">
  import { Trophy, Users, ArrowRight, Crown } from "lucide-svelte";
  import type { Player } from "$shared/models/player";
  import type { Vote } from "$shared/models/vote";
  import type { PublicCard } from "$shared/models/public_card";
  import GameCard from "../game-card.svelte";

  interface ResultsPhaseProps {
    isCurrentPlayerLeader: boolean;
    isGameFinished: boolean;
    association: string;
    votedPairs: Vote[];
    players: Player[];
    leaderCardId: string;
    leaderId: string;
    votingCards: PublicCard[];
    onStartNextRound: () => void;
  }

  let {
    isCurrentPlayerLeader,
    isGameFinished,
    association,
    votedPairs,
    players,
    leaderCardId,
    leaderId,
    votingCards,
    onStartNextRound,
  }: ResultsPhaseProps = $props();

  // Sort players by score for display
  const sortedPlayers = $derived(
    [...players].sort((a, b) => b.score - a.score),
  );

  // Create card-to-player mapping from votes
  const cardPlayerMap = $derived(() => {
    const map = new Map<string, Player>();

    // Add leader card - find the leader by leaderId (not leaderCardId)
    const leader = players.find((p) => p.id === leaderId);
    if (leader) {
      map.set(leaderCardId, leader);
    }

    // Add other players' cards from votes
    votedPairs.forEach((vote) => {
      const player = players.find((p) => p.id === vote.playerId);
      if (player && vote.card.id !== leaderCardId) {
        map.set(vote.card.id, player);
      }
    });

    return map;
  });

  // Sort cards with leader card first
</script>

<div class="space-y-6">
  <!-- Phase Status -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-4">
      <Trophy size={24} class="text-yellow-400" />
      <h3 class="text-2xl font-bold text-white">Round Results</h3>
    </div>
    <div class="text-slate-300 text-lg">
      <p>
        Association: <strong class="text-yellow-300">{association}</strong>
      </p>
      <p class="mt-2">
        Total votes: <strong class="text-green-300">{votedPairs.length}</strong>
      </p>
    </div>
  </div>

  <!-- Cards and Their Players -->
  <div class="bg-white/5 rounded-xl p-3 sm:p-4 md:p-6 border border-white/10">
    <div class="flex items-center gap-2 mb-3 sm:mb-4">
      <Crown size={20} class="text-purple-400" />
      <h3 class="text-lg sm:text-xl font-bold text-white">Cards Revealed</h3>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
    >
      {#each votingCards as card}
        {@const cardPlayer = cardPlayerMap().get(card.id)}
        <div class="relative">
          <!-- Leader card gets special styling -->
          <div
            class="relative aspect-[3/4] {card.id === leaderCardId
              ? 'ring-1 sm:ring-2 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900 rounded-lg'
              : ''}"
          >
            <GameCard
              {card}
              isSelected={false}
              isClickable={false}
              isEnlarged={false}
            />

            <!-- Leader crown overlay -->
            {#if card.id === leaderCardId}
              <div
                class="absolute top-1 left-1 sm:top-2 sm:left-2 bg-yellow-400 rounded-full p-0.5 sm:p-1"
              >
                <Crown size={12} class="text-yellow-900 sm:w-4 sm:h-4" />
              </div>
            {/if}
          </div>

          <!-- Player name below card -->
          {#if cardPlayer}
            <div class="mt-1 text-center">
              <span
                class="text-white font-medium text-xs sm:text-sm {card.id ===
                leaderCardId
                  ? 'text-yellow-300'
                  : ''}"
              >
                {cardPlayer.username}
                {#if card.id === leaderCardId}
                  <span class="text-yellow-400 ml-1">👑</span>
                {/if}
              </span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Player Scores -->
  <div class="bg-white/5 rounded-xl p-3 sm:p-4 md:p-6 border border-white/10">
    <div class="flex items-center gap-2 mb-3 sm:mb-4">
      <Users size={20} class="text-blue-400" />
      <h3 class="text-lg sm:text-xl font-bold text-white">Player Scores</h3>
    </div>
    <div class="space-y-2 sm:space-y-3">
      {#each sortedPlayers as player, index}
        <div
          class="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-white/10 rounded-lg"
        >
          <div class="flex items-center gap-2 sm:gap-3">
            {#if index === 0}
              <Trophy size={16} class="text-yellow-400 sm:w-5 sm:h-5" />
            {:else}
              <div
                class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white"
              >
                {index + 1}
              </div>
            {/if}
            <span class="text-white font-medium text-sm sm:text-base"
              >{player.username}</span
            >
          </div>
          <div class="flex items-center gap-1 sm:gap-2">
            <span class="text-lg sm:text-xl md:text-2xl font-bold text-white"
              >{player.score}</span
            >
            <span class="text-slate-300 text-sm sm:text-base">points</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Next Round Button -->
  {#if isCurrentPlayerLeader && !isGameFinished}
    <div class="bg-white/5 rounded-xl p-3 sm:p-4 md:p-6 border border-white/10">
      <button
        onclick={onStartNextRound}
        class="w-full px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <ArrowRight size={16} class="sm:w-5 sm:h-5" />
        Start Next Round
      </button>
    </div>
  {/if}
</div>
