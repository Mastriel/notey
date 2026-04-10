# Notey

Notey is a desktop note app built with Svelte, Tauri, and TypeScript.
It has a split layout for notes, a central editor, and a component sidebar for reusable custom elements.

## Features

- Create, select, and delete notes.
- Edit notes with a markdown editor.
- Create reusable Svelte components to embed into notes.
- Copy, edit, and delete component definitions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) for Tauri development

### Install

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

### Run the desktop app

```bash
pnpm tauri
```

### Type-check the project

```bash
pnpm check
```

### Format the project

```bash
pnpm format
```

### Check formatting

```bash
pnpm format:check
```

### Build for production

```bash
pnpm build
```

## How it Works

- Notes are stored in `localStorage` through `src/notes/notes.svelte.ts`.
- User-defined components are stored separately in `src/notes/componentStore.svelte.ts`.
- Component source is compiled at runtime into custom elements.
- The note editor can insert raw HTML and reusable component tags.

## Project Structure

- `src/routes/+page.svelte` - main layout
- `src/components/NoteSidebar.svelte` - note list and note creation
- `src/components/ComponentSidebar.svelte` - custom component list and creation
- `src/components/editors/NoteEditor.svelte` - markdown/HTML note editor
- `src/components/editors/ComponentEditor.svelte` - Monaco editor for Svelte component source
- `src/notes/` - app state, persistence, and runtime component registry
- `src-tauri/` - Tauri backend

