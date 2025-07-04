<script lang="ts">
  import StatusBar from "$lib/components/StatusBar.svelte";
  import type { GameState } from "$lib/stores/game";

  interface Props {
    gameState: GameState;
    isCurrentPlayerLeader: boolean;
  }

  let { gameState, isCurrentPlayerLeader }: Props = $props();
</script>

<!-- Magical Status Bar -->
<div class="mb-8">
  <div
    class="glass-card rounded-xl p-6 shadow-2xl hover-lift pulse-glow float-animation"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent rounded-xl"
    ></div>
    <div class="relative">
      <StatusBar
        session={gameState.roomState}
        currentPlayer={gameState.currentPlayer}
        isLeader={isCurrentPlayerLeader}
      />
    </div>
  </div>
</div>

<style>
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

  /* Pulse animation for important elements */
  :global(.pulse-glow) {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(138, 109, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(138, 109, 255, 0.6);
    }
  }

  /* Floating animation for UI elements */
  :global(.float-animation) {
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
