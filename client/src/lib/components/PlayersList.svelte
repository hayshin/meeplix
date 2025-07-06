<script lang="ts">
  import type { Player } from "$shared/models/player";
  import { ui } from "$lib/utils";
  import { Crown, Users } from "lucide-svelte";

  interface Props {
    players: Player[];
    leaderId?: string;
    currentPlayerId?: string;
  }

  let { players, leaderId, currentPlayerId }: Props = $props();

  // Sort players by join time
  const sortedPlayers = $derived(
    players.sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    ),
  );

  // Helper to check if player is connected (online status)
  const isPlayerConnected = (player: Player) => player.status === "online";
</script>

<div
  class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-4"
>
  <div class="flex items-center gap-2 mb-4">
    <Users size={20} class="text-purple-400" />
    <h3 class="font-semibold text-white">Players ({players.length})</h3>
  </div>

  <div class="space-y-2">
    {#each sortedPlayers as player (player.id)}
      <div
        class="flex items-center gap-3 p-3 rounded-lg transition-colors"
        class:bg-white={player.id === currentPlayerId}
        class:border={player.id === currentPlayerId}
        class:border-purple-400={player.id === currentPlayerId}
      >
        <!-- Player Avatar -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold relative {ui.getPlayerColor(
            player.id,
          )}"
        >
          {ui.getInitials(player.nickname)}

          <!-- Crown for leader -->
          {#if player.id === leaderId}
            <div class="absolute -top-1 -right-1">
              <Crown size={14} class="text-yellow-400 fill-yellow-400" />
            </div>
          {/if}

          <!-- Connection indicator -->
          <div
            class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            class:bg-green-500={isPlayerConnected(player)}
            class:bg-red-500={!isPlayerConnected(player)}
          ></div>
        </div>

        <!-- Player Information -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <span class="font-medium text-white truncate">
              {player.nickname}
            </span>
            {#if player.id === currentPlayerId}
              <span class="text-xs text-blue-400 font-medium">(You)</span>
            {/if}
            {#if player.id === leaderId}
              <span class="text-xs text-yellow-400 font-medium">(Leader)</span>
            {/if}
          </div>
          <div class="text-xs text-slate-300">
            Score: {player.score}
          </div>
        </div>

        <!-- Connection Status -->
        <div class="text-xs">
          {#if isPlayerConnected(player)}
            <span class="text-green-400">●</span>
          {:else}
            <span class="text-red-400">●</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if players.length === 0}
    <div class="text-center text-slate-400 py-4">
      <Users size={24} class="mx-auto mb-2 text-slate-500" />
      <p class="text-sm">No players</p>
    </div>
  {/if}
</div>
