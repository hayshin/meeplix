<script lang="ts">
  import { ImageIcon, PlayIcon } from "lucide-svelte";

  interface DeckCardProps {
    name: string;
    thumbnailUrl?: string;
    cardAmount: number;
    id?: string;
    description?: string | null;
    onClick?: () => void;
  }

  let {
    name,
    thumbnailUrl,
    cardAmount,
    id,
    description,
    onClick,
  }: DeckCardProps = $props();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };
</script>

<div
  class="group cursor-pointer overflow-hidden rounded-lg bg-card border border-border transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <div class="aspect-video w-full overflow-hidden bg-muted">
    {#if thumbnailUrl}
      <img
        src={thumbnailUrl}
        alt={`${name} thumbnail`}
        class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center">
        <ImageIcon class="h-12 w-12 text-muted-foreground" />
      </div>
    {/if}
  </div>
  <div class="p-4">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="text-lg font-semibold leading-tight text-card-foreground">
          {name}
        </h3>
        {#if description}
          <p class="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        {/if}
      </div>
      <PlayIcon
        class="ml-2 h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
    <div class="mt-3 flex items-center justify-between">
      <span
        class="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
      >
        {cardAmount} cards
      </span>
    </div>
  </div>
</div>
