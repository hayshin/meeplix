<script lang="ts">
  import { onMount } from "svelte";
  import { Gradient } from "./Gradient";

  let gradientCanvas: HTMLCanvasElement;

  onMount(() => {
    // Initialize gradient background
    if (typeof window !== "undefined") {
      const gradient = new Gradient();
      gradient.initGradient("#gradient-canvas");
    }
  });
</script>

<svelte:head>
  <script src="./Gradient.js"></script>
</svelte:head>

<!-- Gradient background canvas -->
<canvas
  id="gradient-canvas"
  bind:this={gradientCanvas}
  style="width: 100vw; height: 100vh"
></canvas>

<style>
  :global(#gradient-canvas) {
    --gradient-color-1: #0a0214; /* Near Black with a hint of deep purple */
    --gradient-color-2: #3e006b; /* Deep, intense royal purple */
    --gradient-color-3: #1a52b5; /* Bright, vivid magic blue */
    --gradient-color-4: #03003a; /* Very dark, inky blue */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    opacity: 0.6;
  }
</style>
