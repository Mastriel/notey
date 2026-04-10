<script lang="ts">
	import { TrashIcon } from '@lucide/svelte'
	import IconButton from "./IconButton.svelte";
	import { noteStore, type Note } from "../notes/notes.svelte";

type DeleteProps = {
	noteName?: string;
	note?: Note;
	onclick?: (event: MouseEvent) => void;
	onClick?: (event: MouseEvent) => void;
	onDelete?: (name: string) => void;
};

let { noteName, note, onclick, onClick, onDelete }: DeleteProps = $props();

function handleDelete(event: MouseEvent) {
	event.stopPropagation();

	const targetName = noteName ?? note?.name;
	if (targetName) {
		noteStore.removeNoteByName(targetName);
		onDelete?.(targetName);
	}

	onclick?.(event);
	onClick?.(event);
}

</script>

<IconButton 
	tooltip="Delete Note" 
	onclick={handleDelete}
	aria-label="Delete note"
	>
	<TrashIcon class="text-gray-500" size={16} 
	/>
  </IconButton>

