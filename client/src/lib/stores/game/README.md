# Game Store Documentation

This document explains how to use the refactored Svelte stores for the game state management.

## Overview

The game store has been refactored from Svelte 5 runes to traditional Svelte stores for better compatibility and simpler usage patterns. The store follows the **Keep It Simple, Stupid (KISS)** principle while maintaining all functionality.

## Architecture

The store is split into several managers:
- **GameStore**: Main store class that orchestrates everything
- **ConnectionManager**: Handles WebSocket connections
- **MessageHandlersManager**: Processes server messages
- **GameActionsManager**: Handles game actions
- **GameHelpersManager**: Provides helper functions and computed values

## Usage Patterns

### 1. Using Composables (Recommended)

```typescript
import { useGameStore, useGameState, useGameActions } from '$lib/stores/game';

// Main composable - gives you everything
const gameStore = useGameStore();

// Individual composables for specific needs
const state = useGameState();
const actions = useGameActions();
```

### 2. Direct Store Imports

```typescript
import { 
  gameState, 
  isGameStarted, 
  isCurrentPlayerLeader,
  currentLeader,
  readyPlayersCount 
} from '$lib/stores/game';
```

### 3. In Svelte Components

```svelte
<script lang="ts">
  import { useGameStore } from '$lib/stores/game';
  
  const gameStore = useGameStore();
  
  // Reactive statements
  $: playerCount = $gameStore.readyPlayersCount;
  $: isConnected = $gameStore.state.isConnected;
  $: currentPhase = $gameStore.state.phase;
</script>

<!-- Template -->
<div>
  <p>Connected: {$gameStore.state.isConnected}</p>
  <p>Phase: {$gameStore.state.phase}</p>
  <p>Players: {$gameStore.readyPlayersCount} / {$gameStore.totalPlayersCount}</p>
  
  <button on:click={() => gameStore.actions.createRoom('PlayerName')}>
    Create Room
  </button>
</div>
```

## API Reference

### Main Composable: `useGameStore()`

Returns an object with:

#### Core State
- `state`: Writable store containing the complete game state
- `isGameStarted`: Derived store - boolean indicating if game has started
- `isCurrentPlayerLeader`: Derived store - boolean indicating if current player is leader
- `currentLeader`: Derived store - the current leader player object
- `canStartGame`: Derived store - boolean indicating if game can be started
- `allPlayersReady`: Derived store - boolean indicating if all players are ready
- `isGameFinished`: Derived store - boolean indicating if game is finished
- `readyPlayersCount`: Derived store - number of ready players
- `totalPlayersCount`: Derived store - total number of players

#### Actions
All actions are grouped under `actions`:

```typescript
gameStore.actions.createRoom(username: string)
gameStore.actions.joinRoom(roomId: string, username: string)
gameStore.actions.reconnect(roomId: string, playerId: string, username: string)
gameStore.actions.disconnect()
gameStore.actions.startGame()
gameStore.actions.setReady()
gameStore.actions.submitLeaderCard(cardId: string, description: string)
gameStore.actions.submitPlayerCard(cardId: string)
gameStore.actions.submitVote(cardId: string)
gameStore.actions.startNextRound()
gameStore.actions.clearError()
```

#### Helpers
All helpers are grouped under `helpers`:

```typescript
// Card helpers
gameStore.helpers.getCardById(cardId: string)
gameStore.helpers.getVotingCardById(cardId: string)
gameStore.helpers.hasCardInHand(cardId: string)
gameStore.helpers.getHandSize()
gameStore.helpers.getVotingCardsCount()

// Player helpers
gameStore.helpers.getPlayerById(playerId: string)
gameStore.helpers.getPlayerStatus(playerId: string)
gameStore.helpers.getPlayerNickname(playerId: string)
gameStore.helpers.getPlayerScore(playerId: string)
gameStore.helpers.getReadyPlayers()
gameStore.helpers.getOnlinePlayers()
gameStore.helpers.getWinner()

// Game state helpers
gameStore.helpers.canSubmitCard()
gameStore.helpers.canVote()
gameStore.helpers.canLeaderSubmitCard()
gameStore.helpers.canPlayerAct()

// UI state helpers
gameStore.helpers.shouldShowReadyButton()
gameStore.helpers.shouldShowStartGameButton()
gameStore.helpers.shouldShowLeaderCardSubmission()
gameStore.helpers.shouldShowPlayerCardSubmission()
gameStore.helpers.shouldShowVoting()
gameStore.helpers.shouldShowResults()
gameStore.helpers.shouldShowNextRoundButton()

// Phase helpers
gameStore.helpers.isJoiningPhase()
gameStore.helpers.isLeaderSubmittingPhase()
gameStore.helpers.isPlayersSubmittingPhase()
gameStore.helpers.isVotingPhase()
gameStore.helpers.isResultsPhase()
```

