<script lang="ts">
  import { createEventDispatcher } from "svelte";

  interface Props {
    variant?: "primary" | "secondary" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    children?: any;
    onClick?: () => void;
  }

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    fullWidth = false,
    children,
    onClick = () => {},
  }: Props = $props();

  const dispatch = createEventDispatcher();

  const handleClick = () => {
    if (!disabled && !loading) {
      dispatch("click");
      onClick();
    }
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-purple-400/30 shadow-purple-500/25",
    secondary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-400/30 shadow-blue-500/25",
    success:
      "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-400/30 shadow-green-500/25",
    warning:
      "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 border-orange-400/30 shadow-orange-500/25",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-400/30 shadow-red-500/25",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-4 text-lg",
    lg: "px-8 py-6 text-xl",
  };
</script>

<button
  onclick={handleClick}
  disabled={disabled || loading}
  class="pixel-button font-silkscreen text-white transition-all duration-200 ease-out
         rounded-lg border backdrop-blur-sm shadow-lg hover:shadow-xl
         transform hover:scale-105 active:scale-95
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
         flex items-center justify-center gap-3
         {variantClasses[variant]}
         {sizeClasses[size]}
         {fullWidth ? 'w-full' : ''}
         text-shadow pixel-border"
>
  {#if loading}
    <div
      class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
    ></div>
    <span>Loading...</span>
  {:else}
    {@render children?.()}
  {/if}
</button>

<style>
  .pixel-button {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    position: relative;
    overflow: hidden;
  }

  .pixel-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.1) 75%,
      transparent 75%
    );
    background-size: 4px 4px;
    opacity: 0.3;
    pointer-events: none;
  }

  .pixel-button:hover::before {
    animation: pixel-shimmer 0.8s linear infinite;
  }

  .pixel-border {
    border-width: 2px;
    border-style: solid;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .text-shadow {
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.8),
      0 0 0 currentColor,
      1px 1px 0 rgba(0, 0, 0, 0.5),
      -1px -1px 0 rgba(0, 0, 0, 0.5);
  }

  @keyframes pixel-shimmer {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 8px 8px;
    }
  }

  :global(.font-silkscreen) {
    font-family: "Silkscreen", monospace !important;
  }

  /* Ensure Silkscreen font is applied to button and all child elements */
  .pixel-button,
  .pixel-button * {
    font-family: "Silkscreen", monospace !important;
  }
</style>
