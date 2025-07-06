<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import { useGameStore } from "$lib/stores/game";
  import GameLayout from "$lib/components/game/game-layout.svelte";

  const game = useGameStore();
  const roomId = $page.params.id;
  let nickname = $state("");
  let showNicknameModal = $state(false);
  let showGameSessionsModal = $state(false);
  let associationInput = $state("");
  let selectedCardId = $state<string | null>(null);
  let selectedVoteCardId = $state<string | null>(null);
  let enlargedCardId = $state<string | null>(null);
  let initialized = $state(false);

  $effect(() => {
    if (initialized) return;
    initialized = true;
    console.log("Game page initialized for room:", roomId);

    // Try to reconnect to existing session first
    const gameSession = storage.getGameSession(roomId);
    if (gameSession) {
      console.log(
        "Found existing game session, attempting reconnect:",
        gameSession,
      );
      nickname = gameSession.playerName;
      attemptReconnect(gameSession);
      return;
    }

    // Check for other available game sessions
    const allSessions = storage.getAllGameSessions();
    if (allSessions.length > 0) {
      console.log("Found existing game sessions:", allSessions);
      showGameSessionsModal = true;
      return;
    }

    // Check for saved nickname for new connections
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      // Only connect if we don't already have a current player AND we're not already in this room
      if (
        !game.state.currentPlayer &&
        game.state.roomId !== roomId &&
        !game.state.isJoining
      ) {
        connectToGame();
      }
    } else {
      showNicknameModal = true;
    }
  });

  const attemptReconnect = async (gameSession: any) => {
    if (
      game.state.isConnecting ||
      game.state.isJoining ||
      (game.state.currentPlayer && game.state.roomId === roomId)
    ) {
      console.log("Already connecting or connected to this room");
      return;
    }

    console.log("Attempting to reconnect to game session:", gameSession);
    game.reconnect(
      gameSession.roomId,
      gameSession.playerId,
      gameSession.playerName,
    );
  };

  const connectToGame = async () => {
    if (!nickname.trim()) return;

    // Prevent multiple connection attempts
    if (
      game.state.isJoining ||
      game.state.isConnecting ||
      (game.state.currentPlayer && game.state.roomId === roomId)
    ) {
      console.log("Already connecting or connected to this room");
      return;
    }

    storage.saveNickname(nickname.trim());
    game.joinRoom(roomId, nickname.trim());
    showNicknameModal = false;
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) return;

    await connectToGame();
  };

  const startGame = async () => {
    game.startGame();
  };

  const toggleReady = async () => {
    game.setReady();
  };

  const submitLeaderChoice = async () => {
    if (!selectedCardId || !associationInput.trim()) return;

    game.submitLeaderCard(selectedCardId, associationInput.trim());
    selectedCardId = null;
    associationInput = "";
  };

  const submitPlayerCard = async () => {
    if (!selectedCardId) return;

    game.submitPlayerCard(selectedCardId);
    selectedCardId = null;
  };

  const submitVote = async () => {
    if (!selectedVoteCardId) return;

    game.submitVote(selectedVoteCardId);
    selectedVoteCardId = null;
  };

  const leaveGame = async () => {
    game.disconnect();
    goto("/");
  };

  const handleCardSelect = (cardId: string) => {
    selectedCardId = cardId;
  };

  const handleVoteCardSelect = (cardId: string) => {
    selectedVoteCardId = cardId;
  };

  const handleCardEnlarge = (cardId: string | null) => {
    enlargedCardId = cardId;
  };

  const handleAssociationChange = (value: string) => {
    associationInput = value;
  };

  const handleNicknameChange = (value: string) => {
    nickname = value;
  };

  const startNextRound = () => {
    game.startNextRound();
  };

  const handleSessionSelect = (session: any) => {
    console.log("Selected session:", session);
    if (session.roomId === roomId) {
      // Reconnect to the current room
      nickname = session.playerName;
      attemptReconnect(session);
    } else {
      // Navigate to the selected room
      goto(`/game/${session.roomId}`);
    }
    showGameSessionsModal = false;
  };

  const handleCreateNewSession = () => {
    showGameSessionsModal = false;
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      connectToGame();
    } else {
      showNicknameModal = true;
    }
  };

  const handleClearAllSessions = () => {
    storage.clearAllGameSessions();
    showGameSessionsModal = false;
    showNicknameModal = true;
  };

  const getAllGameSessions = () => {
    return storage.getAllGameSessions();
  };

  const formatLastActive = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Derived values for the components
  let currentLeader = $derived(game.currentLeader);
  let association = $derived(game.state.currentDescription);
  let votingCards = $derived(game.state.cardsForVoting);
  let playerHandCards = $derived(game.state.currentHand);
  let leaderCard = $derived(null); // Will be implemented later
  let votedPairs = $derived(game.state.votes);
  let players = $derived(game.state.players);
  let isGameFinished = $derived(game.isGameFinished);
  let winner = $derived(game.getWinner());
</script>

<svelte:head>
  <title>Narrari - Mystical Game Realm</title>
  <meta
    name="description"
    content="Embark on a magical journey where imagination meets artificial intelligence"
  />
</svelte:head>

<GameLayout
  {roomId}
  gameState={game.state}
  gamePhase={game.state.phase}
  {showNicknameModal}
  {nickname}
  isCurrentPlayerLeader={game.isCurrentPlayerLeader}
  canStartGame={game.canStartGame}
  allPlayersReady={game.allPlayersReady}
  {currentLeader}
  {association}
  {selectedCardId}
  {selectedVoteCardId}
  {enlargedCardId}
  {associationInput}
  {votingCards}
  currentPlayerHand={playerHandCards}
  {leaderCard}
  {votedPairs}
  {players}
  {isGameFinished}
  {winner}
  onNicknameChange={handleNicknameChange}
  onNicknameSubmit={handleNicknameSubmit}
  onLeaveGame={leaveGame}
  onToggleReady={toggleReady}
  onStartGame={startGame}
  onAssociationChange={handleAssociationChange}
  onSubmitLeaderChoice={submitLeaderChoice}
  onSubmitPlayerCard={submitPlayerCard}
  onSubmitVote={submitVote}
  onStartNextRound={startNextRound}
  onCardSelect={handleCardSelect}
  onCardEnlarge={handleCardEnlarge}
  onVoteCardSelect={handleVoteCardSelect}
  onConnectToGame={connectToGame}
/>

<!-- Game Sessions Modal -->
{#if showGameSessionsModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h2 class="text-xl font-bold mb-4">Existing Game Sessions</h2>
      <p class="text-gray-600 mb-4">
        You have existing game sessions. Would you like to reconnect to one or
        create a new session?
      </p>

      <div class="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {#each getAllGameSessions() as session (session.roomId)}
          <div
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            onclick={() => handleSessionSelect(session)}
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{session.playerName}</div>
                <div class="text-sm text-gray-500">Room: {session.roomId}</div>
                <div class="text-sm text-gray-500">
                  Phase: {session.gamePhase || "Unknown"}
                </div>
              </div>
              <div class="text-xs text-gray-400">
                {formatLastActive(session.lastActive)}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onclick={handleCreateNewSession}
        >
          Create New Session
        </button>
        <button
          class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          onclick={handleClearAllSessions}
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
{/if}
