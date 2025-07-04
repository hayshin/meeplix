<script lang="ts">
  import { Home, Users, Play, Sparkles } from "lucide-svelte";
  import PixelButton from "$lib/components/ui/PixelButton.svelte";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import type { GameState } from "$lib/stores/game";

  interface Props {
    roomId: string;
    gameState: GameState;
    canStartGame: boolean;
    allPlayersReady: boolean;
    onLeaveGame: () => void;
    onToggleReady: () => void;
    onStartGame: () => void;
  }

  let {
    roomId,
    gameState,
    canStartGame,
    allPlayersReady,
    onLeaveGame,
    onToggleReady,
    onStartGame,
  }: Props = $props();
</script>

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <LanguageSelector />
</div>

<!-- Magical floating header -->
<header
  class="relative z-20 bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl magical-glow"
>
  <div
    class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
  ></div>
  <div class="relative mx-auto max-w-7xl px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <PixelButton variant="danger" size="sm" onclick={onLeaveGame}>
          {#snippet children()}
            <Home size={20} />
            Leave Game
          {/snippet}
        </PixelButton>
        <div
          class="flex items-center gap-3 px-4 py-2 glass-card rounded-lg hover-lift"
        >
          <Sparkles size={20} class="text-purple-400 animate-pulse" />
          <span class="text-sm font-medium text-purple-200">
            Realm: {roomId}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        {#if gameState.roomState?.stage === "joining"}
          <PixelButton variant="secondary" size="sm" onclick={onToggleReady}>
            {#snippet children()}
              <Users size={16} />
              Toggle Ready
            {/snippet}
          </PixelButton>
        {/if}
        {#if gameState.roomState?.stage === "joining" && canStartGame && allPlayersReady}
          <PixelButton variant="success" size="sm" onclick={onStartGame}>
            {#snippet children()}
              <Play size={16} />
              Start Game
            {/snippet}
          </PixelButton>
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  /* Magical glow effects */
  :global(.magical-glow) {
    position: relative;
    overflow: hidden;
  }

  :global(.magical-glow::before) {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent,
      rgba(138, 109, 255, 0.1),
      transparent,
      rgba(168, 85, 247, 0.1),
      transparent
    );
    animation: rotate 8s linear infinite;
  }

  :global(.magical-glow::after) {
    content: "";
    position: absolute;
    inset: 1px;
    background: inherit;
    border-radius: inherit;
    z-index: 1;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Enhanced glassmorphism effects */
  :global(.glass-card) {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Hover effects for interactive elements */
  :global(.hover-lift) {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  :global(.hover-lift:hover) {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
</style>
