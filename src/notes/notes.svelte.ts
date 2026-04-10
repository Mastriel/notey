import {SvelteMap} from "svelte/reactivity";

type Note = {
  name: string,
  content: string,
}

export class NoteStore {
  private notes: Map<string, Note> = new SvelteMap()

  private addNote(note: Note) {
    this.notes.set(note.name, note)
  }

  private removeNote(note: Note) {
    this.notes.delete(note.name)
  }

  private removeNoteByName(name: string) {
    this.notes.delete(name)
  }
}