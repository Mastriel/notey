<script lang="ts">
  import { Trash2, PencilLine } from "@lucide/svelte";
  import { type Note, noteStore } from "../notes/notes.svelte";
  import IconButton from "./IconButton.svelte";
  import { tick } from "svelte";

  const {
    note = $bindable(),
    selected = false,
    onclick,
    ondelete,
  }: {
    note: Note;
    selected?: boolean;
    onclick?: () => void;
    ondelete?: () => void;
  } = $props();

  const startEditingName = async () => {
    isEditingName = true;
    await tick();
    nameInput?.focus();
  };

  let isEditingName = $state(false);

  let nameInput: HTMLInputElement | undefined = $state();

  const unfocus = () => {
    isEditingName = false;
    noteStore.saveAll();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      unfocus();
    }
  };
</script>

<div class="group flex items-center gap-1 rounded-md">
  <button
    type="button"
    class={`border border-transparent min-w-0 flex-1 rounded-md px-2 text-left text-sm transition-colors text-gray-700 ${selected ? "bg-gray-50 !border-gray-300" : "hover:bg-gray-50 hover:border-gray-300"}`}
    {onclick}
    aria-label={note.name}
  >
    {#if isEditingName}
      <input
        class="block truncate whitespace-nowrap overflow-hidden"
        bind:this={nameInput}
        onblur={unfocus}
        onkeydown={onKeyDown}
        bind:value={note.name}
      />
    {:else}
      <span class="block truncate whitespace-nowrap overflow-hidden"
        >{note.name}</span
      >
    {/if}
  </button>

  <span class="opacity-0 transition-opacity group-hover:opacity-100">
    <IconButton
      tooltip="Rename note"
      tooltipPlacement="left"
      onclick={startEditingName}
      class="hover:cursor-pointer"
    >
      <PencilLine class="text-gray-400" size={14} />
    </IconButton>

    <IconButton
      tooltip="Delete note"
      tooltipPlacement="left"
      onclick={(event) => {
        event.stopPropagation();
        ondelete?.();
      }}
      class="hover:cursor-pointer"
    >
      <Trash2 class="text-red-400" size={14} />
    </IconButton>
  </span>
</div>
