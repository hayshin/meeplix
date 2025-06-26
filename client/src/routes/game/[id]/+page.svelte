<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import {
    gameState,
    gameActions,
    isCurrentPlayerLeader,
    gamePhase,
  } from "$lib/stores/game";
  import { storage, api } from "$lib/utils";

  import PlayersList from "$lib/components/PlayersList.svelte";
  import StatusBar from "$lib/components/StatusBar.svelte";
  import GameCard from "$lib/components/GameCard.svelte";
  import ScoreTable from "$lib/components/ScoreTable.svelte";

  import { Users, Home, Play, Send } from "lucide-svelte";

  const gameId = $page.params.id;
  let nickname = "";
  let showNicknameModal = $state(false);
  let associationInput = $state("");
  let selectedCardId = $state("");
  let selectedVoteCardId = $state("");
  let enlargedCardId = $state("");

  onMount(async () => {
    // Проверяем, есть ли сохраненный никнейм
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      connectToGame();
    } else {
      showNicknameModal = true;
    }
  });

  onDestroy(() => {
    gameActions.disconnect();
  });

  const connectToGame = async () => {
    try {
      // Сначала проверяем, существует ли игра
      const { data, status } = await api.game({ id: gameId }).get();
      if (status == 404) {
        alert("Игра не найдена");
        goto("/");
        return;
      }

      // Подключаемся к игре через WebSocket
      gameActions.connectToGame(gameId, nickname);
    } catch (error) {
      console.error("Error connecting to game:", error);
      alert("Ошибка подключения к игре");
      goto("/");
    }
  };

  const handleNicknameSubmit = () => {
    if (nickname.trim().length >= 2) {
      storage.saveNickname(nickname.trim());
      showNicknameModal = false;
      connectToGame();
    }
  };

  const startGame = () => {
    gameActions.startGame();
  };

  const submitLeaderChoice = () => {
    if (selectedCardId && associationInput.trim()) {
      gameActions.leaderSelectsCard(selectedCardId, associationInput.trim());
      selectedCardId = "";
      associationInput = "";
    }
  };

  const submitPlayerCard = () => {
    if (selectedCardId) {
      gameActions.playerSubmitsCard(selectedCardId);
      selectedCardId = "";
    }
  };

  const submitVote = () => {
    if (selectedVoteCardId) {
      gameActions.playerVotes(selectedVoteCardId);
      selectedVoteCardId = "";
      enlargedCardId = "";
    }
  };

  const leaveGame = () => {
    gameActions.disconnect();
    goto("/");
  };

  // Получаем карты для голосования (все выбранные карты + карта ведущего)
  const getVotingCards = () => {
    if (!$gameState.session || $gamePhase !== "voting") return [];

    const roundData = $gameState.session.roundData;
    const allCards = [...roundData.playerCards.map((pc) => pc.card)];

    if (roundData.leaderCard) {
      allCards.push(roundData.leaderCard);
    }

    // Перемешиваем карты
    return allCards.sort(() => Math.random() - 0.5);
  };

  const votingCards = getVotingCards();
  const canStartGame = $derived(
    $gameState.session && $gameState.session.players.length >= 3
  );
</script>

<svelte:head>
  <title>Имаджинариум - Игра {gameId}</title>
</svelte:head>

