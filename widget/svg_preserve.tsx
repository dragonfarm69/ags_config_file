import { Astal, Gtk } from "ags/gtk4"
import { createState } from "gnim"
import GLib from "gi://GLib"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"

const menus = ["Home", "Settings", "Profile", "About"]

const FRAMES_DIR = "/home/dragonfarm/.config/ags/background_frames"
const TOTAL_FRAMES = 102
const FPS = 15
const INTERVAL_MS = Math.floor(1000 / FPS)

// Cache loaded ONCE — never reloaded across remounts
const frameCache: GdkPixbuf.Pixbuf[] = []
for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const path = `${FRAMES_DIR}/frame_${i.toString().padStart(4, "0")}.webp`
  try {
    frameCache.push(GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 1000, 600, false))
  } catch (e) {
    print(`frame ${i} error: ${e}`)
  }
}

function makeBlobSvg(hovered: boolean): string {
  const color = hovered ? "#E63946" : "#4a4a5a"
  const svg = hovered
    ? `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,20 Q20,5 60,5 Q100,5 110,20 Q100,35 60,35 Q20,35 10,20Z" fill="${color}"/>
       </svg>`
    : `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="110" height="30" rx="6" fill="${color}"/>
       </svg>`
  // Encode for use in CSS data URI
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}


export const SVGTESTPRESERVE = () => {
  // Fresh picture widget each mount — avoids stale parent issue
  const pic = new Gtk.Picture({ width_request: 400, height_request: 600 })
  pic.set_content_fit(Gtk.ContentFit.COVER)

  let currentFrameIndex = 0
  let sourceId: number | null = null

  const startAnimation = () => {
    if (sourceId !== null) return
    const tick = () => {
      if (frameCache.length > 0) {
        pic.set_pixbuf(frameCache[currentFrameIndex])
        currentFrameIndex = (currentFrameIndex + 1) % frameCache.length
      }
      sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, INTERVAL_MS, tick)
      return false
    }
    tick()
  }

  const stopAnimation = () => {
    if (sourceId !== null) {
      GLib.source_remove(sourceId)
      sourceId = null
    }
  }

  return (
    <window
      visible
      name="svg"
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      keymode={Astal.Keymode.ON_DEMAND}
      $={(self) => {
        self.connect("show", startAnimation)
        self.connect("hide", stopAnimation)
        self.connect("destroy", stopAnimation)
        // Start immediately since window is visible on creation
        startAnimation()
      }}
    >
      <overlay css="min-width: 1000px; min-height: 600px;">
        <box $={(self) => self.append(pic)} />

        <box
          $type="overlay"
          orientation={Gtk.Orientation.VERTICAL}
          spacing={12}
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
          css="padding: 16px;"
        >
          {menus.map(label => {
          const [hovered, setHovered] = createState(false)

          return (
            <box
              css={hovered(h => `
                min-width: 120px;
                min-height: 40px;
                background-image: ${makeBlobSvg(h)};
                background-repeat: no-repeat;
                background-size: cover;
                transition: all 150ms ease;
              `)}
              $={(self) => {
                const motion = new Gtk.EventControllerMotion()
                motion.connect("enter", () => setHovered(true))
                motion.connect("leave", () => setHovered(false))
                self.add_controller(motion)
              }}
            >
              <label
                label={label}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                hexpand
                css={hovered(h => `color: ${h ? "white" : "#aaa"};`)}
              />
            </box>
          )
        })}
        </box>
      </overlay>
    </window>
  )
}