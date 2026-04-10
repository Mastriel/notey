<script lang="ts">
  import { onMount } from "svelte";
  import * as monaco from "monaco-editor";
  import type { editor as MonacoEditor } from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
  import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
  import type { ComponentData } from "../../notes/componentData.svelte";
  import { componentStore } from "../../notes/componentStore.svelte";
  import { editorManager } from "../../notes/editorManager.svelte";
  import { getComponentCompileError } from "../../notes/customComponentRegistry.svelte";

  const selectedComponent = $derived.by(() => {
    const page = editorManager.activePage;
    if (!page || page.type !== "component") return undefined;
    return page as ComponentData;
  });

  let editorContainer: HTMLDivElement | undefined = $state();
  let sourceEditor: MonacoEditor.IStandaloneCodeEditor | undefined = $state();
  let sourceModel: monaco.editor.ITextModel | undefined = $state();
  let saveTimer: ReturnType<typeof setTimeout> | undefined = $state();
  let compileError = $state<string | undefined>(undefined);
  let editingComponentId = $state<string | undefined>(undefined);

  const slugify = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const getUniqueTagForName = (name: string, currentComponentId: string) => {
    const base = slugify(name) || "component";
    const existingTags = new Set(
      componentStore.components
        .filter((component) => component.id !== currentComponentId)
        .map((component) => component.tagName)
    );

    let suffix = 0;
    let tagName = `x-${base}`;

    while (existingTags.has(tagName)) {
      suffix += 1;
      tagName = `x-${base}-${suffix}`;
    }

    return tagName;
  };

  const ensureMonacoWorkerConfig = () => {
    const globalScope = self as typeof self & {
      MonacoEnvironment?: {
        getWorker: (_moduleId: string, label: string) => Worker;
      };
    };

    if (globalScope.MonacoEnvironment?.getWorker) return;

    globalScope.MonacoEnvironment = {
      getWorker: (_moduleId: string, label: string) => {
        if (label === "json") return new jsonWorker();
        if (label === "css" || label === "scss" || label === "less") return new cssWorker();
        if (label === "html" || label === "handlebars" || label === "razor") return new htmlWorker();
        if (label === "typescript" || label === "javascript") return new tsWorker();
        return new editorWorker();
      },
    };
  };

  const persistComponent = (component: ComponentData, previousTagName?: string) => {
    componentStore.updateComponent(component, previousTagName);
    compileError = getComponentCompileError(component.tagName);
  };

  const scheduleSave = (component: ComponentData) => {
    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
      if (!sourceModel) return;
      component.source = sourceModel.getValue();
      persistComponent(component);
    }, 200);
  };

  const updateName = (event: Event) => {
    if (!selectedComponent) return;

    const previousTagName = selectedComponent.tagName;
    selectedComponent.name = (event.currentTarget as HTMLInputElement).value;
    selectedComponent.tagName = getUniqueTagForName(selectedComponent.name, selectedComponent.id);
    persistComponent(selectedComponent, previousTagName);
  };

  const copySnippet = async () => {
    if (!selectedComponent) return;
    await navigator.clipboard.writeText(`<${selectedComponent.tagName}></${selectedComponent.tagName}>`);
  };

  const syncEditorToSelection = () => {
    if (!sourceEditor || !selectedComponent) return;
    if (editingComponentId === selectedComponent.id) return;

    editingComponentId = selectedComponent.id;

    const existingModel = sourceEditor.getModel();
    existingModel?.dispose();

    sourceModel = monaco.editor.createModel(selectedComponent.source, "html");
    sourceEditor.setModel(sourceModel);

    compileError = getComponentCompileError(selectedComponent.tagName);
  };

  onMount(() => {
    if (!editorContainer) return;

    ensureMonacoWorkerConfig();

    sourceEditor = monaco.editor.create(editorContainer, {
      value: "",
      language: "html",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      wordWrap: "on",
      scrollBeyondLastLine: false,
      tabSize: 2,
    });

    sourceEditor.onDidChangeModelContent(() => {
      if (!selectedComponent) return;
      scheduleSave(selectedComponent);
    });

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      sourceModel?.dispose();
      sourceEditor?.dispose();
      sourceEditor = undefined;
      sourceModel = undefined;
    };
  });

  $effect(() => {
    if (!selectedComponent) {
      editingComponentId = undefined;
      compileError = undefined;
      return;
    }

    syncEditorToSelection();
  });
</script>

{#if selectedComponent}
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
    <div class="flex items-center justify-between gap-2 border-b border-gray-300 pb-2">
      <div>
        <h1 class="text-lg font-semibold text-gray-900">Edit Svelte component</h1>
        <p class="text-xs text-gray-500">Use this tag in notes: <span class="font-mono">&lt;{selectedComponent.tagName}&gt;</span></p>
      </div>

      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-100"
        onclick={copySnippet}
      >
        Copy tag
      </button>
    </div>

    <label class="flex flex-col gap-1 text-sm text-gray-700">
      <span class="text-xs font-medium uppercase tracking-wide text-gray-500">Name</span>
      <input
        class="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-500"
        value={selectedComponent.name}
        oninput={updateName}
      />
    </label>

    <div class="min-h-0 flex-1 overflow-hidden rounded-md border border-gray-300">
      <div class="h-full w-full" bind:this={editorContainer}></div>
    </div>

    {#if compileError}
      <div class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
        <strong>Compile error:</strong> {compileError}
      </div>
    {/if}

    <div class="rounded-md border border-gray-300 bg-gray-50 p-3">
      <h2 class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Preview</h2>
      <div class="rounded-md border border-dashed border-gray-300 bg-white p-3">
        <svelte:element this={selectedComponent.tagName}></svelte:element>
      </div>
    </div>
  </div>
{:else}
  <div class="flex h-full items-center justify-center text-sm text-gray-500">
    Select a component to edit it.
  </div>
{/if}
