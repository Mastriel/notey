<script lang="ts">
  import { TrashIcon } from "@lucide/svelte";
  import IconButton from "./IconButton.svelte";
  import { noteStore, type Note } from "../notes/notes.svelte";
  import NoteSidebar from "./NoteSidebar.svelte";

  type DeleteProps = {
    noteName?: string;
    note?: Note;
    onclick?: (event: MouseEvent) => void;
    onDelete?: (name: string) => void;
  };

  let { noteName, note, onclick, onDelete }: DeleteProps = $props();

  function handleDelete(event: MouseEvent) {
    event.stopPropagation();

    const targetName = noteName ?? note?.name;

    if (targetName) {
      noteStore.removeNoteByName(targetName);
      onDelete?.(targetName);
    }

    onclick?.(event);
  }
</script>

<button
  type="button"
  class="hover:bg-red-50 group rounded-md p-1 transition-colors"
  onclick={handleDelete}
  aria-label="Delete note"
>
  <TrashIcon
    class="text-gray-500 group-hover:text-red-500 transition-colors"
    size={16}
  />x
</button> */
