import {SvelteMap} from "svelte/reactivity";

type NoteContent = any;

export type Note = {
  name: string,
  type: "note",
  content: NoteContent,
}

export class NoteStore {
  public notes: Note[] = $state([])

  public addNote(note: Note) {
    const statefulNote = $state(note)
    this.notes.push(statefulNote)
  }

  public removeNoteByName(name: string) {
    const note = this.notes?.find(it => it.name == name)
    if (!note) return
    this.notes.splice(this.notes.indexOf(note), 1)
  }
}

export const noteStore = new NoteStore()