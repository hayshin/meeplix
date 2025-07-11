<script lang="ts">
  import NicknameModal from "../game/nickname-modal.svelte";
  import AvatarNameInput from "./AvatarNameInput.svelte";
  import GameActionButtons from "./GameActionButtons.svelte";
  import HowToPlaySection from "./HowToPlaySection.svelte";
  import RoomTopicInput from "./RoomTopicInput.svelte";

  interface Props {
    nickname: string;
    topic: string;
    clientError: string;
    isLoading: boolean;
    onNicknameChange: (value: string) => void;
    onTopicChange: (value: string) => void;
    onCreateGame: () => void;
    onJoinGame: () => void;
    onEnterPress: () => void;
  }

  let {
    nickname = $bindable(),
    topic = $bindable(),
    clientError,
    isLoading,
    onNicknameChange,
    onTopicChange,
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
