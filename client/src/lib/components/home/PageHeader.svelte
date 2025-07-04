<script lang="ts">
  import { Sparkles, Stars, Wand2 } from "lucide-svelte";
</script>

<style>
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  }

  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.9);
  }
</style>

<!-- Header -->
<div class="text-center mb-12">
  <div class="flex items-center justify-center gap-3 mb-6">
    <Sparkles size={32} class="text-purple-300 drop-shadow-lg" />
    <Wand2 size={28} class="text-pink-300 drop-shadow-lg" />
    <Stars size={30} class="text-blue-300 drop-shadow-lg" />
  </div>

  <!-- Title image -->
  <div class="mb-4">
    <img
      src="/title.png"
      alt="Narrari"
      class="mx-auto max-w-full h-auto max-h-24 md:max-h-32 object-contain drop-shadow-2xl"
    />
  </div>

  <p class="text-xl mb-3 text-white font-medium text-shadow-lg">
    AI-Enhanced Storytelling Adventure
  </p>

  <p class="text-lg text-gray-100 italic text-shadow">
    Embark on a magical journey where imagination meets artificial intelligence
  </p>
</div>
