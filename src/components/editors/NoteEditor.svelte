<script lang="ts">
  import {onMount} from "svelte";
  import {Editor} from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import {Markdown} from "tiptap-markdown";
  import {editorManager} from "../../notes/editorManager.svelte";
  import type {Note} from "../../notes/notes.svelte";

  let element: HTMLDivElement | undefined = $state();
  let editor: Editor | undefined = $state();

  const activeNote = $derived.by(() => {
    const page = editorManager.activePage;
    if (!page || page.type !== "note") return undefined;
    return page as Note;
  });

  const ensureEditorContentMatchesActiveNote = () => {
    if (!editor || !activeNote) return;
    const currentMarkdown = editor.storage.markdown?.getMarkdown?.() ?? "";
    const incomingMarkdown = String(activeNote.content ?? "");
    if (currentMarkdown === incomingMarkdown) return;
    editor.commands.setContent(incomingMarkdown);
  };

  onMount(() => {
    if (!element) return;

    editor = new Editor({
      element,
      extensions: [StarterKit, Markdown],
      content: String(activeNote?.content ?? ""),
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none h-full bg-white p-3 outline-none",
        },
      },
    });

    editor.on("update", ({ editor: instance }) => {
      if (!activeNote) return;
      activeNote.content = instance.storage.markdown.getMarkdown();
    });

    return () => {
      editor?.destroy();
      editor = undefined;
    };
  });

  $effect(() => {
    if (!activeNote || !editor) return;
    ensureEditorContentMatchesActiveNote();
  });

  const runCommand = (command: (instance: Editor) => void) => {
    if (!editor) return;
    command(editor);
    editor.commands.focus();
  };

  type CommandFn = (instance: Editor) => void
  type Tool = { name: string; command: CommandFn }

  const tools: Tool[] = [
    { name: "H1", command: (instance) => instance.chain().toggleHeading({ level: 1 }).run() },
    { name: "H2", command: (instance) => instance.chain().toggleHeading({ level: 2 }).run() },
    { name: "H3", command: (instance) => instance.chain().toggleHeading({ level: 3 }).run() },
    { name: "H4", command: (instance) => instance.chain().toggleHeading({ level: 4 }).run() },
    { name: "Bold", command: (instance) => instance.chain().toggleBold().run() },
    { name: "Italic", command: (instance) => instance.chain().toggleItalic().run() },
    { name: "List", command: (instance) => instance.chain().toggleBulletList().run() },
    { name: "Code", command: (instance) => instance.chain().toggleCodeBlock().run() },
  ]
</script>

{#if activeNote}
  <div class="flex h-full flex-col gap-2 p-[5px]">
    <div class="flex flex-wrap items-center gap-1 border-b border-gray-300 pb-1">
      {#each tools as toolItem (toolItem.name)}
        <button class="rounded-md px-2 py-1 text-xs hover:bg-gray-100"
                onclick={() => runCommand(toolItem.command)}>{toolItem.name}
        </button>
      {/each}
    </div>
    <div class="tiptap" bind:this={element}></div>
  </div>
{:else}
  <div class="flex h-full items-center justify-center text-sm text-gray-500">
    Select a note to start editing.
  </div>
{/if}

<style>
	@reference "tailwindcss";

  :global(.tiptap h1) {
      @apply text-2xl font-bold;
  }

  :global(.tiptap h2) {
      @apply text-xl font-bold;
  }

  :global(.tiptap h3) {
      @apply text-lg font-bold;
  }

  :global(.tiptap h4) {
      @apply text-base font-bold;
  }

  :global(.tiptap h5) {
      @apply text-sm font-bold;
  }

  :global(.tiptap h6) {
      @apply text-xs font-bold;
  }
</style>