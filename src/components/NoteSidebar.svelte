<script lang="ts">
    import { FilePlusCorner } from '@lucide/svelte'
    import IconButton from "./IconButton.svelte";

</script>

<div class="p-1 flex gap-1 border-b border-gray-300">
  <IconButton tooltip="Create a Note" onclick={() => { console.log('new file')}}>
    <FilePlusCorner class="text-gray-500" size={16} />
  </IconButton>
</div>