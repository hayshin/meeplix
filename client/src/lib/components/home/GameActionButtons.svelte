<script lang="ts">
  import { Play, Users } from "lucide-svelte";
  import PixelButton from "$lib/components/ui/PixelButton.svelte";

  interface Props {
    nickname: string;
    isLoading: boolean;
    onCreateGame: () => void;
    onJoinGame: () => void;
  }

  let { nickname, isLoading, onCreateGame, onJoinGame }: Props = $props();
</script>

<!-- Action buttons -->
<div class="space-y-4 mb-8">
  <!-- Create game button -->
  <PixelButton
    variant="primary"
    size="md"
    fullWidth={true}
    disabled={isLoading || !nickname.trim()}
    loading={isLoading}
    onClick={onCreateGame}
  >
    {#snippet children()}
      <Play size={20} />
      Create Game
    {/snippet}
  </PixelButton>

  <!-- Join game button -->
  <PixelButton
    variant="secondary"
    size="md"
    fullWidth={true}
    disabled={isLoading || !nickname.trim()}
    onClick={onJoinGame}
  >
    {#snippet children()}
      <Users size={20} />
      Join Game
    {/snippet}
  </PixelButton>
</div>
