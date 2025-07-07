<script lang="ts">
  import { Trophy, Users, ArrowRight } from "lucide-svelte";
  import type { Player } from "$shared/models/player";
  import type { Vote } from "$shared/models/vote";

  interface ResultsPhaseProps {
    isCurrentPlayerLeader: boolean;
    isGameFinished: boolean;
    association: string;
    votedPairs: Vote[];
    players: Player[];
    onStartNextRound: () => void;
  }

  let {
    isCurrentPlayerLeader,
    isGameFinished,
    association,
    votedPairs,
    players,
    onStartNextRound,
  }: ResultsPhaseProps = $props();

  // Sort players by score for display
  const sortedPlayers = $derived(
    [...players].sort((a, b) => b.score - a.score)
  );
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

  <!-- Player Scores -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-6">
      <Users size={24} class="text-blue-400" />
      <h3 class="text-xl font-bold text-white">Player Scores</h3>
    </div>
    <div class="space-y-3">
      {#each sortedPlayers as player, index}
        <div class="flex items-center justify-between p-4 bg-white/10 rounded-lg">
          <div class="flex items-center gap-3">
            {#if index === 0}
              <Trophy size={20} class="text-yellow-400" />
            {:else}
              <div class="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                {index + 1}
              </div>
            {/if}
            <span class="text-white font-medium">{player.username}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-white">{player.score}</span>
            <span class="text-slate-300">points</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Next Round Button -->
  {#if isCurrentPlayerLeader && !isGameFinished}
    <div class="bg-white/5 rounded-xl p-6 border border-white/10">
      <button
        onclick={onStartNextRound}
        class="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowRight size={20} />
        Start Next Round
      </button>
    </div>
  {/if}
</div>
