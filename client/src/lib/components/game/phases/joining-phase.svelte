<script lang="ts">
	import { Users } from 'lucide-svelte';

	interface JoiningPhaseProps {
		allPlayersReady: boolean;
		canStartGame: boolean;
	}

	let { allPlayersReady, canStartGame }: JoiningPhaseProps = $props();
</script>

<div class="bg-white/5 rounded-xl p-6 border border-white/10">
	<div class="flex items-center gap-3 mb-4">
		<Users size={24} class="text-blue-400" />
		<h3 class="text-2xl font-bold text-white">
			Waiting for Players
		</h3>
	</div>
	<div class="space-y-3 text-slate-300">
		{#if !allPlayersReady}
			<p class="text-lg">
				Waiting for all players to be ready...
			</p>
		{:else if !canStartGame}
			<p class="text-lg">
				Need at least 3 players to start the game.
			</p>
		{:else}
			<p class="text-lg">
				All players are ready! You can start the game.
			</p>
		{/if}
	</div>
</div>
