<script lang="ts">
  import { Copy, FileCodeCorner, Plus, Trash2 } from "@lucide/svelte";
  import IconButton from "./IconButton.svelte";
  import type { ComponentData } from "../notes/componentData.svelte";
  import { componentStore } from "../notes/componentStore.svelte";
  import { editorManager } from "../notes/editorManager.svelte";
  import { v4 } from "uuid";
  import base_svelte from "./base_svelte.txt?raw";

  const slugify = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const toTagName = (name: string) => {
    const base = slugify(name) || "component";
    const existingTags = new Set(
      componentStore.components.map((component) => component.tagName),
    );

    let suffix = 0;
    let tagName = `x-${base}`;

    while (existingTags.has(tagName)) {
      suffix += 1;
      tagName = `x-${base}-${suffix}`;
    }

    return tagName;
  };

  const getNextUntitledComponentName = () => {
    let nextIndex = 1;

    for (const component of componentStore.components) {
      const match = component.name.match(/^untitled-(\d+)$/);
      if (!match) continue;

      const index = Number(match[1]);
      nextIndex = Math.max(nextIndex, index + 1);
    }

    return `untitled-${nextIndex}`;
  };

  const createComponent = () => {
    const name = getNextUntitledComponentName();

    const tagName = toTagName(name);

    componentStore.addComponent({
      id: v4(),
      type: "component",
      name,
      tagName,
      source: base_svelte.replaceAll("%s", name),
    });

    editorManager.activePage =
      componentStore.components[componentStore.components.length - 1];
  };

  const selectComponent = (component: ComponentData) => {
    editorManager.activePage = component;
  };

  const copyTagSnippet = async (component: ComponentData) => {
    await navigator.clipboard.writeText(
      `<${component.tagName}></${component.tagName}>`,
    );
  };

  const insertTagSnippet = (component: ComponentData) => {
    window.dispatchEvent(
      new CustomEvent("component-tag:insert", {
        detail: { html: `<${component.tagName}></${component.tagName}>` },
      }),
    );
  };

  const deleteComponent = (component: ComponentData) => {
    componentStore.removeComponentById(component.id);

    if (editorManager.activePage?.id === component.id) {
      editorManager.activePage = undefined;
    }
  };
</script>

<div class="p-1 flex gap-1 border-b bg-gray-50 border-gray-300">
  <IconButton
    tooltip="Create a Component"
    tooltipPlacement="right"
    onclick={createComponent}
  >
    <FileCodeCorner class="text-gray-500" size={16} />
  </IconButton>
</div>

<div class="flex flex-col gap-1 p-1">
  {#each componentStore.components as component (component.id)}
    <div class="group flex items-center gap-1 rounded-md">
      <button
        type="button"
        class={`border border-transparent min-w-0 flex-1 rounded-md px-2 py-1 text-left text-sm transition-colors text-gray-700 ${editorManager.activePage?.id === component.id ? "bg-gray-50 border-gray-300!" : "hover:bg-gray-50 hover:border-gray-300"}`}
        onclick={() => selectComponent(component)}
        aria-label={component.name}
      >
        <span
          class="block truncate whitespace-nowrap overflow-hidden font-medium"
          >{component.name}</span
        >
        <span
          class="block truncate whitespace-nowrap overflow-hidden text-xs text-gray-500"
          >&lt;{component.tagName}&gt;</span
        >
      </button>

      <div
        class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <IconButton
          tooltip="Insert into note"
          tooltipPlacement="left"
          onclick={(event) => {
            event.stopPropagation();
            insertTagSnippet(component);
          }}
        >
          <Plus size={14} class="text-gray-500" />
        </IconButton>
        <IconButton
          tooltip="Copy tag"
          tooltipPlacement="left"
          onclick={(event) => {
            event.stopPropagation();
            copyTagSnippet(component);
          }}
        >
          <Copy size={14} class="text-gray-500" />
        </IconButton>
        <IconButton
          tooltip="Delete component"
          tooltipPlacement="left"
          onclick={(event) => {
            event.stopPropagation();
            deleteComponent(component);
          }}
        >
          <Trash2 size={14} class="text-red-400" />
        </IconButton>
      </div>
    </div>
  {/each}
</div>
