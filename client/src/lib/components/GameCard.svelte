<script lang="ts">
	import type { Card } from '@shared/types';

	interface Props {
		card: Card;
		isSelected?: boolean;
		isClickable?: boolean;
		isEnlarged?: boolean;
		showVotes?: boolean;
		voters?: string[];
		onclick?: () => void;
		ondoubleclick?: () => void;
	}

	let {
		card,
		isSelected = false,
		isClickable = true,
		isEnlarged = false,
		showVotes = false,
		voters = [],
		onclick,
		ondoubleclick
	}: Props = $props();

	let isHovered = $state(false);
</script>

<div
	class="group relative cursor-pointer transition-all duration-200"
	class:scale-110={isSelected && !isEnlarged}
	class:scale-150={isEnlarged}
	class:ring-4={isSelected}
	class:ring-blue-500={isSelected}
	class:hover:scale-105={isClickable && !isSelected && !isEnlarged}
	class:cursor-not-allowed={!isClickable}
	role="button"
	tabindex={isClickable ? 0 : -1}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	onclick={() => {
		if (isClickable && onclick) {
			onclick();
		}
	}}
	ondblclick={() => {
		if (isClickable && ondoubleclick) {
			ondoubleclick();
		}
	}}
	onkeydown={(e) => {
		if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			if (onclick) onclick();
		}
	}}
>
	<!-- Карта -->
	<div
		class="relative h-36 w-24 overflow-hidden rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-100 to-purple-100 shadow-md"
		class:shadow-lg={isHovered || isSelected}
		class:border-blue-500={isSelected}
	>
		<!-- Изображение карты -->
		<div
			class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
		>
			<!-- Временная заглушка вместо изображения -->
			<div class="p-2 text-center text-white">
				<div class="mb-1 text-lg font-bold">🎨</div>
				<div class="text-xs">{card.description || `Card ${card.id}`}</div>
			</div>
		</div>

		<!-- Индикатор выбора -->
		{#if isSelected}
			<div
				class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"
			>
				<div class="h-2 w-2 rounded-full bg-white"></div>
			</div>
		{/if}

		<!-- Кнопка для увеличенной карты -->
		{#if isEnlarged && isClickable}
			<div class="absolute bottom-2 left-1/2 -translate-x-1/2 transform">
				<button
					class="rounded-full bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
					onclick={() => {
						if (ondoubleclick) ondoubleclick();
					}}
				>
					Выбрать эту карту
				</button>
			</div>
		{/if}
	</div>

	<!-- Голоса игроков -->
	{#if showVotes && voters.length > 0}
		<div class="absolute -right-2 -top-2 flex -space-x-1">
			{#each voters.slice(0, 3) as voter}
				<div
					class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500"
				>
					<span class="text-xs font-bold text-white">
						{voter.charAt(0).toUpperCase()}
					</span>
				</div>
			{/each}
			{#if voters.length > 3}
				<div
					class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-500"
				>
					<span class="text-xs font-bold text-white">
						+{voters.length - 3}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>
