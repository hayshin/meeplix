<script lang="ts">
  import type { Player } from "$shared/models/player";
  import type { GameState } from "$lib/stores/game/types";
  import { Clock, Info, AlertCircle } from "lucide-svelte";

  interface Props {
    session: GameState;
    currentPlayer: Player | null;
    isLeader: boolean;
  }

  let { session, currentPlayer, isLeader }: Props = $props();

  const getStatusMessage = () => {
    const leader = session.players.find((p) => p.id === session.leaderId);
    const leaderName = leader?.username || "Unknown";

    switch (session.phase) {
      case "joining":
        return {
          message: `Waiting for players... (${session.players.length}/8)`,
          type: "info" as const,
          icon: Info,
        };

      case "leader_submitting":
        if (isLeader) {
          return {
            message: "Choose a card and create an association for it.",
            type: "action" as const,
            icon: AlertCircle,
          };
        } else {
          return {
            message: `${leaderName} is the current storyteller. Please wait...`,
            type: "waiting" as const,
            icon: Clock,
          };
        }

      case "players_submitting":
        if (isLeader) {
          return {
            message: `Association: "${session.currentDescription}". Waiting for other players to choose cards...`,
            type: "waiting" as const,
            icon: Clock,
          };
        } else {
          return {
            message: `Association: "${session.currentDescription}". Choose a card that matches this association...`,
            type: "action" as const,
            icon: AlertCircle,
          };
        }

      case "voting":
        if (isLeader) {
          return {
            message: "Waiting for other players to vote...",
            type: "waiting" as const,
            icon: Clock,
          };
        } else {
          return {
            message: "Choose the card you think belongs to the storyteller.",
            type: "action" as const,
            icon: AlertCircle,
          };
        }

      case "results":
        return {
          message: "Round results. Preparing for the next round...",
          type: "info" as const,
          icon: Info,
        };

      case "game_finished":
        const winner = session.players.reduce(
          (prev, current) => (prev.score > current.score ? prev : current),
          session.players[0]!,
        );
        return {
          message: `Game finished! Winner: ${winner.username} with ${winner.score} points!`,
          type: "success" as const,
          icon: Info,
        };

      default:
        return {
          message: "Unknown game state",
          type: "error" as const,
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = $derived(getStatusMessage());

  const getStatusColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-500/20 border-blue-400/30 text-blue-200";
      case "action":
        return "bg-orange-500/20 border-orange-400/30 text-orange-200";
      case "waiting":
        return "bg-slate-500/20 border-slate-400/30 text-slate-200";
      case "success":
        return "bg-green-500/20 border-green-400/30 text-green-200";
      case "error":
        return "bg-red-500/20 border-red-400/30 text-red-200";
      default:
        return "bg-slate-500/20 border-slate-400/30 text-slate-200";
    }
  };
</script>

<div class="w-full">
  <div
    class="flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm transition-colors duration-200 {getStatusColor(
      statusInfo.type,
    )}"
  >
    {#if statusInfo.icon}
      <statusInfo.icon size={20} />
    {/if}

    <div class="flex-1">
      <p class="font-medium">{statusInfo.message}</p>

      {#if session.phase !== "joining"}
        <div class="flex items-center gap-4 mt-2 text-sm opacity-75">
          <span>Round {session.roundNumber}</span>
          {#if session.currentDescription}
            <span>Association: "{session.currentDescription}"</span>
          {/if}
        </div>
      {/if}
    </div>

    {#if statusInfo.type === "waiting" || statusInfo.type === "action"}
      <div class="animate-pulse">
        <div class="w-2 h-2 bg-current rounded-full opacity-60"></div>
      </div>
    {/if}
  </div>
</div>
