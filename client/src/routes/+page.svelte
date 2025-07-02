<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { storage, api } from "$lib/utils";
  import { Play, Users, Sparkles, Stars, Wand2 } from "lucide-svelte";
  import * as m from "$lib/paraglide/messages.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";

  let nickname = $state("");
  let isLoading = $state(false);
  let clientError = $state("");
  let isFloating = $state(false);

  onMount(() => {
    // Load saved nickname
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
    }

    // Start floating animation
    setTimeout(() => {
      isFloating = true;
    }, 100);
  });

  const createGame = async () => {
    if (!nickname.trim()) {
      clientError = m.home_nickname_required();
      return;
    }

    if (nickname.trim().length < 2) {
      clientError = m.home_nickname_minLength();
      return;
    }

    isLoading = true;
    clientError = "";

    storage.saveNickname(nickname.trim());

    const { data: gameId, error } = await api.game.create.post();

    if (error) {
      console.error(error);
    } else if (gameId) {
      storage.saveLastGameId(gameId);
      goto(`/game/${gameId}`);
    }
    isLoading = false;
  };

  const joinByGameId = () => {
    if (!nickname.trim()) {
      clientError = m.home_nickname_required();
      return;
    }

    const gameId = prompt(m.home_actions_joinPrompt());
    if (gameId) {
      storage.saveNickname(nickname.trim());
      goto(`/game/${gameId}`);
    }
  };
</script>

<svelte:head>
  <title>{m.home_title()} - {m.home_subtitle()}</title>
  <meta name="description" content={m.home_description()} />
</svelte:head>

<!-- Language selector in top-right corner -->
<div class="fixed top-4 right-4 z-50">
  <LanguageSelector />
</div>

<!-- Animated starry background with colorful effects -->
<div
  class="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"
