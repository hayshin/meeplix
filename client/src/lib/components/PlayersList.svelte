<script lang="ts">
  import type { Player } from "$shared/types";
  import { ui } from "$lib/utils";
  import { Crown, Users } from "lucide-svelte";

  interface Props {
    players: Player[];
    leaderId?: string;
    currentPlayerId?: string;
  }

  let { players, leaderId, currentPlayerId }: Props = $props();

  // Сортируем игроков по времени присоединения
  const sortedPlayers = $derived(
    players.sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    )
  );
</script>

<div class="bg-white rounded-lg shadow-md p-4">
  <div class="flex items-center gap-2 mb-4">
    <Users size={20} class="text-gray-600" />
    <h3 class="font-semibold text-gray-800">Игроки ({players.length})</h3>
  </div>

  <div class="space-y-2">
    {#each sortedPlayers as player (player.id)}
      <div
        class="flex items-center gap-3 p-2 rounded-lg transition-colors"
        class:bg-blue-50={player.id === currentPlayerId}
        class:border={player.id === currentPlayerId}
        class:border-blue-200={player.id === currentPlayerId}
      >
        <!-- Аватар игрока -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold relative {ui.getPlayerColor(
            player.id
          )}"
        >
          {ui.getInitials(player.nickname)}

          <!-- Корона для ведущего -->
          {#if player.id === leaderId}
            <div class="absolute -top-1 -right-1">
              <Crown size={12} class="text-yellow-500 fill-yellow-500" />
            </div>
          {/if}

          <!-- Индикатор подключения -->
          <div
            class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            class:bg-green-500={player.isConnected}
            class:bg-red-500={!player.isConnected}
          ></div>
        </div>

        <!-- Информация об игроке -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <span class="font-medium text-gray-900 truncate">
              {player.nickname}
            </span>
            {#if player.id === currentPlayerId}
              <span class="text-xs text-blue-600 font-medium">(Вы)</span>
            {/if}
            {#if player.id === leaderId}
              <span class="text-xs text-yellow-600 font-medium">(Ведущий)</span>
            {/if}
          </div>
          <div class="text-xs text-gray-500">
            Очки: {player.score}
          </div>
        </div>

        <!-- Статус подключения -->
        <div class="text-xs">
          {#if player.isConnected}
            <span class="text-green-600">●</span>
          {:else}
            <span class="text-red-600">●</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if players.length === 0}
    <div class="text-center text-gray-500 py-4">
      <Users size={24} class="mx-auto mb-2 text-gray-400" />
      <p class="text-sm">Нет игроков</p>
    </div>
  {/if}
</div>
