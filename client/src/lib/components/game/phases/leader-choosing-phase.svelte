<script lang="ts">
  import { Wand2, Send } from "lucide-svelte";
  import type { Player } from "$shared/models/player";

  interface LeaderChoosingPhaseProps {
    isCurrentPlayerLeader: boolean;
    currentLeader: Player | null;
    associationInput: string;
    onAssociationChange: (value: string) => void;
    onSubmitLeaderChoice: () => void;
  }

  let {
    isCurrentPlayerLeader,
    currentLeader,
    associationInput,
    onAssociationChange,
    onSubmitLeaderChoice,
  }: LeaderChoosingPhaseProps = $props();
</script>

<div class="space-y-6">
  <!-- Phase Status -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-4">
      <Wand2 size={24} class="text-yellow-400" />
      <h3 class="text-2xl font-bold text-white">
        {#if isCurrentPlayerLeader}
          Choose Your Association
        {:else}
          Leader is Choosing
        {/if}
      </h3>
    </div>
    <div class="text-slate-300 text-lg">
      {#if isCurrentPlayerLeader}
        <p>Write an association for the card you selected.</p>
      {:else}
        <p>
          {currentLeader?.username} is choosing an association...
        </p>
      {/if}
    </div>
  </div>

  <!-- Leader Input Form -->
  {#if isCurrentPlayerLeader}
    <div class="bg-white/5 rounded-xl p-6 border border-white/10">
      <div class="flex items-center gap-3 mb-6">
        <Wand2 size={24} class="text-purple-400" />
        <h3 class="text-xl font-bold text-white">Choose Your Association</h3>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            Association Word/Phrase
          </label>
          <input
            bind:value={associationInput}
            oninput={(e) =>
              onAssociationChange((e?.target as HTMLInputElement).value)}
            placeholder="Enter your association..."
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onclick={onSubmitLeaderChoice}
          disabled={!associationInput.trim()}
          class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Send size={20} />
          Submit Choice
        </button>
      </div>
    </div>
  {/if}
</div>
