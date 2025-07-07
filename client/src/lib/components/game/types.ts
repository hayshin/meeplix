import type { GameState } from "$lib/stores/game/types";
import type { Player } from "$shared/models/player";
import type { PublicCard } from "$shared/models/public_card";
import type { Vote } from "$shared/models/vote";

export interface GameInfo {
  roomId: string;
  gameState: GameState;
  gamePhase: string;
  isGameFinished: boolean;
  winner: Player | null;
}

export interface PlayerInfo {
  nickname: string;
  isCurrentPlayerLeader: boolean;
  currentLeader: Player | null;
  players: Player[];
  canStartGame: boolean;
  allPlayersReady: boolean;
}

export interface GameContent {
  association: string;
  associationInput: string;
  leaderCard: PublicCard | null;
  currentPlayerHand: PublicCard[];
  votingCards: PublicCard[];
  votedPairs: Vote[];
}

export interface CardSelection {
  selectedCardId: string | null;
  selectedVoteCardId: string | null;
  enlargedCardId: string | null;
}

export interface ModalState {
  showNicknameModal: boolean;
}

export interface GameActions {
  onNicknameChange: (value: string) => void;
  onNicknameSubmit: () => void;
  onLeaveGame: () => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onConnectToGame: () => void;
}

export interface GameplayActions {
  onAssociationChange: (value: string) => void;
  onSubmitLeaderChoice: () => void;
  onSubmitPlayerCard: () => void;
  onSubmitVote: () => void;
  onStartNextRound: () => void;
}

export interface CardActions {
  onCardSelect: (cardId: string) => void;
  onCardEnlarge: (cardId: string | null) => void;
  onVoteCardSelect: (cardId: string) => void;
}

export interface GameLayoutProps {
  gameInfo: GameInfo;
  playerInfo: PlayerInfo;
  gameContent: GameContent;
  cardSelection: CardSelection;
  modalState: ModalState;
  gameActions: GameActions;
  gameplayActions: GameplayActions;
  cardActions: CardActions;
}
