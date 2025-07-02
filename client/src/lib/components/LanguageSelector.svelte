<script lang="ts">
  import { setLocale, getLocale } from "$lib/paraglide/runtime";
  import { Globe, Check } from "lucide-svelte";

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "kz", name: "Қазақша", flag: "🇰🇿" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  let isOpen = $state(false);

  const currentLanguage = $derived(
    languages.find((lang) => lang.code === getLocale()) || languages[0],
  );

  const selectLanguage = (langCode: Locale) => {
    setLocale(langCode);
    isOpen = false;
  };

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".language-selector")) {
      isOpen = false;
    }
  };
</script>

<svelte:window onclick={handleClickOutside} />

<div class="language-selector relative">
  <!-- Main button -->
  <button
    onclick={toggleDropdown}
    class="relative group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm
           border border-white/20 rounded-xl text-white hover:bg-white/20
           transition-all duration-300 hover:scale-105 active:scale-95"
    aria-label="Select language"
  >
    <!-- Glowing border effect -->
    <div
      class="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    ></div>

    <div class="relative flex items-center gap-2">
      <Globe
        size={18}
        class="text-purple-300 group-hover:rotate-12 transition-transform duration-300"
      />
      <span class="text-xl">{currentLanguage.flag}</span>
      <span class="font-medium hidden sm:block">{currentLanguage.name}</span>
      <svg
        class="w-4 h-4 text-purple-300 transition-transform duration-300"
        class:rotate-180={isOpen}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>
  </button>

  <!-- Dropdown menu -->
  {#if isOpen}
    <div
      class="absolute top-full right-0 mt-2 min-w-[200px] bg-white/10 backdrop-blur-xl
             border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden
             animate-in slide-in-from-top-2 fade-in duration-200"
    >
      <!-- Magical background effect -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
      ></div>

      <div class="relative p-2">
        {#each languages as language}
          <button
            onclick={() => selectLanguage(language.code)}
            class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                   text-white hover:bg-white/20 transition-all duration-300
                   group relative overflow-hidden {language.code === getLocale()
              ? 'bg-white/10'
              : ''}"
          >
            <!-- Hover glow effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <div class="relative flex items-center gap-3">
              <span
                class="text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                {language.flag}
              </span>
              <span class="font-medium">{language.name}</span>
            </div>

            {#if language.code === getLocale()}
              <Check size={18} class="text-green-400 animate-pulse" />
            {/if}
          </button>
        {/each}
      </div>

      <!-- Bottom magical glow -->
      <div
        class="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-purple-500/20 to-transparent"
      ></div>
    </div>
  {/if}
</div>

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-in {
    animation: animate-in 200ms ease-out;
  }

  .slide-in-from-top-2 {
    animation-name: slide-in-from-top-2;
  }

  @keyframes slide-in-from-top-2 {
    from {
      transform: translateY(-8px);
    }
    to {
      transform: translateY(0);
    }
  }

  .fade-in {
    animation-name: fade-in;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
