<script lang="ts">
  import type { CardEntity } from "$shared/types/card";
  import { onMount } from "svelte";
  import { api, PUBLIC_API_URL } from "../utils";
  interface Props {
    card: CardEntity;
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
    ondoubleclick,
  }: Props = $props();

  let isHovered = $state(false);
  let imageLoaded = $state(false);
  let imageError = $state(false);

  // Construct image URL from card title (which contains the filename)
  let imageUrl = card.title ? `${PUBLIC_API_URL}/cards/${card.title}` : null;

  onMount(() => {
    console.log(card);
    console.log(imageUrl);
  });

  function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
  }

  function handleImageError() {
    imageLoaded = false;
    imageError = true;
    console.error("Failed to load image:", imageUrl);
  }
</script>

<div
  class="group relative cursor-pointer transition-all duration-200"
  class:scale-110={isSelected && !isEnlarged}
  class:scale-150={isEnlarged}
  class:ring-4={isSelected}
  class:ring-purple-500={isSelected}
  class:hover:scale-110={isClickable && !isSelected && !isEnlarged}
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
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (onclick) onclick();
    }
  }}
>
  <!-- Card -->
  <div
    class="relative h-48 w-32 overflow-hidden rounded-xl border-2 border-gray-300 bg-gradient-to-br from-slate-100 to-purple-100 shadow-lg"
    class:shadow-xl={isHovered || isSelected}
    class:border-purple-500={isSelected}
    class:shadow-purple-500:20={isSelected}
  >
    <!-- Card Image -->
    {#if imageUrl && !imageError}
      <img
        src={imageUrl}
        alt={`Card ${card.id}`}
        class="h-full w-full object-cover transition-transform duration-200"
        class:opacity-0={!imageLoaded}
        class:opacity-100={imageLoaded}
        class:scale-105={isHovered && isClickable}
        onload={handleImageLoad}
        onerror={handleImageError}
      />
    {/if}

    <!-- Placeholder for missing/error images -->
    {#if !imageUrl || imageError || !imageLoaded}
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 via-purple-600 to-blue-600"
        class:opacity-0={imageLoaded && !imageError}
      >
        <div class="p-3 text-center text-white">
          <div class="mb-2 text-2xl">🎨</div>
          <div class="text-sm font-medium">
            {`Card ${card.id}`}
          </div>
        </div>
      </div>
    {/if}

    <!-- Loading indicator -->
    {#if imageUrl && !imageLoaded && !imageError}
      <div
        class="absolute inset-0 flex items-center justify-center bg-slate-200"
      >
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
        ></div>
      </div>
    {/if}

    <!-- Selection indicator -->
    {#if isSelected}
      <div
        class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 shadow-lg"
      >
        <div class="h-3 w-3 rounded-full bg-white"></div>
      </div>
    {/if}

    <!-- Enlarged card button -->
    {#if isEnlarged && isClickable}
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 transform">
        <button
          class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          onclick={() => {
            if (ondoubleclick) ondoubleclick();
          }}
        >
          Select This Card
        </button>
      </div>
    {/if}
  </div>

  <!-- Player votes -->
  {#if showVotes && voters.length > 0}
    <div class="absolute -right-2 -top-2 flex -space-x-1">
      {#each voters.slice(0, 3) as voter}
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg"
        >
          <span class="text-xs font-bold text-white">
            {voter.charAt(0).toUpperCase()}
          </span>
        </div>
      {/each}
      {#if voters.length > 3}
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-500 shadow-lg"
        >
          <span class="text-xs font-bold text-white">
            +{voters.length - 3}
          </span>
        </div>
      {/if}
    </div>
  {/if}
</div>
