import { Gtk } from "ags/gtk4"

type NoteCreatorProps = {
  onSave: (title: string) => void
  onCancel: () => void
  titleTextViewRef: (ref: Gtk.TextView | null) => void
}

export const NoteCreator = ({ onSave, onCancel, titleTextViewRef }: NoteCreatorProps) => {
  let textView: Gtk.TextView | null = null

  const handleSave = () => {
    if (textView) {
      const start = textView.buffer.get_start_iter()
      const end = textView.buffer.get_end_iter()
      const title = textView.buffer.get_text(start, end, false)
      
      if (!title || title.trim() === "") {
        console.log("Note title cannot be empty.")
        return
      }
      
      onSave(title.trim())
    }
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="note-editor-container" spacing={10}>
      <Gtk.TextView
        wrapMode={Gtk.WrapMode.WORD_CHAR}
        wrap_mode={Gtk.WrapMode.WORD}
        class="note-title-input"
        $={(self) => {
          textView = self
          titleTextViewRef(self)
        }}
      />
      
      <button onClicked={handleSave} class="create-note-button">
        Create new note
      </button>
      
      <button onClicked={onCancel} class="close-note-button">
        Close
      </button>
    </box>
  )
}