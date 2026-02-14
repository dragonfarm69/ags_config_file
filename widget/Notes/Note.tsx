import { Gtk, Astal } from "ags/gtk4"
import { createState, With } from "gnim"
import { NoteStorage } from "../services/NoteStorage"
import { DEFAULT_POSX, DEFAULT_POSY, NOTES_CONTENT_DIR } from "./constants"
import { NoteList } from "./NoteList"
import { NoteCreator } from "./NoteCreate"
import { NoteViewer } from "./NoteViewer"
import { WindowManager } from "../../lib/WindowManager"
import { DRAG_THRESHOLD } from "../../lib/constVariable"

// Initialize storage
NoteStorage.initialize()

export const NoteWidget = () => {
  const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })
  const [selectedId, setSelectedId] = createState<string | null>("")
  const [text, setText] = createState("")
  const [isCreating, setCreating] = createState(false)
  const [notes, setNotes] = createState(NoteStorage.loadAll())

  let titleTextView: Gtk.TextView | null = null
  let updateTextView: (() => void) | null = null
  let updateRevealer: (() => void) | null = null
  let updateTitle: (() => void) | null = null

  const handleNoteSelect = (noteId: string) => {
    setSelectedId(noteId)
    if (isCreating.get()) setCreating(false)
    if (updateRevealer) updateRevealer()
    if (updateTextView) updateTextView()
    if (updateTitle) updateTitle()
  }

  const handleCreateNew = () => {
    setCreating(true)
    setSelectedId("@@create")
    if (updateRevealer) updateRevealer()
  }

  const handleSaveNote = (title: string) => {
    const created = NoteStorage.create(title)

    if (created) {
      setNotes(NoteStorage.loadAll())
      setCreating(false)
      setSelectedId(null)
      if (updateRevealer) updateRevealer()
    }
  }

  const handleSaveNoteContent = (title: string, content: string) => {
    const fileName = `${title.trim()}.txt`
    const filePath = `${NOTES_CONTENT_DIR}/${fileName}`
    NoteStorage.update(filePath, content)
  }

  const handleCancel = () => {
    setSelectedId(null)
    setCreating(false)
    if (updateRevealer) updateRevealer()
  }

  return (
    <window
      visible
      name="note-widget"
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      keymode={Astal.Keymode.ON_DEMAND}
      onDestroy={(self) => {
        self.destroy()
      }}
      $={(self) => {
        const drag = Gtk.GestureDrag.new()
        let startX = 0
        let startY = 0

        drag.connect("drag-begin", () => {
          startX = self.get_margin_left()
          startY = self.get_margin_top()
        })

        drag.connect("drag-update", (_, dx, dy) => {
          self.set_margin_left(Math.max(0, startX + dx))
          self.set_margin_top(Math.max(0, startY + dy))
        })

        drag.connect("drag-end", (_, dx, dy) => {
          setPosition({
            x: Math.max(0, startX + dx),
            y: Math.max(0, startY + dy),
          })

          const dragDistance = Math.sqrt(dx * dx + dy * dy)

          if(dragDistance > DRAG_THRESHOLD) {
            // console.log("Event drag-end")
            WindowManager.saveWindowPosition("notes")
          } else {
            // console.log("Not saving")
          }

        })

        self.add_controller(drag)
      }}
    >
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        class="note-window"
        spacing={10}
      >
        {/* Note List Sidebar */}
        <NoteList
          notes={notes}
          onNoteSelect={handleNoteSelect}
          onCreateNew={handleCreateNew}
        />

        {/* Main Content Area */}
        <revealer
          transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
          transitionDuration={60}
          $={(self) => {
            updateRevealer = () => {
              const shouldReveal =
                selectedId.get() !== null && selectedId.get() !== ""
              self.set_reveal_child(shouldReveal)
            }
            updateRevealer()
          }}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <With value={isCreating}>
              {(creating) =>
                creating ? (
                  <NoteCreator
                    onSave={handleSaveNote}
                    onCancel={handleCancel}
                    titleTextViewRef={(ref) => (titleTextView = ref)}
                  />
                ) : (
                  <NoteViewer
                    onCancel={handleCancel}
                    onSave={(title) => handleSaveNoteContent(title, text.get())}
                    notes={notes}
                    selectedId={selectedId}
                    onTextChange={setText}
                    updateTextViewRef={(fn) => (updateTextView = fn)}
                    updateTitleRef={(fn) => (updateTitle = fn)}
                  />
                )
              }
            </With>
          </box>
        </revealer>
      </box>
    </window>
  )
}
