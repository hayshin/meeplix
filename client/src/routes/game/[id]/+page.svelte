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
  let associationInput = $state("");
  let selectedCardId = $state<string | null>(null);
  let selectedVoteCardId = $state<string | null>(null);
  let enlargedCardId = $state<string | null>(null);
  let initialized = $state(false);

  $effect(() => {
    if (initialized) return;
    initialized = true;
    console.log(roomId);
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
