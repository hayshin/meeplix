<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { storage, api } from "$lib/utils";
  import { Play, Users, GamepadIcon } from "lucide-svelte";

  let nickname = $state("");
  let isLoading = $state(false);
  let error = $state("");

  onMount(() => {
    // Загружаем сохраненный никнейм
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
    }
  });

  const createGame = async () => {
    if (!nickname.trim()) {
      error = "Пожалуйста, введите никнейм";
      return;
    }

    if (nickname.trim().length < 2) {
      error = "Никнейм должен содержать минимум 2 символа";
      return;
    }

    isLoading = true;
    error = "";

    try {
      // Сохраняем никнейм
      storage.saveNickname(nickname.trim());

      // Создаем игру
      const { data: gameId, error } = await api.game.create.post();

      if (gameId) {
        storage.saveLastGameId(gameId);
        goto(`/game/${gameId}`);
      }
    } catch (err) {
      error = "Ошибка подключения к серверу";
    } finally {
      isLoading = false;
    }
  };

  const joinByGameId = () => {
    if (!nickname.trim()) {
      error = "Пожалуйста, введите никнейм";
      return;
    }

    const gameId = prompt("Введите ID игры:");
    if (gameId) {
      storage.saveNickname(nickname.trim());
      goto(`/game/${gameId}`);
    }
  };
</script>

<svelte:head>
  <title>Имаджинариум - Главная</title>
  <meta name="description" content="Веб-версия настольной игры Имаджинариум" />
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4"
>
  <div class="max-w-md w-full">
    <!-- Заголовок -->
    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-3 mb-4">
        <GamepadIcon size={40} class="text-white" />
      </div>
      <a
        href="/"
        class="text-4xl font-bold text-white mb-2 hover:text-blue-100 transition-colors"
        >Имаджинариум</a
      >
      <p class="text-blue-100 text-lg">Веб-версия популярной настольной игры</p>
    </div>

    <!-- Основная форма -->
    <div class="bg-white rounded-2xl shadow-xl p-6">
      <div class="mb-6">
        <label
          for="nickname"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Ваш никнейм
        </label>
        <input
          id="nickname"
          type="text"
          bind:value={nickname}
          placeholder="Введите ваш никнейм..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          class:border-red-500={error}
          disabled={isLoading}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              createGame();
            }
          }}
        />
        {#if error}
          <p class="mt-2 text-sm text-red-600">{error}</p>
        {/if}
      </div>

      <!-- Кнопки действий -->
      <div class="space-y-3">
        <button
          onclick={createGame}
          disabled={isLoading || !nickname.trim()}
          class="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <div
              class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            ></div>
            Создание игры...
          {:else}
            <Play size={20} />
            Создать игру
          {/if}
        </button>

        <button
          onclick={joinByGameId}
          disabled={isLoading || !nickname.trim()}
          class="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users size={20} />
          Присоединиться к игре
        </button>
      </div>

      <!-- Информация об игре -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="font-medium text-gray-900 mb-2">Как играть:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Минимум 3 игрока для начала игры</li>
          <li>• Ведущий выбирает карту и дает ассоциацию</li>
          <li>• Остальные выбирают подходящие карты</li>
          <li>• Все голосуют за карту ведущего</li>
          <li>• Первый до 20 очков побеждает!</li>
        </ul>
      </div>
    </div>
  </div>
</div>
