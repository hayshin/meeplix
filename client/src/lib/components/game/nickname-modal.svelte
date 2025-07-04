<script lang="ts">
	import { Wand2, Sparkles, Play } from 'lucide-svelte';

	interface NicknameModalProps {
		show: boolean;
		nickname: string;
		onNicknameChange: (value: string) => void;
		onSubmit: () => void;
	}

	let { show, nickname, onNicknameChange, onSubmit }: NicknameModalProps = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && nickname.trim()) {
			onSubmit();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onNicknameChange(target.value);
	}
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-white/10">
			<div class="text-center mb-6">
				<div class="flex items-center justify-center gap-2 mb-4">
					<Wand2 size={24} class="text-purple-400" />
					<Sparkles size={20} class="text-pink-400" />
				</div>
				<h2 class="text-2xl font-bold text-white mb-2">Enter Your Nickname</h2>
				<p class="text-slate-300">Join the magical world of Narrari!</p>
			</div>
			<div class="space-y-4">
				<input
					bind:value={nickname}
					oninput={handleInput}
					onkeydown={handleKeydown}
					placeholder="Your nickname..."
					class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
				/>
				<button
					onclick={onSubmit}
					disabled={!nickname.trim()}
					class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
				>
					<Play size={20} />
					Join Game
				</button>
			</div>
		</div>
	</div>
{/if}
