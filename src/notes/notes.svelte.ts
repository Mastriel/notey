import {SvelteMap} from "svelte/reactivity";

export type Note = {
  name: string,
  content: string,
}

export class NoteStore {
  private notes: Map<string, Note> = new SvelteMap()

  addNote(note: Note) {
    this.notes.set(note.name, note)
  }

  removeNote(note: Note) {
    this.notes.delete(note.name)
  }

  removeNoteByName(name: string) {
    this.notes.delete(name)
  }

  getNote(name: string) {
    return this.notes.get(name)
  }

  getAllNotes() {
    return [...this.notes.values()]
  }
}

export const noteStore = new NoteStore()