<!-- Модальное окно для ввода никнейма -->
{#if showNicknameModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
  >
    <div class="w-full max-w-sm rounded-lg bg-white p-6">
      <h2 class="mb-4 text-xl font-bold">Введите ваш никнейм</h2>
      <input
        type="text"
        bind:value={nickname}
        placeholder="Ваш никнейм..."
        class="mb-4 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
        onkeydown={(e) => {
          if (e.key === "Enter") {
            handleNicknameSubmit();
          }
        }}
      />
      <div class="flex gap-2">
        <button
          onclick={handleNicknameSubmit}
          disabled={nickname.trim().length < 2}
          class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Присоединиться
        </button>
        <button
          onclick={() => goto("/")}
          class="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gray-100">
  <!-- Верхняя панель -->
  <header class="border-b bg-white p-4 shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-gray-900">Имаджинариум</h1>
        <span class="text-sm text-gray-500">ID: {gameId}</span>
      </div>

      <div class="flex items-center gap-2">
        {#if $gameState.session?.status === "waiting" && canStartGame}
          <button
            onclick={startGame}
            class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Play size={16} />
            Начать игру
          </button>
        {/if}

        <button
          onclick={leaveGame}
          class="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          <Home size={16} />
          Выйти
        </button>
      </div>
    </div>
  </header>

  {#if $gameState.session}
    <div class="mx-auto max-w-7xl p-4">
      <!-- Статусная строка -->
      <div class="mb-6">
        <StatusBar
          session={$gameState.session}
          currentPlayer={$gameState.currentPlayer}
          isLeader={$isCurrentPlayerLeader}
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- Левая колонка: Список игроков -->
        <div class="lg:col-span-1">
          <PlayersList
            players={$gameState.session.players}
            leaderId={$gameState.session.leaderPlayerId}
            currentPlayerId={$gameState.currentPlayer?.id}
          />
        </div>

        <!-- Основная область игры -->
        <div class="space-y-6 lg:col-span-3">
          <!-- Область выбора ассоциации (только для ведущего в фазе leader_turn) -->
          {#if $isCurrentPlayerLeader && $gamePhase === "leader_turn"}
            <div class="rounded-lg bg-white p-6 shadow-md">
              <h3 class="mb-4 text-lg font-semibold">
                Выберите карту и введите ассоциацию
              </h3>

              <div class="mb-4">
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Ассоциация:
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    bind:value={associationInput}
                    placeholder="Введите ассоциацию..."
                    class="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onclick={submitLeaderChoice}
                    disabled={!selectedCardId || !associationInput.trim()}
                    class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    <Send size={16} />
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          {/if}

          <!-- Область выбора карты (не для ведущего в фазе player_selection) -->
          {#if !$isCurrentPlayerLeader && $gamePhase === "player_selection"}
            <div class="rounded-lg bg-white p-6 shadow-md">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold">Выберите подходящую карту</h3>
                <button
                  onclick={submitPlayerCard}
                  disabled={!selectedCardId}
                  class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  <Send size={16} />
                  Выбрать карту
                </button>
              </div>
            </div>
          {/if}

          <!-- Область голосования -->
          {#if $gamePhase === "voting" && !$isCurrentPlayerLeader}
            <div class="rounded-lg bg-white p-6 shadow-md">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold">Голосование</h3>
                <button
                  onclick={submitVote}
                  disabled={!selectedVoteCardId}
                  class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  Проголосовать
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                {#each votingCards as card (card.id)}
                  <GameCard
                    {card}
                    isSelected={selectedVoteCardId === card.id}
                    isEnlarged={enlargedCardId === card.id}
                    onclick={() => {
                      if (enlargedCardId === card.id) {
                        enlargedCardId = "";
                      } else {
                        enlargedCardId = card.id;
                        selectedVoteCardId = card.id;
                      }
                    }}
                    ondoubleclick={() => {
                      selectedVoteCardId = card.id;
                      submitVote();
                    }}
                  />
                {/each}
              </div>
            </div>
          {:else if $gamePhase === "voting"}
            <div class="rounded-lg bg-white p-6 shadow-md">
              <h3 class="mb-4 text-lg font-semibold">Карты на столе</h3>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                {#each votingCards as card (card.id)}
                  <GameCard {card} isClickable={false} />
                {/each}
              </div>
            </div>
          {/if}

          <!-- Карты игрока -->
          {#if $gameState.currentPlayer?.cards && $gameState.currentPlayer.cards.length > 0}
            <div class="rounded-lg bg-white p-6 shadow-md">
              <h3 class="mb-4 text-lg font-semibold">Ваши карты</h3>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-6">
                {#each $gameState.currentPlayer.cards as card (card.id)}
                  <GameCard
                    {card}
                    isSelected={selectedCardId === card.id}
                    onclick={() => {
                      if (
                        $gamePhase === "leader_turn" ||
                        $gamePhase === "player_selection"
                      ) {
                        selectedCardId =
                          selectedCardId === card.id ? "" : card.id;
                      }
                    }}
                  />
                {/each}
              </div>
            </div>
          {/if}

          <!-- Таблица результатов -->
          {#if $gameState.session.players.length > 0}
            <ScoreTable players={$gameState.session.players} />
          {/if}
        </div>
      </div>
    </div>
  {:else if $gameState.error}
    <div class="mx-auto max-w-2xl p-4">
      <div class="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 class="mb-2 text-lg font-semibold text-red-800">Ошибка</h2>
        <p class="text-red-700">{$gameState.error}</p>
        <button
          onclick={() => goto("/")}
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  {:else}
    <div class="mx-auto max-w-2xl p-4 text-center">
      <div
        class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
      ></div>
      <p class="text-gray-600">Подключение к игре...</p>
    </div>
  {/if}
</div>