### Individual Composables

#### `useGameState()`
Returns just the state store:
```typescript
const state = useGameState();
// Use: $state.phase, $state.players, etc.
```

#### `useGameActions()`
Returns the game store instance with all actions:
```typescript
const actions = useGameActions();
// Use: actions.createRoom(), actions.joinRoom(), etc.
```

#### `useGameHelpers()`
Returns the game store instance with all helpers:
```typescript
const helpers = useGameHelpers();
// Use: helpers.getCardById(), helpers.canVote(), etc.
```

## Common Patterns

### 1. Reactive UI Updates

```svelte
<script lang="ts">
  import { useGameStore } from '$lib/stores/game';
  
  const gameStore = useGameStore();
  
  // Reactive statements automatically update when stores change
  $: canStartGame = $gameStore.helpers.shouldShowStartGameButton();
  $: playersList = $gameStore.state.players;
  $: connectionStatus = $gameStore.state.isConnected ? 'Connected' : 'Disconnected';
</script>

<div>
  <p>Status: {connectionStatus}</p>
  
  {#if canStartGame}
    <button on:click={() => gameStore.actions.startGame()}>
      Start Game
    </button>
  {/if}
  
  {#each playersList as player}
    <div>{player.username} - {player.status}</div>
  {/each}
</div>
```

### 2. Conditional Actions

```svelte
<script lang="ts">
  import { useGameStore } from '$lib/stores/game';
  
  const gameStore = useGameStore();
  
  function handleCardSubmission(cardId: string) {
    if ($gameStore.helpers.canSubmitCard()) {
      gameStore.actions.submitPlayerCard(cardId);
    }
  }
  
  function handleVote(cardId: string) {
    if ($gameStore.helpers.canVote()) {
      gameStore.actions.submitVote(cardId);
    }
  }
</script>
```

### 3. Manual Store Subscription

```typescript
import { onMount } from 'svelte';
import { useGameState } from '$lib/stores/game';

onMount(() => {
  const state = useGameState();
  
  const unsubscribe = state.subscribe((gameState) => {
    console.log('Game state changed:', gameState);
    // Handle state changes
  });
  
  return unsubscribe; // Cleanup on component destroy
});
```

## Migration from Runes

If you're migrating from the old rune-based approach:

### Old (Runes)
```typescript
// Direct state access
const isLeader = gameStore.isCurrentPlayerLeader;
const players = gameStore.state.players;

// Direct action calls
gameStore.createRoom('username');
```

### New (Stores)
```typescript
// Store subscriptions with $ syntax
const gameStore = useGameStore();
$: isLeader = $gameStore.isCurrentPlayerLeader;
$: players = $gameStore.state.players;

// Grouped actions
gameStore.actions.createRoom('username');
```

## Best Practices

1. **Use the main composable** (`useGameStore()`) for most cases
2. **Use $ syntax** for reactive values in templates
3. **Group related functionality** using the structured API (actions, helpers)
4. **Subscribe to specific derived stores** for better performance when you only need specific computed values
5. **Use reactive statements** (`$:`) for computed values that depend on store state
6. **Handle cleanup** when manually subscribing to stores

## Example Component

See `GameStoreExample.svelte` for a complete example demonstrating all usage patterns.

## Types

All TypeScript types are exported from the main index file:

```typescript
import type { 
  GameState, 
  GamePhase, 
  GameActions, 
  GameHelpers 
} from '$lib/stores/game';
```

This refactored approach provides a clean, type-safe, and reactive way to manage game state while maintaining simplicity and following Svelte best practices.