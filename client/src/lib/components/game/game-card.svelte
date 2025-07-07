<script lang="ts">
  import type { PublicCard } from "$shared/models/public_card";
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from "$lib/utils";

  interface GameCardProps {
    card: PublicCard;
    isSelected?: boolean;
    isClickable?: boolean;
    isEnlarged?: boolean;
    onclick?: () => void;
    onEnlarge?: () => void;
  }

  let {
    card,
    isSelected = false,
    isClickable = true,
    isEnlarged = false,
    onclick,
    onEnlarge,
  }: GameCardProps = $props();

  let isHovered = $state(false);
  let imageLoaded = $state(false);
  let imageError = $state(false);

  const handleClick = () => {
    if (isClickable && onclick) {
      onclick();
    }
  };

  const handleDoubleClick = () => {
    if (onEnlarge) {
      onEnlarge();
    }
  };

  const getImageUrl = (card: PublicCard): string => {
    let imageUrl = card.name ? `${PUBLIC_API_URL}/api/cards/${card.name}` : "";
    console.log(imageUrl);
    return imageUrl;
  };

  onMount(() => {
    // Preload image
    const img = new Image();
    img.onload = () => {
      imageLoaded = true;
    };
    img.onerror = () => {
      imageError = true;
    };
    img.src = getImageUrl(card);
  });
</script>

<div
  class="game-card relative overflow-hidden rounded-lg transition-all duration-200 {isClickable
    ? 'cursor-pointer'
    : ''} {isSelected
    ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900'
    : ''} {isEnlarged ? 'fixed inset-4 z-50 !cursor-default' : 'aspect-[3/4]'}"
  class:hovered={isHovered && isClickable}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onclick={handleClick}
  ondblclick={handleDoubleClick}
  role={isClickable ? "button" : "img"}
  onkeydown={(e) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  }}
>
  <!-- Background overlay for enlarged state -->
  {#if isEnlarged}
    <div
      class="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
      onclick={onEnlarge}
    ></div>
  {/if}

  <!-- Card Content -->
  <div
    class="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg overflow-hidden transition-all duration-200 {isHovered &&
    isClickable
      ? 'scale-105 shadow-xl border-purple-400/30'
      : ''} {isSelected
      ? 'bg-gradient-to-br from-purple-800/20 to-pink-800/20'
      : ''}"
  >
    <!-- Card Image -->
    <div class="relative h-3/4 overflow-hidden">
      {#if imageLoaded && !imageError}
        <img
          src={getImageUrl(card)}
          alt={card.name}
          class="w-full h-full object-cover transition-transform duration-200 {isHovered &&
          isClickable
            ? 'scale-110'
            : ''}"
          loading="lazy"
        />
      {:else if imageError}
        <div
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800"
        >
          <div class="text-center text-slate-400">
            <div class="text-4xl mb-2">🎭</div>
            <div class="text-sm">Image not found</div>
          </div>
        </div>
      {:else}
        <!-- Loading placeholder -->
        <div
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse"
        >
          <div class="text-slate-500">
            <div
              class="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      ></div>

      <!-- Selection indicator -->
      {#if isSelected}
        <div
          class="absolute top-2 right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      {/if}

      <!-- Enlarged indicator -->
      {#if onEnlarge && !isEnlarged}
        <div
          class="absolute top-2 left-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center opacity-0 transition-opacity {isHovered
            ? 'opacity-100'
            : ''}"
        >
          <svg
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      {/if}
    </div>

    <!-- Card Title -->
    <div class="relative h-1/4 p-2 flex items-center justify-center">
      <h3
        class="text-center text-white font-medium text-sm leading-tight line-clamp-2"
        title={card.name}
      >
        {card.name}
      </h3>
    </div>
  </div>

  <!-- Close button for enlarged state -->
  {#if isEnlarged && onEnlarge}
    <button
      class="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
      onclick={onEnlarge}
      type="button"
      aria-label="Close enlarged view"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  .game-card.hovered {
    transform: translateY(-2px);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
