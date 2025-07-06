<script lang="ts">
  import { Stars, AlertCircle, Sparkles, Wand2, Play } from "lucide-svelte";
  import GameCard from "$lib/components/game/game-card.svelte";
  import type { PublicCard } from "$shared/models/public_card";
  import type { Player } from "$shared/models/player";
  import type { Vote } from "$shared/models/vote";

  interface EndVotePhaseProps {
    leaderCard: PublicCard | null;
    association: string;
    votedPairs: Vote[];
    players: Player[];
    isGameFinished: boolean;
    winner: Player | null;
    isCurrentPlayerLeader: boolean;
    onStartNextRound: () => void;
  }

  let {
    leaderCard,
    association,
    votedPairs,
    players,
    isGameFinished,
    winner,
    isCurrentPlayerLeader,
    onStartNextRound,
  }: EndVotePhaseProps = $props();
</script>

<div class="space-y-6">
  <!-- Phase Header -->
  <div class="bg-white/5 rounded-xl p-6 border border-white/10">
    <div class="flex items-center gap-3 mb-6">
      <Stars size={24} class="text-yellow-400" />
      <h3 class="text-2xl font-bold text-white">Round Results</h3>
    </div>

    <!-- Leader Card and Association -->
    {#if leaderCard}
      <div class="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <Wand2 size={20} class="text-purple-400" />
          <h4 class="text-xl font-bold text-white">Leader's Choice</h4>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex-shrink-0">
            <GameCard card={leaderCard} isClickable={false} />
          </div>
          <div class="flex-1">
            <p class="text-slate-300 text-lg italic mb-3">
              "{association}"
            </p>
            <p class="text-purple-300 text-base">
              This was the leader's chosen card and association.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Voting Results -->
    {#if votedPairs.length > 0}
      <div class="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
        <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={20} class="text-green-400" />
          Voting Results
        </h4>
        <div class="space-y-3">
          {#each votedPairs as vote}
            {@const voter = players.find((p) => p.id === vote.playerId)}
            {#if voter}
              <div
                class="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <span class="text-blue-300 font-medium">
                    {voter.nickname}
                  </span>
                  <span class="text-slate-400">voted for card:</span>
                  <span class="text-green-300 font-medium">
                    {vote.card.name}
                  </span>
                </div>
                <div class="text-sm text-slate-400">Vote cast</div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- Current Scores -->
    <div class="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
      <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles size={20} class="text-yellow-400" />
        Current Scores
      </h4>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        {#each players as player}
          <div class="bg-white/5 rounded-lg p-4 text-center">
            <div class="text-white font-medium">
              {player.nickname}
            </div>
            <div class="text-2xl font-bold text-yellow-400">
              {player.score}
            </div>
            <div class="text-sm text-slate-400">points</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Game End or Next Round -->
    <div class="text-center">
      {#if isGameFinished}
        <div
          class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-8 border border-yellow-500/30 mb-6"
        >
          <div class="flex items-center justify-center gap-3 mb-4">
            <Stars size={32} class="text-yellow-400" />
            <h3 class="text-3xl font-bold text-white">Game Over!</h3>
            <Stars size={32} class="text-yellow-400" />
          </div>
          {#if winner}
            <p class="text-xl text-yellow-300 mb-4">
              🎉 Congratulations,
              <span class="font-bold">{winner.nickname}</span>!
            </p>
          {/if}
          <p class="text-slate-300">Thanks for playing! The game has ended.</p>
        </div>
      {:else if isCurrentPlayerLeader}
        <button
          onclick={onStartNextRound}
          class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
        >
          <Play size={20} />
          Start Next Round
        </button>
      {:else}
        <div class="bg-white/5 rounded-lg p-4">
          <p class="text-slate-300">
            Waiting for the leader to start the next round...
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
