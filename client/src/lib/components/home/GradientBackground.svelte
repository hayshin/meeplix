<script lang="ts">
  import { onMount } from "svelte";

  let backgroundContainer: HTMLDivElement;

  onMount(() => {
    // Add floating animation delays to elements
    if (backgroundContainer) {
      const floatingElements =
        backgroundContainer.querySelectorAll(".floating");
      floatingElements.forEach((element, index) => {
        (element as HTMLElement).style.animationDelay = `${index * 0.5}s`;
      });
    }
  });
</script>

<!-- Fantasy Magic Background -->
<div class="fantasy-background" bind:this={backgroundContainer}>
  <!-- Mystical Card Pattern -->
  <div class="card-pattern"></div>

  <!-- Floating Magic Elements -->
  <div class="magic-elements">
    <!-- Floating Cards -->
    <div class="floating-card floating card-1">♠</div>
    <div class="floating-card floating card-2">♥</div>
    <div class="floating-card floating card-3">♦</div>
    <div class="floating-card floating card-4">♣</div>
    <div class="floating-card floating card-5">★</div>
    <div class="floating-card floating card-6">◆</div>

    <!-- Magic Sparkles -->
    <div class="sparkle floating spark-1">✦</div>
    <div class="sparkle floating spark-2">✧</div>
    <div class="sparkle floating spark-3">✨</div>
    <div class="sparkle floating spark-4">⟡</div>
    <div class="sparkle floating spark-5">◈</div>
    <div class="sparkle floating spark-6">❋</div>
    <div class="sparkle floating spark-7">✦</div>
    <div class="sparkle floating spark-8">✧</div>
  </div>

  <!-- Mystical Overlay -->
  <div class="mystical-overlay"></div>
</div>

<style>
  .fantasy-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 25% 25%,
        rgba(67, 56, 202, 0.02) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 75% 75%,
        rgba(88, 28, 135, 0.02) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(30, 64, 175, 0.01) 0%,
        transparent 70%
      ),
      linear-gradient(
        135deg,
        #0a0118 0%,
        #0f0526 25%,
        #1a0b3d 50%,
        #0f0526 75%,
        #0a0118 100%
      );
    overflow: hidden;
  }

  .card-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 40px,
        rgba(67, 56, 202, 0.01) 40px,
        rgba(67, 56, 202, 0.01) 80px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 40px,
        rgba(88, 28, 135, 0.01) 40px,
        rgba(88, 28, 135, 0.01) 80px
      );
    background-size: 120px 120px;
  }

  .magic-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .floating-card {
    position: absolute;
    font-size: 2rem;
    font-weight: bold;
    color: rgba(67, 56, 202, 0.2);
    text-shadow: 0 0 20px rgba(67, 56, 202, 0.25);
    animation: float 6s ease-in-out infinite;
  }

  .sparkle {
    position: absolute;
    font-size: 1.5rem;
    color: rgba(99, 102, 241, 0.25);
    text-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    animation: sparkle 4s ease-in-out infinite;
  }

  .mystical-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(
        circle at 25% 25%,
        rgba(138, 109, 255, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 75% 75%,
        rgba(168, 85, 247, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(59, 130, 246, 0.05) 0%,
        transparent 70%
      );
    animation: mysticalPulse 8s ease-in-out infinite;
  }

  /* Floating Card Positions */
  .card-1 {
    top: 10%;
    left: 15%;
  }
  .card-2 {
    top: 20%;
    right: 20%;
  }
  .card-3 {
    bottom: 30%;
    left: 10%;
  }
  .card-4 {
    bottom: 15%;
    right: 15%;
  }
  .card-5 {
    top: 60%;
    left: 80%;
  }
  .card-6 {
    top: 80%;
    left: 60%;
  }

  /* Sparkle Positions */
  .spark-1 {
    top: 15%;
    left: 30%;
  }
  .spark-2 {
    top: 40%;
    right: 25%;
  }
  .spark-3 {
    bottom: 20%;
    left: 40%;
  }
  .spark-4 {
    bottom: 40%;
    right: 30%;
  }
  .spark-5 {
    top: 70%;
    left: 20%;
  }
  .spark-6 {
    top: 30%;
    left: 70%;
  }
  .spark-7 {
    bottom: 60%;
    right: 40%;
  }
  .spark-8 {
    top: 50%;
    left: 5%;
  }

  /* Animations */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.2;
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
      opacity: 0.3;
    }
  }

  @keyframes sparkle {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.2;
    }
    25% {
      transform: scale(1.2) rotate(90deg);
      opacity: 0.5;
    }
    50% {
      transform: scale(0.8) rotate(180deg);
      opacity: 0.15;
    }
    75% {
      transform: scale(1.1) rotate(270deg);
      opacity: 0.4;
    }
  }

  @keyframes mysticalPulse {
    0%,
    100% {
      opacity: 0.1;
      transform: scale(1);
    }
    50% {
      opacity: 0.25;
      transform: scale(1.05);
    }
  }

  .floating {
    animation-duration: 6s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .floating-card {
      font-size: 1.5rem;
    }

    .sparkle {
      font-size: 1.2rem;
    }
  }
</style>
