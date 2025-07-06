# Game Store Usage Examples

This document shows how to use the new modular game store in your Svelte components.

## Basic Usage

### Using the composable approach (recommended)

```svelte
<script lang="ts">
  import { useGameStore } from "$lib/stores/game";

  const game = useGameStore();

  let nickname = $state("");
  let selectedCardId = $state<string | null>(null);
  let description = $state("");
</script>

<!-- Connection Status -->
{#if game.state.isConnecting}
  <div>Connecting...</div>
{:else if !game.state.isConnected}
  <div>Disconnected</div>
{/if}

<!-- Game Phase Display -->
<div>Current Phase: {game.state.phase}</div>
<div>Players: {game.totalPlayersCount} / Ready: {game.readyPlayersCount}</div>

<!-- Joining Phase -->
{#if game.isJoiningPhase()}
  <input bind:value={nickname} placeholder="Enter nickname" />
  <button onclick={() => game.joinRoom("room-id", nickname)}>
    Join Room
  </button>
  
  {#if game.shouldShowReadyButton()}
    <button onclick={game.setReady}>Ready</button>
  {/if}
  
  {#if game.shouldShowStartGameButton()}
    <button onclick={game.startGame}>Start Game</button>
  {/if}
{/if}

<!-- Leader Card Submission -->
{#if game.shouldShowLeaderCardSubmission()}
  <div>
    <h3>Choose a card and describe it:</h3>
    <input bind:value={description} placeholder="Description" />
    
    {#each game.state.currentHand as card}
      <button 
        onclick={() => selectedCardId = card.id}
        class:selected={selectedCardId === card.id}
      >
        {card.name}
      </button>
    {/each}
    
    <button 
      onclick={() => game.submitLeaderCard(selectedCardId!, description)}
      disabled={!selectedCardId || !description}
    >
      Submit Card
    </button>
  </div>
{/if}

<!-- Player Card Submission -->
{#if game.shouldShowPlayerCardSubmission()}
  <div>
    <h3>Choose a card that matches: "{game.state.currentDescription}"</h3>
    
    {#each game.state.currentHand as card}
      <button onclick={() => game.submitPlayerCard(card.id)}>
        {card.name}
      </button>
    {/each}
  </div>
{/if}

<!-- Voting Phase -->
{#if game.shouldShowVoting()}
  <div>
    <h3>Vote for the card that matches: "{game.state.currentDescription}"</h3>
    
    {#each game.state.cardsForVoting as card}
      <button onclick={() => game.submitVote(card.id)}>
        {card.name}
      </button>
    {/each}
  </div>
{/if}

<!-- Results Phase -->
{#if game.shouldShowResults()}
  <div>
    <h3>Results</h3>
    <p>Votes: {game.state.votes.length}</p>
    
    {#if game.shouldShowNextRoundButton()}
      <button onclick={game.startNextRound}>Next Round</button>
    {/if}
  </div>
{/if}

<!-- Game Finished -->
{#if game.isGameFinished}
  <div>
    <h3>Game Over!</h3>
    {#if game.getWinner()}
      <p>Winner: {game.getWinner()?.nickname}</p>
    {/if}
  </div>
{/if}

<!-- Error Display -->
{#if game.state.error}
  <div class="error">
    {game.state.error}
    <button onclick={game.clearError}>Clear</button>
  </div>
{/if}
```

### Using individual composables

```svelte
<script lang="ts">
  import { useGameState, useGameActions, useGameHelpers } from "$lib/stores/game";

  const state = useGameState();
  const actions = useGameActions();
  const helpers = useGameHelpers();

  // Use specific parts of the store
  $effect(() => {
    console.log("Game phase changed:", state.phase);
  });
</script>

<div>
  <h3>Players ({helpers.getReadyPlayers().length} ready)</h3>
  {#each state.players as player}
    <div class:ready={player.status === 'ready'}>
      {player.nickname} - {player.score} points
    </div>
  {/each}
</div>
```

### Using the store directly

```svelte
<script lang="ts">
  import { gameStore } from "$lib/stores/game";

  // Access any method or property directly
  const canAct = gameStore.canPlayerAct();
  const isLeader = gameStore.isCurrentPlayerLeader;
</script>

<div>
  Current hand size: {gameStore.getHandSize()}
  Can act: {canAct}
  Is leader: {isLeader}
</div>
```

## Advanced Usage

### Custom derived state

```svelte
<script lang="ts">
  import { gameStore } from "$lib/stores/game";

  // Create custom derived state
  const currentPlayerName = $derived(
    gameStore.state.currentPlayer?.nickname || "Unknown"
  );

  const isWaiting = $derived(
    gameStore.state.phase === "players_submitting" && 
    gameStore.state.hasSubmittedCard
  );
</script>

<div>
  Playing as: {currentPlayerName}
  {#if isWaiting}
    <p>Waiting for other players...</p>
  {/if}
</div>
```

### Reactive effects

```svelte
<script lang="ts">
  import { gameStore } from "$lib/stores/game";
  import { goto } from "$app/navigation";

  // React to phase changes
  $effect(() => {
    if (gameStore.state.phase === "game_finished") {
      // Show game over screen
      console.log("Game finished!");
    }
  });

  // React to room creation
  $effect(() => {
    if (gameStore.state.roomId && !gameStore.state.isConnecting) {
      // Navigate to game room
      goto(`/game/${gameStore.state.roomId}`);
    }
  });
</script>
```

## Migration from Old Store

If you're migrating from the old store, here's how the API has changed:

### Old way:
```svelte
<script lang="ts">
  import { gameState, gameActions, isCurrentPlayerLeader } from "$lib/stores/game";

  gameActions.sendReady();
  gameActions.leaderSelectsCard(card, description);
</script>

<div>
  Is leader: {$isCurrentPlayerLeader}
  Phase: {$gameState.roomState?.stage}
</div>
```

### New way:
```svelte
<script lang="ts">
  import { useGameStore } from "$lib/stores/game";

  const game = useGameStore();

  game.setReady();
  game.submitLeaderCard(cardId, description);
</script>

<div>
  Is leader: {game.isCurrentPlayerLeader}
  Phase: {game.state.phase}
</div>
```

## Key Benefits

1. **Better Type Safety**: All actions and state are fully typed
2. **Cleaner API**: More intuitive method names and consistent patterns
3. **Modular**: Each concern is separated into its own module
4. **Reactive**: Built with Svelte 5 runes for optimal reactivity
5. **Helper Methods**: Rich set of helper methods for common operations
6. **Better Error Handling**: Centralized error handling with clear messages

## Testing

Each module can be tested independently:

```typescript
import { GameHelpersManager } from "$lib/stores/game/helpers.svelte";
import { createInitialGameState } from "$lib/stores/game/types";

describe("GameHelpers", () => {
  test("canSubmitCard returns true when in players_submitting phase", () => {
    const state = createInitialGameState();
    state.phase = "players_submitting";
    state.hasSubmittedCard = false;
    state.leaderId = "other-player";
    state.currentPlayer = { id: "current-player" } as any;

    const helpers = new GameHelpersManager(state);
    expect(helpers.canSubmitCard()).toBe(true);
  });
});
```
