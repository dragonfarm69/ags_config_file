import { Gtk, Astal } from "ags/gtk4"
import { createState } from "gnim"

const DEFAULT_WIDTH = 300
const DEFAULT_HEIGHT = 300
const DEFAULT_POSX = 100
const DEFAULT_POSY = 100

export const NoteWidget = () => {
  const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })
  const [text, setText] = createState("")

  return (
    <window
      visible // Add this property to make the window visible
      name="note-widget"
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      keymode={Astal.Keymode.ON_DEMAND}
      $={(self) => {
        self.set_default_size(DEFAULT_WIDTH, DEFAULT_HEIGHT)

        // Initial position
        self.set_margin_left(DEFAULT_POSX)
        self.set_margin_top(DEFAULT_POSY)

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
        })

        self.add_controller(drag)
      }}
    >
      <box css="background-color: #2e3440; border-radius: 8px;">
        {/* Drag handle */}
        <box
          class="drag-handle"
          css="
            background-color: #3b4252;
            padding: 8px 12px;
            border-radius: 8px 8px 0 0;
          "
        >
          <label label="📝 Draggable Note" css="color: #eceff4;" />
          {/* <entry
            placeholderText={"Test"}
            text=""
            onNotifyText={({text}) => print(text)}
          >
          </entry> */}
          <Gtk.TextView
          $={(self) => {
            self.buffer.connect("changed", () => {
              const start = self.buffer.get_start_iter()
              const end = self.buffer.get_end_iter()
              setText(self.buffer.get_text(start, end, false))
            })
          }}
          css="
            padding: 12px;
            background-color: #2e3440;
            color: #eceff4;
            font-size: 14px;
            font-family: monospace;
            min-width: 300px;
          "
          wrap_mode={Gtk.WrapMode.WORD}
          >
          </Gtk.TextView>
        </box>
        {/* Add your text area or other content here */}
      </box>
    </window>
  )
}