import type { Note } from "./notes.svelte";
import type { ComponentData, ImageData } from "./componentData.svelte";

export type Editor = "note" | "component" | "image";

export type Page = Note | ComponentData | ImageData;

export class EditorManager {
  public activePage: Page | undefined = $state(undefined);

  public activeEditor: Editor | undefined = $derived(this.activePage?.type);
}

export const editorManager = new EditorManager();
