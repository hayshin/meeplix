<script lang="ts">
  import JoiningPhase from "./phases/joining-phase.svelte";
  import LeaderChoosingPhase from "./phases/leader-choosing-phase.svelte";
  import PlayersChoosingPhase from "./phases/players-choosing-phase.svelte";
  import VotingPhase from "./phases/voting-phase.svelte";
  import EndVotePhase from "./phases/end-vote-phase.svelte";
  import PlayerHand from "./player-hand.svelte";
  import type { CardEntity } from "$types/card";
  import type { PlayerEntity } from "$types/player";
  import type { VoteEntity } from "$types/vote";

  interface GamePhasesProps {
    gamePhase: string;
    // Game state props
    allPlayersReady: boolean;
    canStartGame: boolean;
    isCurrentPlayerLeader: boolean;
    currentLeader: PlayerEntity | null;
    association: string;
    // Card selection props
    selectedCardId: string | null;
    selectedVoteCardId: string | null;
    enlargedCardId: string | null;
    // Input handling
    associationInput: string;
    onAssociationChange: (value: string) => void;
    // Action handlers
    onSubmitLeaderChoice: () => void;
    onSubmitPlayerCard: () => void;
    onSubmitVote: () => void;
    onStartNextRound: () => void;
    // Card interactions
    onCardSelect: (cardId: string) => void;
    onCardEnlarge: (cardId: string | null) => void;
    onVoteCardSelect: (cardId: string) => void;
    // Game data
    votingCards: CardEntity[];
    currentPlayerHand: CardEntity[];
    // End vote phase props
    leaderCard: CardEntity | null;
    votedPairs: VoteEntity[];
    players: PlayerEntity[];
    isGameFinished: boolean;
    winner: PlayerEntity | null;
  }

  let {
    gamePhase,
    allPlayersReady,
    canStartGame,
    isCurrentPlayerLeader,
    currentLeader,
    association,
    selectedCardId,
    selectedVoteCardId,
    enlargedCardId,
    associationInput,
    onAssociationChange,
    onSubmitLeaderChoice,
    onSubmitPlayerCard,
    onSubmitVote,
    onStartNextRound,
    onCardSelect,
    onCardEnlarge,
    onVoteCardSelect,
    votingCards,
    currentPlayerHand,
    leaderCard,
    votedPairs,
    players,
    isGameFinished,
    winner,
  }: GamePhasesProps = $props();
</script>

<div class="space-y-8">
  <!-- Main Game Phase Display -->
  {#if gamePhase === "joining"}
    <JoiningPhase {allPlayersReady} {canStartGame} />
  {:else if gamePhase === "leader_choosing"}
    <LeaderChoosingPhase
      {isCurrentPlayerLeader}
      {currentLeader}
      {associationInput}
      {onAssociationChange}
      {onSubmitLeaderChoice}
    />
  {:else if gamePhase === "players_choosing"}
    <PlayersChoosingPhase
      {isCurrentPlayerLeader}
      {currentLeader}
      {association}
      {selectedCardId}
      {onSubmitPlayerCard}
    />
  {:else if gamePhase === "voting"}
    <VotingPhase
      {isCurrentPlayerLeader}
      {votingCards}
      {selectedVoteCardId}
      onCardSelect={onVoteCardSelect}
      {onSubmitVote}
      {enlargedCardId}
      {onCardEnlarge}
    />
  {:else if gamePhase === "results"}
    <EndVotePhase
      {leaderCard}
      {association}
      {votedPairs}
      {players}
      {isGameFinished}
      {winner}
      {isCurrentPlayerLeader}
      {onStartNextRound}
    />
  {/if}

  <!-- Player Hand (shown when relevant) -->
  {#if currentPlayerHand.length > 0}
    <PlayerHand
      cards={currentPlayerHand}
      {selectedCardId}
      {enlargedCardId}
      {onCardSelect}
      {onCardEnlarge}
    />
  {/if}
</div>
