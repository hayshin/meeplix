<!-- Star field overlay -->
<div class="absolute inset-0 pointer-events-none">
  <!-- Small twinkling stars -->
  {#each Array(60) as _, i}
    <div
      class="absolute rounded-full animate-twinkle"
      style="
      left: {Math.random() * 100}%;
      top: {Math.random() * 100}%;
      width: {Math.random() * 3 + 1}px;
      height: {Math.random() * 3 + 1}px;
      background: {Math.random() > 0.5 ? '#ffffff' : '#e5e7eb'};
      opacity: {Math.random() * 0.8 + 0.2};
      animation-delay: {Math.random() * 3}s;
      animation-duration: {2 + Math.random() * 3}s;
    "
    ></div>
  {/each}
  <!-- Larger glowing stars -->
  {#each Array(15) as _, i}
    <div
      class="absolute rounded-full animate-pulse"
      style="
      left: {Math.random() * 100}%;
      top: {Math.random() * 100}%;
      width: {Math.random() * 6 + 4}px;
      height: {Math.random() * 6 + 4}px;
      background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.4) 70%, transparent 100%);
      animation-delay: {Math.random() * 4}s;
      animation-duration: {3 + Math.random() * 2}s;
    "
    ></div>
  {/each}

  <!-- Floating neon particles -->
  {#each Array(20) as _, i}
    <div
      class="absolute w-1 h-1 rounded-full animate-float-slow"
      style="
      left: {Math.random() * 100}%;
      top: {Math.random() * 100}%;
      background: {['#a855f7', '#ec4899', '#06b6d4', '#8b5cf6', '#f59e0b'][
        Math.floor(Math.random() * 5)
      ]};
      opacity: {Math.random() * 0.6 + 0.3};
      animation-delay: {Math.random() * 5}s;
      animation-duration: {4 + Math.random() * 4}s;
      box-shadow: 0 0 6px currentColor;
    "
    ></div>
  {/each}

  <!-- Subtle overlay gradients -->
  <div
    class="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-blue-900/10"
  ></div>
  <div
    class="absolute inset-0 bg-gradient-to-bl from-pink-900/5 via-transparent to-indigo-900/5"
  ></div>
</div>

<style>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.5);
    }
  }

  @keyframes float-slow {
    0%,
    100% {
      transform: translateY(0px) translateX(0px);
    }
    25% {
      transform: translateY(-15px) translateX(10px);
    }
    50% {
      transform: translateY(-10px) translateX(-5px);
    }
    75% {
      transform: translateY(-20px) translateX(8px);
    }
  }

  .animate-twinkle {
    animation: twinkle 2s ease-in-out infinite;
  }

  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }
</style>
