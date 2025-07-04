<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let particles: Particle[] = [];
  let animationId: number;

  // Magic symbols for the cursor trail
  const magicSymbols = ['✦', '✧', '✨', '⭐', '🌟', '✪', '❋', '⟡', '◈', '🪄', '🔮', '⚡'];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    symbol: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }

  function createParticle(x: number, y: number): Particle {
    const colors = [
      'rgba(138, 109, 255, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(99, 102, 241, 1)',
      'rgba(147, 197, 253, 1)',
      'rgba(196, 181, 253, 1)',
      'rgba(255, 255, 255, 1)'
    ];

    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: 30 + Math.random() * 30,
      size: 12 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      symbol: magicSymbols[Math.floor(Math.random() * magicSymbols.length)],
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1
    };
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Update rotation
      p.rotation += p.rotationSpeed;

      // Update life
      p.life++;

      // Update opacity based on life
      p.opacity = 1 - (p.life / p.maxLife);

      // Apply gravity and friction
      p.vy += 0.05;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Remove dead particles
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.save();

      // Set opacity
      ctx.globalAlpha = p.opacity;

      // Move to particle position
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Set text properties
      ctx.font = `${p.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Create glow effect
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;

      // Draw the symbol
      ctx.fillText(p.symbol, 0, 0);

      ctx.restore();
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }

  function handleMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create particles at mouse position
    if (Math.random() < 0.3) { // 30% chance to create particle
      particles.push(createParticle(x, y));
    }

    // Limit particle count
    if (particles.length > 50) {
      particles.shift();
    }
  }

  function resizeCanvas() {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onMount(() => {
    if (!canvas) return;

    ctx = canvas.getContext('2d')!;
    resizeCanvas();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="magical-cursor"
></canvas>

<style>
  .magical-cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: screen;
  }
</style>
