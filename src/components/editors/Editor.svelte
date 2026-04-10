<script lang="ts">
  import { editorManager } from "../../notes/editorManager.svelte";
  import NoteEditor from "./NoteEditor.svelte";
  import ComponentEditor from "./ComponentEditor.svelte";
  import GetStarted from "./GetStarted.svelte";
</script>

{#if editorManager.activeEditor === "note"}
  <NoteEditor />
{:else if editorManager.activeEditor === "component"}
  <ComponentEditor />
{:else}
  <GetStarted />
{/if}
