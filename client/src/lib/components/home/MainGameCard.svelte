<script lang="ts">
  import AvatarNameInput from "./AvatarNameInput.svelte";
  import GameActionButtons from "./GameActionButtons.svelte";
  import HowToPlaySection from "./HowToPlaySection.svelte";

  interface Props {
    nickname: string;
    clientError: string;
    isLoading: boolean;
    onNicknameChange: (value: string) => void;
    onCreateGame: () => void;
    onJoinGame: () => void;
    onEnterPress: () => void;
  }

  let {
    nickname = $bindable(),
    clientError,
    isLoading,
    onNicknameChange,
    onCreateGame,
    onJoinGame,
    onEnterPress,
  }: Props = $props();
</script>

<!-- Main card -->
<div
  class="bg-black/40 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl"
>
  <AvatarNameInput
    bind:nickname
    {clientError}
    {isLoading}
    {onNicknameChange}
    {onEnterPress}
  />

  <GameActionButtons {nickname} {isLoading} {onCreateGame} {onJoinGame} />

  <HowToPlaySection />
</div>
