import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"
import { onCleanup } from "gnim"

type ScrollingLabelProps = {
  text: string
  maxChars: number
  displayChars: number
  class?: string
}

export const ScrollingLabel = ({ text, maxChars, displayChars, class: className }: ScrollingLabelProps) => {
  return (
    <label
      class={className}
      $={(self) => {
        self.set_size_request(240, -1)
        
        if (text.length > maxChars) {
          self.set_label(text.substring(0, maxChars) + "...")
        } else {
          self.set_label(text)
        }

        const motion = Gtk.EventControllerMotion.new()
        let scrollInterval: number | null = null
        let offset = 0

        motion.connect("enter", () => {
          if (scrollInterval !== null) {
            GLib.source_remove(scrollInterval)
            scrollInterval = null
          }

          if (text.length > displayChars) {
            scrollInterval = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 75, () => {
              const displayedText = text.substring(offset) + "  |  " + text.substring(0, offset)
              self.set_label(displayedText.substring(0, displayChars))
              offset = (offset + 1) % text.length
              return GLib.SOURCE_CONTINUE
            })
          }
        })

        motion.connect("leave", () => {
          if (scrollInterval !== null) {
            GLib.source_remove(scrollInterval)
            scrollInterval = null
          }

          if (text.length > maxChars) {
            self.set_label(text.substring(0, maxChars) + "...")
          } else {
            self.set_label(text)
          }
        })

        self.add_controller(motion)

        onCleanup(() => {
          if (scrollInterval !== null) {
            GLib.source_remove(scrollInterval)
          }
        })
      }}
    />
  )
}