>
  <!-- Animated background stars and orbs -->
  <div class="absolute inset-0">
    <!-- Large animated gradient orbs -->
    <div
      class="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse opacity-60"
    ></div>
    <div
      class="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"
    ></div>
    <div
      class="absolute top-1/2 left-3/4 w-64 h-64 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000 opacity-70"
    ></div>
    <div
      class="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-3000 opacity-40"
    ></div>

    <!-- Medium colorful floating orbs -->
    <div
      class="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-bounce opacity-80"
    ></div>
    <div
      class="absolute bottom-1/3 left-1/5 w-24 h-24 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full blur-xl animate-bounce delay-500 opacity-70"
    ></div>
    <div
      class="absolute top-2/3 right-1/5 w-28 h-28 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-xl animate-bounce delay-1000 opacity-60"
    ></div>

    <!-- Star field - small white/gray circles -->
    {#each Array(80) as _, i}
      <div
        class="absolute rounded-full animate-twinkle"
        style="
          left: {Math.random() * 100}%;
          top: {Math.random() * 100}%;
          width: {Math.random() * 4 + 1}px;
          height: {Math.random() * 4 + 1}px;
          background: {Math.random() > 0.5 ? '#ffffff' : '#e5e7eb'};
          opacity: {Math.random() * 0.8 + 0.2};
          animation-delay: {Math.random() * 3}s;
          animation-duration: {2 + Math.random() * 3}s;
        "
      ></div>
    {/each}

    <!-- Larger stars with glow -->
    {#each Array(20) as _, i}
      <div
        class="absolute rounded-full animate-pulse"
        style="
          left: {Math.random() * 100}%;
          top: {Math.random() * 100}%;
          width: {Math.random() * 6 + 4}px;
          height: {Math.random() * 6 + 4}px;
          background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.3) 70%, transparent 100%);
          animation-delay: {Math.random() * 4}s;
          animation-duration: {3 + Math.random() * 2}s;
        "
      ></div>
    {/each}

    <!-- Floating neon particles -->
    {#each Array(30) as _, i}
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

    <!-- Gradient mesh overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-bl from-pink-900/10 via-transparent to-indigo-900/10"
    ></div>
  </div>

  <!-- Main content -->
  <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <!-- Magical header -->
      <div class="text-center mb-12" class:animate-pulse={isFloating}>
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="relative">
            <Sparkles
              size={48}
              class="text-purple-300 animate-spin"
              style="animation-duration: 8s;"
            />
            <div
              class="absolute inset-0 bg-purple-400/20 blur-lg rounded-full animate-ping"
            ></div>
          </div>
          <Stars size={40} class="text-pink-300 animate-bounce" />
          <div class="relative">
            <Wand2 size={44} class="text-blue-300 animate-pulse" />
            <div
              class="absolute inset-0 bg-blue-400/20 blur-lg rounded-full animate-ping delay-500"
            ></div>
          </div>
        </div>

        <h1
          class="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent animate-pulse"
        >
          {m.home_title()}
        </h1>

        <div class="relative">
          <p class="text-2xl text-purple-100 mb-3 font-light tracking-wide">
            {m.home_subtitle()}
          </p>
          <div
            class="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur opacity-30"
          ></div>
        </div>

        <p class="text-lg text-blue-200/80 italic">
          {m.home_description()}
        </p>
      </div>

      <!-- Glassmorphic main card -->
      <div class="relative group">
        <!-- Glowing border effect -->
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"
        ></div>

        <!-- Main card -->
        <div
          class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <!-- Nickname input section -->
          <div class="mb-8">
            <label
              for="nickname"
              class="flex text-lg font-medium text-purple-100 mb-3 items-center gap-2"
            >
              <Wand2 size={20} class="text-pink-300" />
              {m.home_nickname_label()}
            </label>

            <div class="relative group">
              <input
                id="nickname"
                type="text"
                bind:value={nickname}
                placeholder={m.home_nickname_placeholder()}
                class="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border-2 border-purple-400/30 rounded-2xl
                       text-white placeholder-purple-200/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20
                       focus:bg-white/10 transition-all duration-300 text-lg
                       hover:border-purple-300/50 hover:bg-white/8"
                class:border-red-400={clientError}
                class:ring-red-400={clientError}
                disabled={isLoading}
                onkeydown={(e) => {
                  if (e.key === "Enter") {
                    createGame();
                  }
                }}
              />

              <!-- Input glow effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
              ></div>
            </div>

            {#if clientError}
              <div
                class="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm"
              >
                <p class="text-red-200 text-sm flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                  ></span>
                  {clientError}
                </p>
              </div>
            {/if}
          </div>

          <!-- Action buttons -->
          <div class="space-y-4 mb-8">
            <!-- Create game button -->
            <button
              onclick={createGame}
              disabled={isLoading || !nickname.trim()}
              class="w-full relative group overflow-hidden rounded-2xl p-1 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:from-purple-400 group-hover:to-pink-400"
              ></div>
              <div
                class="relative bg-purple-600/20 backdrop-blur-sm px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-lg transition-all duration-300 group-hover:bg-purple-500/30"
              >
                {#if isLoading}
                  <div class="relative">
                    <div
                      class="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    ></div>
                    <div
                      class="absolute inset-0 bg-white/20 blur rounded-full animate-ping"
                    ></div>
                  </div>
                  {m.home_actions_creating()}
                {:else}
                  <Play
                    size={24}
                    class="group-hover:scale-110 transition-transform duration-300"
                  />
                  {m.home_actions_createGame()}
                  <Sparkles size={20} class="animate-pulse" />
                {/if}
              </div>
            </button>

            <!-- Join game button -->
            <button
              onclick={joinByGameId}
              disabled={isLoading || !nickname.trim()}
              class="w-full relative group overflow-hidden rounded-2xl p-1 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:from-blue-400 group-hover:to-indigo-400"
              ></div>
              <div
                class="relative bg-blue-600/20 backdrop-blur-sm px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-lg transition-all duration-300 group-hover:bg-blue-500/30"
              >
                <Users
                  size={24}
                  class="group-hover:scale-110 transition-transform duration-300"
                />
                {m.home_actions_joinGame()}
                <Stars size={20} class="animate-pulse delay-500" />
              </div>
            </button>
          </div>

          <!-- How to play section -->
          <div class="relative">
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl"
            ></div>
            <div
              class="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3
                class="font-bold text-purple-200 mb-4 text-xl flex items-center gap-2"
              >
                <Wand2 size={20} class="text-pink-300 animate-pulse" />
                {m.home_howToPlay_title()}
              </h3>

              <ul class="space-y-3">
                <li
                  class="text-blue-100/90 flex items-start gap-3 group hover:text-white transition-colors duration-300"
                >
                  <span
                    class="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"
                  ></span>
                  <span class="leading-relaxed">{m.home_howToPlay_rule1()}</span
                  >
                </li>
                <li
                  class="text-blue-100/90 flex items-start gap-3 group hover:text-white transition-colors duration-300"
                >
                  <span
                    class="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"
                  ></span>
                  <span class="leading-relaxed">{m.home_howToPlay_rule2()}</span
                  >
                </li>
                <li
                  class="text-blue-100/90 flex items-start gap-3 group hover:text-white transition-colors duration-300"
                >
                  <span
                    class="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"
                  ></span>
                  <span class="leading-relaxed">{m.home_howToPlay_rule3()}</span
                  >
                </li>
                <li
                  class="text-blue-100/90 flex items-start gap-3 group hover:text-white transition-colors duration-300"
                >
                  <span
                    class="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"
                  ></span>
                  <span class="leading-relaxed">{m.home_howToPlay_rule4()}</span
                  >
                </li>
                <li
                  class="text-blue-100/90 flex items-start gap-3 group hover:text-white transition-colors duration-300"
                >
                  <span
                    class="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"
                  ></span>
                  <span class="leading-relaxed">{m.home_howToPlay_rule5()}</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom magical glow -->
  <div
    class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent pointer-events-none"
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
