<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { storage } from "$lib/utils";
  import {
    gameState,
    gameActions,
    gamePhase,
    currentPlayerHand,
    isCurrentPlayerLeader,
    canStartGame,
    allPlayersReady,
    cardsForVoting,
  } from "$lib/stores/game";
  import GameLayout from "$lib/components/game/game-layout.svelte";

  const roomId = $page.params.id;
  let nickname = $state("");
  let showNicknameModal = $state(false);
  let associationInput = $state("");
  let selectedCardId = $state<string | null>(null);
  let selectedVoteCardId = $state<string | null>(null);
  let enlargedCardId = $state<string | null>(null);

  $effect(() => {
    console.log(roomId);
    gameActions.setRoomId(roomId);
    const savedNickname = storage.getNickname();
    if (savedNickname) {
      nickname = savedNickname;
      connectToGame();
    } else {
      showNicknameModal = true;
    }
  });

  const connectToGame = async () => {
    if (!nickname.trim()) return;

    storage.saveNickname(nickname.trim());
    gameActions.joinRoom(roomId, nickname.trim());
    showNicknameModal = false;
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) return;

    await connectToGame();
  };

  const startGame = async () => {
    gameActions.startGame();
  };

  const toggleReady = async () => {
    gameActions.sendReady();
  };

  const submitLeaderChoice = async () => {
    if (!selectedCardId || !associationInput.trim()) return;

    const selectedCard = $currentPlayerHand.get(selectedCardId);
    if (selectedCard) {
      gameActions.leaderSelectsCard(selectedCard, associationInput.trim());
      selectedCardId = null;
      associationInput = "";
    }
  };

  const submitPlayerCard = async () => {
    if (!selectedCardId) return;

    const selectedCard = $currentPlayerHand.get(selectedCardId);
    if (selectedCard) {
      gameActions.playerSubmitsCard(selectedCard);
      selectedCardId = null;
    }
  };

  const submitVote = async () => {
    if (!selectedVoteCardId) return;

    const selectedCard = $cardsForVoting.get(selectedVoteCardId);
    if (selectedCard) {
      gameActions.playerVotes(selectedCard);
      selectedVoteCardId = null;
    }
  };

  const leaveGame = async () => {
    gameActions.disconnect();
    goto("/");
  };

  const getVotingCards = () => {
    return $cardsForVoting.toArray() || [];
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
    gameActions.startNextRound();
  };

  // Derived values for the components
  let currentLeader = $derived(
    $gameState.roomState?.players.find(
      (p) => p.id === $gameState.roomState?.leaderId,
    ) || null,
  );
  let association = $derived($gameState.roomState?.currentDescription || "");
  let votingCards = $derived(getVotingCards());
  let playerHandCards = $derived($currentPlayerHand.toArray());
  let leaderCard = $derived(
    $gameState.roomState
      ? (() => {
          try {
            return $gameState.roomState.getSubmittedLeaderCard();
          } catch {
            return null;
          }
        })()
      : null,
  );
  let votedPairs = $derived($gameState.roomState?.votedPairs?.toArray() || []);
  let players = $derived($gameState.roomState?.players?.toArray() || []);
  let isGameFinished = $derived(
    $gameState.roomState?.isGameFinished() || false,
  );
  let winner = $derived($gameState.roomState?.getWinner() || null);
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
  gameState={$gameState}
  gamePhase={$gamePhase}
  {showNicknameModal}
  {nickname}
  isCurrentPlayerLeader={$isCurrentPlayerLeader}
  canStartGame={$canStartGame}
  allPlayersReady={$allPlayersReady}
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
