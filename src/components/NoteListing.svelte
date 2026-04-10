<script lang="ts">
  import { Trash2 } from "@lucide/svelte";
  import type { Note } from "../notes/notes.svelte";
  import IconButton from "./IconButton.svelte";

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


</script>

<div class="group flex items-center gap-1 rounded-md">
  <button
    type="button"
    class={`border border-transparent min-w-0 flex-1 rounded-md px-2 text-left text-sm transition-colors text-gray-700 ${selected ? "bg-gray-50 !border-gray-300" : "hover:bg-gray-50 hover:border-gray-300"}`}
    onclick={onclick}
    aria-label={note.name}
  >
    <span class="block truncate whitespace-nowrap overflow-hidden" contenteditable="true" bind:textContent={note.name}></span>
  </button>

  <span class="opacity-0 transition-opacity group-hover:opacity-100">
    <IconButton
      tooltip="Delete note"
      tooltipPlacement="right"
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
