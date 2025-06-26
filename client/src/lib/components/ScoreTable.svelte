<script lang="ts">
	import type { Player } from '@shared/types';
	import { ui } from '$lib/utils';
	import { Trophy, Medal, Award } from 'lucide-svelte';

	interface Props {
		players: Player[];
		roundScores?: { [playerId: string]: number };
		showRoundScores?: boolean;
	}

	let { players, roundScores = {}, showRoundScores = false }: Props = $props();

	// Сортируем игроков по очкам (по убыванию)
	const sortedPlayers = $derived([...players].sort((a, b) => b.score - a.score));

	const getPositionIcon = (position: number) => {
		switch (position) {
			case 1:
				return Trophy;
			case 2:
				return Medal;
			case 3:
				return Award;
			default:
				return null;
		}
	};

	const getPositionColor = (position: number) => {
		switch (position) {
			case 1:
				return 'text-yellow-500';
			case 2:
				return 'text-gray-400';
			case 3:
				return 'text-orange-600';
			default:
				return 'text-gray-600';
		}
	};
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
		<Trophy size={20} class="text-yellow-500" />
		Таблица результатов
	</h3>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="border-b-2 border-gray-200">
					<th class="px-2 py-2 text-left">Место</th>
					<th class="px-2 py-2 text-left">Игрок</th>
					<th class="px-2 py-2 text-center">Общие очки</th>
					{#if showRoundScores}
						<th class="px-2 py-2 text-center">За раунд</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each sortedPlayers as player, index (player.id)}
					{@const position = index + 1}
					{@const Icon = getPositionIcon(position)}
					{@const roundScore = roundScores[player.id] || 0}
					<tr
						class="border-b border-gray-100 transition-colors hover:bg-gray-50"
						class:bg-yellow-50={position === 1}
						class:bg-gray-50={position === 2}
						class:bg-orange-50={position === 3}
					>
						<!-- Место -->
						<td class="px-2 py-3">
							<div class="flex items-center gap-2">
								{#if Icon}
									<svelte:component this={Icon} size={16} class={getPositionColor(position)} />
								{:else}
									<span class="font-medium text-gray-600">{position}</span>
								{/if}
							</div>
						</td>

						<!-- Игрок -->
						<td class="px-2 py-3">
							<div class="flex items-center gap-3">
								<!-- Аватар -->
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white {ui.getPlayerColor(
										player.id
									)}"
								>
									{ui.getInitials(player.nickname)}
								</div>

								<!-- Информация об игроке -->
								<div>
									<div class="font-medium text-gray-900">
										{player.nickname}
									</div>
									<div class="text-xs text-gray-500">
										{player.isConnected ? 'Онлайн' : 'Оффлайн'}
									</div>
								</div>
							</div>
						</td>

						<!-- Общие очки -->
						<td class="px-2 py-3 text-center">
							<span
								class="text-lg font-bold"
								class:text-yellow-600={position === 1}
								class:text-gray-600={position === 2}
								class:text-orange-600={position === 3}
								class:text-gray-800={position > 3}
							>
								{player.score}
							</span>
						</td>

						<!-- Очки за раунд -->
						{#if showRoundScores}
							<td class="px-2 py-3 text-center">
								{#if roundScore > 0}
									<span class="font-medium text-green-600">
										+{roundScore}
									</span>
								{:else}
									<span class="text-gray-400"> 0 </span>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Прогресс до победы -->
	<div class="mt-4 space-y-2">
		<div class="mb-2 text-sm text-gray-600">Прогресс до победы (20 очков):</div>
		{#each sortedPlayers.slice(0, 3) as player}
			<div class="flex items-center gap-3">
				<div class="w-20 truncate text-sm font-medium text-gray-700">
					{player.nickname}
				</div>
				<div class="h-2 flex-1 rounded-full bg-gray-200">
					<div
						class="h-2 rounded-full bg-blue-500 transition-all duration-300"
						style="width: {Math.min((player.score / 20) * 100, 100)}%"
					></div>
				</div>
				<div class="w-8 text-sm text-gray-600">
					{player.score}/20
				</div>
			</div>
		{/each}
	</div>
</div>
