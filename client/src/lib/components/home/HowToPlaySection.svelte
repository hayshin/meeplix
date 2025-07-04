<script lang="ts">
  import { Wand2 } from "lucide-svelte";
</script>

<style>
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  }
</style>

<!-- How to play section -->
<div class="bg-black/30 border border-white/20 rounded-lg p-6 backdrop-blur-sm">
  <h3 class="font-bold text-white mb-4 text-xl flex items-center gap-2 text-shadow">
    <Wand2 size={20} class="text-purple-300" />
    How to Play:
  </h3>

  <ul class="space-y-3">
    <li class="text-gray-100 flex items-start gap-3 text-shadow">
      <span
        class="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0 shadow-sm"
      ></span>
      <span>Minimum 3 storytellers to begin the adventure</span>
    </li>
    <li class="text-gray-100 flex items-start gap-3 text-shadow">
      <span
        class="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0 shadow-sm"
      ></span>
      <span>The narrator chooses a card and weaves an association</span>
    </li>
    <li class="text-gray-100 flex items-start gap-3 text-shadow">
      <span
        class="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0 shadow-sm"
      ></span>
      <span>Other players select cards that match the story</span>
    </li>
    <li class="text-gray-100 flex items-start gap-3 text-shadow">
      <span
        class="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0 shadow-sm"
      ></span>
      <span>Everyone votes for the narrator's mysterious card</span>
    </li>
    <li class="text-gray-100 flex items-start gap-3 text-shadow">
      <span
        class="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0 shadow-sm"
      ></span>
      <span>First to 20 points becomes the Master Storyteller!</span>
    </li>
  </ul>
</div>
