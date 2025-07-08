<script lang="ts">
  import { Wand2 } from "lucide-svelte";

  interface Props {
    topic: string;
    clientError: string;
    isLoading: boolean;
    onTopicChange: (value: string) => void;
    onEnterPress: () => void;
  }

  let {
    topic: topic = $bindable(),
    clientError,
    isLoading,
    onTopicChange,
    onEnterPress,
  }: Props = $props();
</script>

<!-- Nickname input section -->
<div class="mb-8">
  <label
    for="nickname"
    class="flex text-lg font-semibold text-white mb-3 items-center gap-2 text-shadow"
  >
    <Wand2 size={20} class="text-purple-300" />
    Your Room Topic
  </label>

  <input
    id="topic"
    type="text"
    bind:value={topic}
    placeholder="Enter your name..."
    class="w-full px-4 py-3 bg-black/30 border border-white/40 rounded-lg
           text-white placeholder-gray-300 focus:border-purple-300 focus:ring-2 focus:ring-purple-300/30
           focus:bg-black/40 transition-all duration-200
           hover:border-white/60 backdrop-blur-sm"
    class:border-red-300={clientError}
    class:ring-red-300={clientError}
    disabled={isLoading}
    onkeydown={(e) => {
      if (e.key === "Enter") {
        onEnterPress();
      }
    }}
    oninput={(e) => {
      onTopicChange((e.target as HTMLInputElement).value);
    }}
  />

  {#if clientError}
    <div
      class="mt-3 p-3 bg-red-500/30 border border-red-300/50 rounded-lg backdrop-blur-sm"
    >
      <p class="text-red-100 text-sm font-medium text-shadow">{clientError}</p>
    </div>
  {/if}
</div>

<style>
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  }
</style>
