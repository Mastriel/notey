<script lang="ts">
  import { onMount } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { Markdown } from "tiptap-markdown";
  import { HtmlEmbed } from "./extensions/HtmlEmbed";
  import { editorManager } from "../../notes/editorManager.svelte";
  import { type Note, noteStore } from "../../notes/notes.svelte";

  let element: HTMLDivElement | undefined = $state();
  let editor: Editor | undefined = $state();
  let isHtmlEmbedModalOpen = $state(false);
  let htmlEmbedDraft = $state("");
  let editingHtmlEmbedPosition: number | undefined = $state();

  type HtmlEmbedEditDetail = {
    position: number;
    html: string;
  };

  type ComponentTagInsertDetail = {
    html: string;
  };

  const normalizeHtmlEmbedInput = (value: string) =>
    value
      .replaceAll("“", '"')
      .replaceAll("”", '"')
      .replaceAll("‘", "'")
      .replaceAll("’", "'");

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

    // Intentionally allow raw user HTML in markdown content for embedding.
    const markdown = Markdown.configure({
      html: true,
    });

    editor = new Editor({
      element,
      extensions: [StarterKit, markdown, HtmlEmbed],
      content: activeNote?.content ?? "",
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none h-full bg-white p-3 outline-none",
        },
      },
    });

    editor.on("update", ({ editor: instance }) => {
      if (!activeNote) return;
      activeNote.content = instance.storage.markdown.getMarkdown();
      noteStore.saveAll();
    });

    const onHtmlEmbedEditRequest = (event: Event) => {
      const { detail } = event as CustomEvent<HtmlEmbedEditDetail>;
      if (!detail || typeof detail.position !== "number") return;

      editingHtmlEmbedPosition = detail.position;
      htmlEmbedDraft = detail.html ?? "";
      isHtmlEmbedModalOpen = true;
    };

    const onComponentTagInsertRequest = (event: Event) => {
      const { detail } = event as CustomEvent<ComponentTagInsertDetail>;
      if (!detail?.html) return;

      editingHtmlEmbedPosition = undefined;
      htmlEmbedDraft = detail.html;
      isHtmlEmbedModalOpen = true;
    };

    window.addEventListener(
      "html-embed:edit",
      onHtmlEmbedEditRequest as EventListener,
    );
    window.addEventListener(
      "component-tag:insert",
      onComponentTagInsertRequest as EventListener,
    );

    return () => {
      window.removeEventListener(
        "html-embed:edit",
        onHtmlEmbedEditRequest as EventListener,
      );
      window.removeEventListener(
        "component-tag:insert",
        onComponentTagInsertRequest as EventListener,
      );
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

  type CommandFn = (instance: Editor) => void;
  type Tool = { name: string; command: CommandFn };

  const openHtmlEmbedModal = (_instance: Editor) => {
    editingHtmlEmbedPosition = undefined;
    htmlEmbedDraft = "";
    isHtmlEmbedModalOpen = true;
  };

  const closeHtmlEmbedModal = () => {
    isHtmlEmbedModalOpen = false;
    editingHtmlEmbedPosition = undefined;
    htmlEmbedDraft = "";
    editor?.commands.focus();
  };

  const confirmHtmlEmbed = () => {
    const html = normalizeHtmlEmbedInput(htmlEmbedDraft);
    if (!html.trim() || !editor) return;

    if (editingHtmlEmbedPosition !== undefined) {
      const node = editor.state.doc.nodeAt(editingHtmlEmbedPosition);

      if (node?.type.name === "htmlEmbed") {
        const tr = editor.state.tr.setNodeMarkup(
          editingHtmlEmbedPosition,
          undefined,
          {
            ...node.attrs,
            html,
          },
        );
        editor.view.dispatch(tr);
      }
    } else {
      editor.chain().focus().insertHtmlEmbed(html).run();
    }

    closeHtmlEmbedModal();
  };

  const tools: Tool[] = [
    {
      name: "H1",
      command: (instance) => instance.chain().toggleHeading({ level: 1 }).run(),
    },
    {
      name: "H2",
      command: (instance) => instance.chain().toggleHeading({ level: 2 }).run(),
    },
    {
      name: "H3",
      command: (instance) => instance.chain().toggleHeading({ level: 3 }).run(),
    },
    {
      name: "H4",
      command: (instance) => instance.chain().toggleHeading({ level: 4 }).run(),
    },
    {
      name: "Bold",
      command: (instance) => instance.chain().toggleBold().run(),
    },
    {
      name: "Italic",
      command: (instance) => instance.chain().toggleItalic().run(),
    },
    {
      name: "List",
      command: (instance) => instance.chain().toggleBulletList().run(),
    },
    {
      name: "Code",
      command: (instance) => instance.chain().toggleCodeBlock().run(),
    },
    {
      name: "1. List",
      command: (instance) => instance.chain().toggleOrderedList().run(),
    },
    { name: "HTML", command: openHtmlEmbedModal },
  ];
</script>

{#if activeNote}
  <div class="flex h-full min-h-0 flex-col gap-2 overflow-hidden p-1.25">
    <div
      class="flex-none flex flex-wrap items-center gap-1 border-b border-gray-300 pb-1"
    >
      {#each tools as toolItem (toolItem.name)}
        <button
          class="rounded-md px-2 py-1 text-xs hover:bg-gray-100"
          onclick={() => runCommand(toolItem.command)}
          >{toolItem.name}
        </button>
      {/each}
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="tiptap min-h-full" bind:this={element}></div>
    </div>

    {#if isHtmlEmbedModalOpen}
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 bg-black/35"
          aria-label="Close embed HTML modal"
          onclick={closeHtmlEmbedModal}
        ></button>
        <div
          class="relative w-full max-w-2xl rounded-md border border-gray-300 bg-white p-3 shadow-xl"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          aria-label="Embed HTML"
          onkeydown={(event) => {
            if (event.key === "Escape") closeHtmlEmbedModal();
          }}
        >
          <h2 class="text-sm font-semibold text-gray-900">
            {editingHtmlEmbedPosition !== undefined
              ? "Edit HTML Embed"
              : "Embed HTML"}
          </h2>
          <p class="mt-1 text-xs text-gray-600">
            Paste raw HTML to insert as an embedded block.
          </p>

          <textarea
            class="mt-2 h-44 w-full rounded-md border border-gray-300 p-2 font-mono text-xs outline-none focus:border-gray-500"
            bind:value={htmlEmbedDraft}
            placeholder="<your-component-here>etc etc...</your-component-here>"
          ></textarea>

          <div class="mt-3 flex justify-end gap-2">
            <button
              class="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100"
              onclick={closeHtmlEmbedModal}>Cancel</button
            >
            <button
              class="rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-800"
              onclick={confirmHtmlEmbed}
              >{editingHtmlEmbedPosition !== undefined
                ? "Save"
                : "Insert"}</button
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex h-full items-center justify-center text-sm text-gray-500">
    Select a note to start editing.
  </div>
{/if}

<style>
  @reference "tailwindcss";

  :global(.tiptap) {
    min-height: 100%;
  }

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
  :global(.tiptap ol) {
    @apply my-4 list-decimal pl-6;
  }
  :global(.tiptap ol li) {
    @apply mb-2;
  }
  :global(.tiptap ol li:first-child) {
    @apply mt-2;
  }
</style>
