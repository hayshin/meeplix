# Game Components - Store-Based Architecture

This document explains how the game components have been refactored to use Svelte 5 stores instead of prop drilling.

## Overview

The game components now use a centralized store system that leverages Svelte 5's runes (`$state`, `$derived`, `$effect`) for reactive state management. This eliminates the need for extensive prop drilling and makes components more maintainable.

## Key Benefits

1. **Reduced Prop Drilling**: Components no longer need dozens of props passed down from parent to child
2. **Reactive by Default**: All store state is automatically reactive using Svelte 5 runes
3. **Centralized State**: All game state is managed in one place
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Easier Testing**: Components can be tested in isolation with the store

## Architecture

### Store Structure

```
src/lib/stores/game/
├── index.ts              # Main exports and composables
├── store.svelte.ts       # Main GameStore class
├── types.ts              # TypeScript interfaces
├── actions.svelte.ts     # Game action handlers
├── connection.svelte.ts  # WebSocket connection management
├── helpers.svelte.ts     # Helper functions
└── message-handlers.svelte.ts  # Server message handlers
```

### Main Store Class

The `GameStore` class uses Svelte 5 runes for reactive state:

```typescript
export class GameStore {
  // Core reactive state
  private _state = $state<GameState>(createInitialGameState());
  
  // Derived reactive values
  readonly isCurrentPlayerLeader = $derived(
    this._state.currentPlayer?.id === this._state.leaderId
  );
  
  readonly canStartGame = $derived(
    this._state.players.length >= 3 && this._state.players.length <= 8
  );
  
  // Actions
  startGame = () => { /* implementation */ };
  setReady = () => { /* implementation */ };
}
```

## Usage Patterns

### In Components

Instead of accepting numerous props, components now import and use the store:

```svelte
<!-- Before: Heavy prop drilling -->
<script lang="ts">
  interface Props {
    roomId: string;
    gameState: GameState;
    gamePhase: string;
    isCurrentPlayerLeader: boolean;
    // ... 20+ more props
  }
  
  let { roomId, gameState, gamePhase, /* ... */ }: Props = $props();
</script>

<!-- After: Clean store usage -->
<script lang="ts">
  import { useGameStore } from "$lib/stores/game.svelte";
  
  const gameStore = useGameStore();
  
  // Reactive references
  const state = gameStore.state;
  const isCurrentPlayerLeader = gameStore.isCurrentPlayerLeader;
  const canStartGame = gameStore.canStartGame;
  
  // Actions
  const startGame = gameStore.startGame;
  const setReady = gameStore.setReady;
</script>
```

### Composable Functions

The store provides composable functions for different use cases:

```typescript
// Full store access
const gameStore = useGameStore();

// State only
const state = useGameState();

// Actions only
const actions = useGameActions();

// Helpers only
const helpers = useGameHelpers();
```

## Component Examples

### GameLayout Component

**Before** (60+ props):
```svelte
<GameLayout
  {roomId}
  {gameState}
  {gamePhase}
  {isCurrentPlayerLeader}
  {canStartGame}
  {allPlayersReady}
  {players}
  {votingCards}
  {currentPlayerHand}
  {onStartGame}
  {onSetReady}
  {onSubmitCard}
  {onSubmitVote}
  // ... 40+ more props
/>
```

**After** (minimal props):
```svelte
<GameLayout
  {showNicknameModal}
  {nickname}
  {selectedCardId}
  {associationInput}
  {onNicknameChange}
  {onCardSelect}
  {onConnectToGame}
/>
```

### GameHeader Component

**Before**:
```svelte
<GameHeader
  {roomId}
  {gameState}
  {canStartGame}
  {allPlayersReady}
  {isCurrentPlayerLeader}
  {onLeaveGame}
  {onToggleReady}
  {onStartGame}
/>
```

**After**:
```svelte
<GameHeader />
```

## State Management

### Reactive State

All state is reactive using Svelte 5 runes:

```typescript
// State declaration
private _state = $state<GameState>(createInitialGameState());

// Derived values
readonly isGameFinished = $derived(this._state.phase === "game_finished");
readonly currentLeader = $derived(
  this._state.players.find(p => p.id === this._state.leaderId) || null
);
```

### Effects

Use `$effect` for side effects:

```typescript
// In components
$effect(() => {
  console.log("Game phase changed:", state.phase);
});
```

## Best Practices

### 1. Keep UI State Local

Only game-related state should be in the store. UI-specific state like modal visibility should remain local:

```svelte
<script lang="ts">
  // Local UI state
  let showNicknameModal = $state(false);
  let selectedCardId = $state<string | null>(null);
  
  // Game state from store
  const gameStore = useGameStore();
</script>
```

### 2. Use Proper Separation

- **Store**: Game state, actions, derived values
- **Components**: UI rendering, local UI state, event handling
- **Props**: Only for component configuration and callbacks

### 3. Leverage Composables

Use the provided composable functions for cleaner code:

```typescript
// Instead of accessing store directly
const gameStore = useGameStore();
const canStart = gameStore.canStartGame;
const players = gameStore.state.players;

// Use specific composables
const { canStartGame } = useGameStore();
const { players } = useGameState();
```

## Migration Guide

### Step 1: Identify Store-Managed State

Look for props that represent:
- Game state (phase, players, cards, etc.)
- Derived values (isLeader, canStart, etc.)
- Actions (startGame, setReady, etc.)

### Step 2: Remove Props

Remove these props from component interfaces and prop destructuring.

### Step 3: Add Store Usage

```svelte
<script lang="ts">
  import { useGameStore } from "$lib/stores/game.svelte";
  
  const gameStore = useGameStore();
  const state = gameStore.state;
  // ... other reactive references
</script>
```

### Step 4: Update Template

Replace prop references with store references:

```svelte
<!-- Before -->
{#if gamePhase === "voting"}

<!-- After -->
{#if state.phase === "voting"}
```

### Step 5: Update Parent Components

Remove the props being passed down:

```svelte
<!-- Before -->
<GameComponent {prop1} {prop2} {prop3} />

<!-- After -->
<GameComponent />
```

## Testing

Components using stores can be tested by mocking the store:

```typescript
// Mock the store
const mockGameStore = {
  state: $state(mockGameState),
  isCurrentPlayerLeader: $derived(true),
  startGame: vi.fn(),
  // ... other mocked methods
};

// Test component with mocked store
```

## Performance Considerations

- Derived values are computed only when dependencies change
- Effects run only when their dependencies change
- Components re-render only when used state changes
- Store state is shared across all components (singleton pattern)

## Future Enhancements

1. **Persistence**: Add state persistence to localStorage
2. **Undo/Redo**: Implement command pattern for game actions
3. **Multiplayer Sync**: Enhanced real-time synchronization
4. **State Machines**: More complex state transition logic