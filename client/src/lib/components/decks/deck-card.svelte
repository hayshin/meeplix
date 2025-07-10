<script lang="ts">
  import { ImageIcon, PlayIcon, SparklesIcon, ZapIcon } from "lucide-svelte";

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

  // Generate a gradient based on the deck name for visual variety
  const getGradientClass = (name: string) => {
    const hash = name.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const gradients = [
      "from-purple-500/80 to-pink-500/80",
      "from-blue-500/80 to-cyan-500/80",
      "from-green-500/80 to-emerald-500/80",
      "from-orange-500/80 to-red-500/80",
      "from-indigo-500/80 to-purple-500/80",
      "from-rose-500/80 to-pink-500/80",
      "from-teal-500/80 to-blue-500/80",
      "from-amber-500/80 to-orange-500/80",
    ];

    return gradients[Math.abs(hash) % gradients.length];
  };

  const gradientClass = getGradientClass(name);
</script>

<div
  class="group cursor-pointer overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:bg-white/15 active:scale-95"
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <!-- Card Image/Thumbnail -->
  <div class="relative aspect-[4/3] w-full overflow-hidden">
    {#if thumbnailUrl}
      <img
        src={thumbnailUrl}
        alt={`${name} deck thumbnail`}
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    {:else}
      <div class="relative h-full w-full bg-gradient-to-br {gradientClass}">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <SparklesIcon class="h-16 w-16 text-white/90 mx-auto mb-2" />
            <div class="text-white/60 text-sm font-medium">{name}</div>
          </div>
        </div>
        <!-- Magical sparkles overlay -->
        <div class="absolute top-4 right-4">
          <ZapIcon class="h-6 w-6 text-white/70 animate-pulse" />
        </div>
      </div>
    {/if}

    <!-- Hover play button -->
    <div
      class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
    >
      <div class="bg-white/20 backdrop-blur-sm rounded-full p-4">
        <PlayIcon class="h-8 w-8 text-white fill-white" />
      </div>
    </div>
  </div>

  <!-- Card Content -->
  <div class="p-6">
    <!-- Title and Description -->
    <div class="mb-4">
      <h3
        class="text-xl font-bold text-white mb-2 leading-tight group-hover:text-purple-200 transition-colors"
      >
        {name}
      </h3>
      {#if description}
        <p class="text-white/70 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      {:else}
        <p class="text-white/50 text-sm italic">
          A mysterious deck awaiting discovery...
        </p>
      {/if}
    </div>

    <!-- Card Stats -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span class="text-white text-sm font-medium">
            {cardAmount} cards
          </span>
        </div>
      </div>

      <!-- Action indicator -->
      <div
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div class="bg-purple-500/30 backdrop-blur-sm rounded-full p-2">
          <PlayIcon class="h-4 w-4 text-purple-200" />
        </div>
      </div>
    </div>

    <!-- Premium badge for special decks -->
    {#if cardAmount > 50}
      <div class="mt-3 flex justify-center">
        <div
          class="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-3 py-1"
        >
          <span
            class="text-yellow-300 text-xs font-medium flex items-center gap-1"
          >
            <SparklesIcon class="h-3 w-3" />
            Premium Deck
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Magical border effect on hover -->
  <div
    class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
  >
    <div
      class="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-sm"
    ></div>
  </div>
</div>
