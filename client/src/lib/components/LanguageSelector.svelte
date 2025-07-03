<script lang="ts">
  import { setLocale, getLocale, type Locale } from "$lib/paraglide/runtime";
  import { Globe, Check } from "lucide-svelte";
  import * as m from "$lib/paraglide/messages.js";

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "kz", name: "Қазақша", flag: "🇰🇿" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  let isOpen = $state(false);
  let currentLang = $state("en");

  function toLocale(str: string): Locale {
    if (languages.some((lang) => lang.code === str)) return str as Locale;
    throw new Error(`Invalid locale: ${str}`);
  }

  const selectLanguage = (langCode: string) => {
    setLocale(toLocale(langCode));
    currentLang = langCode;
    isOpen = false;
  };

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === currentLang) || languages[0];
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
    class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm
           border border-white/20 rounded-lg text-white hover:bg-white/20
           transition-colors duration-200"
    aria-label="Select language"
  >
    <Globe size={18} class="text-purple-400" />
    <span class="text-xl">{getCurrentLanguage().flag}</span>
    <span class="font-medium hidden sm:block">{getCurrentLanguage().name}</span>
    <svg
      class="w-4 h-4 text-purple-400 transition-transform duration-200"
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
  </button>

  <!-- Dropdown menu -->
  {#if isOpen}
    <div
      class="absolute top-full right-0 mt-2 min-w-[200px] bg-white/10 backdrop-blur-sm
             border border-white/20 rounded-lg shadow-xl z-50 p-2"
    >
      {#each languages as language}
        <button
          onclick={() => selectLanguage(language.code)}
          class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                 text-white hover:bg-white/20 transition-colors duration-200 {language.code ===
          currentLang
            ? 'bg-white/10'
            : ''}"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{language.flag}</span>
            <span class="font-medium">{language.name}</span>
          </div>

          {#if language.code === currentLang}
            <Check size={18} class="text-green-400" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
