<script lang="ts">
  import { Trophy, LogOut, Sparkles } from "lucide-svelte";
  import type { Player } from "$shared/models/player";

  interface GameFinishedPhaseProps {
    winner: Player | null;
    players: Player[];
    onLeaveGame: () => void;
  }

  let {
    winner,
    players,
    onLeaveGame,
  }: GameFinishedPhaseProps = $props();

  // Sort players by score for final leaderboard
  const finalLeaderboard = $derived(
    [...players].sort((a, b) => b.score - a.score)
  );
</script>

<div class="space-y-6">
  <!-- Game Over Header -->
  <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-8 border border-purple-500/30 text-center">
    <div class="flex items-center justify-center gap-3 mb-4">
      <Sparkles size={32} class="text-purple-400" />
      <h2 class="text-4xl font-bold text-white">Game Over!</h2>
      <Sparkles size={32} class="text-purple-400" />
    </div>

    {#if winner}
      <div class="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg p-6 border border-yellow-500/30">
        <div class="flex items-center justify-center gap-3 mb-2">
          <Trophy size={28} class="text-yellow-400" />
          <h3 class="text-2xl font-bold text-yellow-300">Winner!</h3>
          <Trophy size={28} class="text-yellow-400" />
        </div>
        <p class="text-3xl font-bold text-white mb-2">{winner.username}</p>
        <p class="text-xl text-yellow-300">{winner.score} points</p>
      </div>
    {:else}
      <div class="bg-white/10 rounded-lg p-6">
        <p class="text-2xl text-white">It's a tie!</p>
      </div>
    {/if}
  </div>

  <!-- Final Leaderboard -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-6">
      <Trophy size={24} class="text-yellow-400" />
      <h3 class="text-2xl font-bold text-white">Final Leaderboard</h3>
    </div>
    <div class="space-y-3">
      {#each finalLeaderboard as player, index}
        <div class="flex items-center justify-between p-4 bg-white/10 rounded-lg {index === 0 ? 'ring-2 ring-yellow-400/50' : ''}">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full {index === 0 ? 'bg-yellow-400 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-400 text-black' : 'bg-slate-600 text-white'}">
              {#if index === 0}
                <Trophy size={16} />
              {:else}
                <span class="text-sm font-bold">{index + 1}</span>
              {/if}
            </div>
            <div>
              <p class="text-white font-medium text-lg">{player.username}</p>
              {#if index === 0}
                <p class="text-yellow-300 text-sm">Champion</p>
              {:else if index === 1}
                <p class="text-gray-300 text-sm">Runner-up</p>
              {:else if index === 2}
                <p class="text-orange-300 text-sm">Third place</p>
              {/if}
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-white">{player.score}</p>
            <p class="text-slate-300 text-sm">points</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Leave Game Button -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
    <button
      onclick={onLeaveGame}
      class="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
    >
      <LogOut size={20} />
      Leave Game
    </button>
    <p class="text-slate-400 text-sm mt-3">
      Thanks for playing! 🎉
    </p>
  </div>
</div>
