import type {Note} from "./notes.svelte";
import type {ComponentData} from "./componentData.svelte";

export type Editor = "note" | "component"

export type Page = Note | ComponentData

export class EditorManager {
  public activePage: Page | undefined = $state(undefined)

  public activeEditor: Editor | undefined = $derived(this.activePage?.type)
}

export const editorManager = new EditorManager()