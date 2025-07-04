<script lang="ts">
  import { AlertCircle, Clock, Sparkles, Wand2, Home } from "lucide-svelte";
  import PixelButton from "$lib/components/ui/PixelButton.svelte";
  import type { GameState } from "$lib/stores/game";

  interface Props {
    gameState: GameState;
    isConnected: boolean;
    onConnectToGame: () => void;
    onLeaveGame: () => void;
  }

  let { gameState, isConnected, onConnectToGame, onLeaveGame }: Props = $props();
</script>

{#if gameState.error}
  <!-- Magical Error State -->
  <div class="relative z-10 mx-auto max-w-2xl p-6">
    <div
      class="glass-card rounded-xl p-8 shadow-2xl hover-lift"
      style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-transparent via-red-500/10 to-transparent rounded-xl"
      ></div>
      <div class="relative text-center">
        <div class="flex items-center justify-center gap-4 mb-6">
          <AlertCircle size={40} class="text-red-400 animate-pulse" />
          <h2 class="text-3xl font-bold text-white text-gradient-primary">
            Connection Error
          </h2>
        </div>
        <p class="text-red-200 mb-8 text-lg leading-relaxed">
          {gameState.error}
        </p>
        <div class="flex gap-4 justify-center">
          <PixelButton variant="danger" size="md" onclick={onConnectToGame}>
            {#snippet children()}
              <Wand2 size={20} />
              Try Again
            {/snippet}
          </PixelButton>
          <PixelButton variant="secondary" size="md" onclick={onLeaveGame}>
            {#snippet children()}
              <Home size={20} />
              Leave Game
            {/snippet}
          </PixelButton>
        </div>
      </div>
    </div>
  </div>
{:else if !isConnected}
  <!-- Magical Connecting State -->
  <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
    <div class="glass-card rounded-xl p-8 shadow-2xl hover-lift pulse-glow">
      <div
        class="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent rounded-xl"
      ></div>
      <div class="relative">
        <div class="flex items-center justify-center gap-4 mb-6">
          <Clock size={40} class="text-purple-400 animate-spin" />
          <h2 class="text-3xl font-bold text-white text-gradient-primary">
            Connecting...
          </h2>
        </div>
        <p class="text-purple-200 mb-8 text-lg">
          Joining the mystical realm...
        </p>
        <div class="mb-6">
          <div class="flex justify-center space-x-2">
            {#each Array(3) as _, i}
              <div
                class="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                style="animation-delay: {i * 0.2}s"
              ></div>
            {/each}
          </div>
        </div>
        <PixelButton variant="primary" size="md" onclick={onConnectToGame}>
          {#snippet children()}
            <Wand2 size={20} />
            Reconnect
          {/snippet}
        </PixelButton>
      </div>
    </div>
  </div>
{:else}
  <!-- Magical Loading State -->
  <div class="relative z-10 mx-auto max-w-2xl p-6 text-center">
    <div class="glass-card rounded-xl p-8 shadow-2xl hover-lift">
      <div
        class="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent rounded-xl"
      ></div>
      <div class="relative">
        <div class="flex items-center justify-center gap-4 mb-6">
          <Sparkles size={40} class="text-blue-400 animate-pulse" />
          <h2 class="text-3xl font-bold text-white text-gradient-secondary">
            Loading Game...
          </h2>
        </div>
        <p class="text-blue-200 mb-8 text-lg">
          Preparing your magical experience...
        </p>
        <div class="mb-6">
          <div class="flex justify-center space-x-2">
            {#each Array(5) as _, i}
              <div
                class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style="animation-delay: {i * 0.1}s"
              ></div>
            {/each}
          </div>
        </div>
        <div class="p-6 glass-card rounded-lg custom-scrollbar">
          <h4 class="font-semibold mb-3 text-blue-200">Game State:</h4>
          <pre class="text-sm text-gray-300 text-left overflow-auto max-h-64">
            {JSON.stringify(gameState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  </div>
{/if}

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

  /* Enhanced text gradients */
  :global(.text-gradient-primary) {
    background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.text-gradient-secondary) {
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Custom scrollbar for better UI */
  :global(.custom-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: rgba(138, 109, 255, 0.3) transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
    background: rgba(138, 109, 255, 0.3);
    border-radius: 4px;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
    background: rgba(138, 109, 255, 0.5);
  }
</style>
