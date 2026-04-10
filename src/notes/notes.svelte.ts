import {SvelteMap} from "svelte/reactivity";

type NoteContent = any;

export type Note = {
  name: string,
  type: "note",
  content: NoteContent,
  id: string
}

type SavedNotesStructure = {
  [id: string]: Note
}

const NOTE_ID_PREFIX = "notey::note::"

export class NoteStore {
  public notes: Note[] = $state([])
    removeNoteById: any;

  constructor() {

    const notesData = localStorage.getItem("notes")
    const notes = (notesData ? JSON.parse(notesData) : {}) as SavedNotesStructure

    for (const id in notes) {
      this.notes.push(notes[id])
    }
  }

  public saveAll() {
    const notes = {} as SavedNotesStructure
    for (const note of this.notes) {
      notes[NOTE_ID_PREFIX + note.id] = note
    }
    localStorage.setItem("notes", JSON.stringify(notes))
  }

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