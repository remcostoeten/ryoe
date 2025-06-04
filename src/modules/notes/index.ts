// Components
export { NoteEditor } from './components/note-editor'
export { CreateNoteButton, CreateNoteInFolder } from './components/create-note-button'
export { NoteList } from './components/note-list'

// Hooks
export { useNotes } from './hooks/use-notes'

// Re-export types from the main types file
export type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NoteWithFolder
} from '@/types/notes'
