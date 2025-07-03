<script lang="ts">
  import type { PlayerEntity } from "$types/player";
  import { ui } from "$lib/utils";
  import { Trophy, Medal, Award } from "lucide-svelte";

  interface Props {
    players: PlayerEntity[];
    roundScores?: { [playerId: string]: number };
    showRoundScores?: boolean;
  }

  let { players, roundScores = {}, showRoundScores = false }: Props = $props();

  // Сортируем игроков по очкам (по убыванию)
  const sortedPlayers = $derived(
    [...players].sort((a, b) => b.score - a.score),
  );

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return Trophy;
      case 2:
        return Medal;
      case 3:
        return Award;
      default:
        return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };
</script>

<div
  class="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-6 shadow-lg"
>
  <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
    <Trophy size={20} class="text-yellow-400" />
    Score Table
  </h3>

  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b-2 border-white/20">
          <th class="px-2 py-2 text-left text-slate-300">Rank</th>
          <th class="px-2 py-2 text-left text-slate-300">Player</th>
          <th class="px-2 py-2 text-center text-slate-300">Total Score</th>
          {#if showRoundScores}
            <th class="px-2 py-2 text-center text-slate-300">Round</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each sortedPlayers as player, index (player.id)}
          {@const position = index + 1}
          {@const Icon = getPositionIcon(position)}
          {@const roundScore = roundScores[player.id] || 0}
          <tr
            class="border-b border-white/10 transition-colors hover:bg-white/10"
            class:bg-yellow-500={position === 1}
            class:bg-gray-500={position === 2}
            class:bg-orange-500={position === 3}
          >
            <!-- Место -->
            <td class="px-2 py-3">
              <div class="flex items-center gap-2">
                {#if Icon}
                  <svelte:component
                    this={Icon}
                    size={16}
                    class={getPositionColor(position)}
                  />
                {:else}
                  <span class="font-medium text-slate-300">{position}</span>
                {/if}
              </div>
            </td>

            <!-- Игрок -->
            <td class="px-2 py-3">
              <div class="flex items-center gap-3">
                <!-- Аватар -->
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white {ui.getPlayerColor(
                    player.id,
                  )}"
                >
                  {ui.getInitials(player.nickname)}
                </div>

                <!-- Player Information -->
                <div>
                  <div class="font-medium text-white">
                    {player.nickname}
                  </div>
                  <div class="text-xs text-slate-400">
                    {player.isConnected ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </td>

            <!-- Total Score -->
            <td class="px-2 py-3 text-center">
              <span
                class="text-lg font-bold"
                class:text-yellow-400={position === 1}
                class:text-slate-300={position === 2}
                class:text-orange-400={position === 3}
                class:text-slate-200={position > 3}
              >
                {player.score}
              </span>
            </td>

            <!-- Round Score -->
            {#if showRoundScores}
              <td class="px-2 py-3 text-center">
                {#if roundScore > 0}
                  <span class="font-medium text-green-400">
                    +{roundScore}
                  </span>
                {:else}
                  <span class="text-slate-500"> 0 </span>
                {/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Progress to Victory -->
  <div class="mt-4 space-y-2">
    <div class="mb-2 text-sm text-slate-300">
      Progress to Victory (20 points):
    </div>
    {#each sortedPlayers.slice(0, 3) as player}
      <div class="flex items-center gap-3">
        <div class="w-20 truncate text-sm font-medium text-slate-200">
          {player.nickname}
        </div>
        <div class="h-2 flex-1 rounded-full bg-white/20">
          <div
            class="h-2 rounded-full bg-purple-500 transition-all duration-300"
            style="width: {Math.min((player.score / 20) * 100, 100)}%"
          ></div>
        </div>
        <div class="w-8 text-sm text-slate-300">
          {player.score}/20
        </div>
      </div>
    {/each}
  </div>
</div>
