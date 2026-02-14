import { Gtk } from "ags/gtk4"
import { With, Accessor } from "gnim"
import type { NoteItem } from "./type"
import { ScrollingLabel } from "../Components/ScrollingLabel"

type NoteListProps = {
  notes: Accessor<NoteItem[]>
  onNoteSelect: (noteId: string) => void
  onCreateNew: () => void
}

export const NoteList = ({ notes, onNoteSelect, onCreateNew }: NoteListProps) => {
  return (
    <scrolledwindow
      $={(self) => {
        self.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        self.set_max_content_height(500)
        self.set_propagate_natural_height(true)
        self.set_propagate_natural_width(false)
      }}
    >
      <With value={notes}>
        {(notesList) =>
          notesList && (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4} class="note-selection">
              {notesList.map((note) => (
                <button class="note-item" onClicked={() => onNoteSelect(note.id)}>
                  <ScrollingLabel text={note.title} maxChars={25} displayChars={30} />
                </button>
              ))}
              
              <button class="create-new-note" onClicked={onCreateNew}>
                <label label="Create New Note" />
              </button>
            </box>
          )
        }
      </With>
    </scrolledwindow>
  )
}