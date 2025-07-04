<script lang="ts">
  import { Play, Users } from "lucide-svelte";

  interface Props {
    nickname: string;
    isLoading: boolean;
    onCreateGame: () => void;
    onJoinGame: () => void;
  }

  let { nickname, isLoading, onCreateGame, onJoinGame }: Props = $props();
</script>

<!-- Action buttons -->
<div class="space-y-4 mb-8">
  <!-- Create game button -->
  <button
    onclick={onCreateGame}
    disabled={isLoading || !nickname.trim()}
    class="w-full bg-purple-600/90 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
           px-6 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200
           flex items-center justify-center gap-3 shadow-lg hover:shadow-xl
           border border-purple-400/20 backdrop-blur-sm text-shadow"
  >
    {#if isLoading}
      <div
        class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
      ></div>
      Creating game...
    {:else}
      <Play size={20} />
      Create New Realm
    {/if}
  </button>

  <!-- Join game button -->
  <button
    onclick={onJoinGame}
    disabled={isLoading || !nickname.trim()}
    class="w-full bg-blue-600/90 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
           px-6 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200
           flex items-center justify-center gap-3 shadow-lg hover:shadow-xl
           border border-blue-400/20 backdrop-blur-sm text-shadow"
  >
    <Users size={20} />
    Join Existing Realm
  </button>
</div>

<style>
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  }
</style>
