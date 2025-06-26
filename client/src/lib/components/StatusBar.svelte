<script lang="ts">
  import type { GameSession, Player } from "$shared/types";
  import { Clock, Info, AlertCircle } from "lucide-svelte";

  interface Props {
    session: GameSession;
    currentPlayer: Player | null;
    isLeader: boolean;
  }

  let { session, currentPlayer, isLeader }: Props = $props();

  const getStatusMessage = () => {
    const leader = session.players.find((p) => p.id === session.leaderPlayerId);
    const leaderName = leader?.nickname || "Неизвестный";

    switch (session.status) {
      case "waiting":
        return {
          message: `Ожидание игроков... (${session.players.length}/8)`,
          type: "info" as const,
          icon: Info,
        };

      case "leader_turn":
        if (isLeader) {
          return {
            message:
              "Вам необходимо выбрать карту и ввести для неё ассоциацию/связь.",
            type: "action" as const,
            icon: AlertCircle,
          };
        } else {
          return {
            message: `Сейчас ${leaderName} ведущий. Пожалуйста, подождите...`,
            type: "waiting" as const,
            icon: Clock,
          };
        }

      case "player_selection":
        if (isLeader) {
          return {
            message: `Ассоциация: "${session.association}". Ожидание выбора карт от других игроков...`,
            type: "waiting" as const,
            icon: Clock,
          };
        } else {
          return {
            message: `Ассоциация: "${session.association}". Выберите карту, похожую на эту ассоциацию...`,
            type: "action" as const,
            icon: AlertCircle,
          };
        }

      case "voting":
        if (isLeader) {
          return {
            message: "Ожидание голосования других игроков...",
            type: "waiting" as const,
            icon: Clock,
          };
        } else {
          return {
            message:
              "Выберите карту, по которой вы предполагаете, что это карта ведущего.",
            type: "action" as const,
            icon: AlertCircle,
          };
        }

      case "results":
        return {
          message: "Результаты раунда. Подготовка к следующему раунду...",
          type: "info" as const,
          icon: Info,
        };

      case "finished":
        const winner = session.players.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );
        return {
          message: `Игра окончена! Победитель: ${winner.nickname} с ${winner.score} очками!`,
          type: "success" as const,
          icon: Info,
        };

      default:
        return {
          message: "Неизвестное состояние игры",
          type: "error" as const,
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = $derived(getStatusMessage());

  const getStatusColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "action":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "waiting":
        return "bg-gray-50 border-gray-200 text-gray-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };
</script>

<div class="w-full">
  <div
    class="flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 {getStatusColor(
      statusInfo.type
    )}"
  >
    <svelte:component this={statusInfo.icon} size={20} />

    <div class="flex-1">
      <p class="font-medium">{statusInfo.message}</p>

      {#if session.status !== "waiting"}
        <div class="flex items-center gap-4 mt-2 text-sm opacity-75">
          <span>Раунд {session.currentRound}</span>
          {#if session.association}
            <span>Ассоциация: "{session.association}"</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Индикатор прогресса для некоторых состояний -->
    {#if statusInfo.type === "waiting" || statusInfo.type === "action"}
      <div class="animate-pulse">
        <div class="w-2 h-2 bg-current rounded-full opacity-60"></div>
      </div>
    {/if}
  </div>
</div>
