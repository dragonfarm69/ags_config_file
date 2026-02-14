import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"
import { Accessor, onCleanup } from "gnim"
import type { NoteItem } from "./type"
import { NoteStorage } from "../services/NoteStorage"

type NoteViewerProps = {
  notes: Accessor<NoteItem[]>
  selectedId: Accessor<string | null>
  onTextChange: (text: string) => void
  updateTextViewRef: (fn: () => void) => void
  updateTitleRef: (fn: () => void) => void
  onSave: (title: string) => void
  onCancel: () => void
}

export const NoteViewer = ({
  notes,
  selectedId,
  onTextChange,
  updateTextViewRef,
  updateTitleRef,
  onSave,
  onCancel,
}: NoteViewerProps) => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="note-viewer">
      {/* Title Bar */}
      <box class="note-header">
        <box css="min-width: 400px; max-width: 400px;" spacing={8}>
          <label
            class="note-title"
            hexpand={true}
            halign={Gtk.Align.START}
            $={(self) => {
              let scrollInterval: number | null = null

              const updateTitle = () => {
                const note = notes.get().find((n) => n.id === selectedId.get())
                const title = note?.title || "Error"

                if (scrollInterval !== null) {
                  GLib.source_remove(scrollInterval)
                  scrollInterval = null
                }

                if (title.length > 25) {
                  let offset = 0
                  scrollInterval = GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT,
                    150,
                    () => {
                      const displayedText =
                        title.substring(offset) +
                        "   •   " +
                        title.substring(0, offset)
                      self.set_label(displayedText.substring(0, 25))
                      offset = (offset + 1) % title.length
                      return GLib.SOURCE_CONTINUE
                    },
                  )
                } else {
                  self.set_label(title)
                }
              }

              updateTitleRef(updateTitle)
              updateTitle()

              onCleanup(() => {
                if (scrollInterval !== null) {
                  GLib.source_remove(scrollInterval)
                }
              })
            }}
            ellipsize={3}
          />
          <button
            onClicked={() => {
              const note = notes.get().find((n) => n.id === selectedId.get())
              if (note) {
                onSave(note.title)
              }
            }}
            class="note-btn primary"
          >
            Save
          </button>
          <button onClicked={onCancel} class="note-btn secondary">
            Close
          </button>
        </box>
      </box>

      {/* Content Area */}
      <box vexpand={true} hexpand={true} class="note-main">
        <scrolledwindow
          hexpand={true}
          vexpand={true}
          $={(self) => {
            self.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
            self.set_min_content_height(300)
            self.set_min_content_width(400)
          }}
        >
          <Gtk.TextView
            wrap_mode={Gtk.WrapMode.WORD_CHAR}
            class="note-content"
            margin_top={10}
            margin_bottom={10}
            margin_start={10}
            margin_end={10}
            $={(self) => {
              const updateTextView = () => {
                const selectedNote = notes
                  .get()
                  .find((n) => n.id === selectedId.get())

                if (selectedNote && selectedNote.filePath) {
                  const noteContent = NoteStorage.read(selectedNote.filePath)
                  self.buffer.set_text(noteContent || "", -1)
                } else {
                  self.buffer.set_text("", -1)
                }
              }

              self.buffer.connect("changed", () => {
                const start = self.buffer.get_start_iter()
                const end = self.buffer.get_end_iter()
                onTextChange(self.buffer.get_text(start, end, false))
              })

              updateTextViewRef(updateTextView)
              updateTextView()
            }}
          />
        </scrolledwindow>
      </box>
    </box>
  )
}
