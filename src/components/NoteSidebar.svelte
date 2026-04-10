<script lang="ts">
    import { FilePlusCorner } from '@lucide/svelte'
    import IconButton from "./IconButton.svelte";
    import NoteListing from "./NoteListing.svelte";
    import {type Note, noteStore} from "../notes/notes.svelte";
    import {editorManager} from "../notes/editorManager.svelte";
    import {v4} from "uuid";


    const onNoteClick = (note: Note) => {
      editorManager.activePage = note
    }

    const getNextUntitledName = () => {
      let nextUntitledIndex = 1

      for (const note of noteStore.notes) {
        const match = note.name.match(/^<untitled(?: (\d+))?>$/)
        if (!match) continue

        const currentIndex = match[1] ? Number(match[1]) : 1
        nextUntitledIndex = Math.max(nextUntitledIndex, currentIndex + 1)
      }

      return `<untitled ${nextUntitledIndex}>`
    }

    const createNote = () => {
      noteStore.addNote({
        name: getNextUntitledName(),
        type: "note",
        content: "",
        id: v4()
      })
      noteStore.saveAll();
    }
</script>

<div class="p-1 flex gap-1 border-b bg-gray-50 border-gray-300">
  <IconButton tooltip="Create a Note" tooltipPlacement="right" onclick={createNote}>
    <FilePlusCorner class="text-gray-500" size={16} />
  </IconButton>
</div>

<div class="flex flex-col gap-1 p-1">
  {#each noteStore.notes as note (note.id)}
    <NoteListing bind:note={note} selected={editorManager.activePage?.id === note.id} onclick={() => onNoteClick(note)}></NoteListing>
  {/each}
</div>
