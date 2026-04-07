import { Astal, Gtk } from "ags/gtk4"
import Gio from "gi://Gio?version=2.0"
import { createState } from "gnim"
import { WindowManager } from "../lib/WindowManager"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"
import { triggerWindowUpdate } from "./ControlHub"

let globalBgPixbuf: GdkPixbuf.Pixbuf | null = null

try {
  // Load the image into RAM exactly once
  globalBgPixbuf = GdkPixbuf.Pixbuf.new_from_file(`${SRC}/assets/persona_3.png`)
} catch (e) {
  console.error("Failed to load background image:", e)
}

function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const menus = ["Home", "Settings", "Profile", "About", "Menu 5"]

const itemStyles = menus.map((_, index) => ({
  rotate: [-5, -1, 5, -5, -6][index] ?? 0,
  text_color: [1, 0, 0, 1, 1][index] ?? randomIntBetween(0, 1),
}))

//change text scaling value based on length

function getTextScalingValue(text_length: number): number {
  if (text_length > 7) {
    return 0.8
  }
  return 1
}

function makeMenuSvg(
  label: string,
  hovered: boolean,
  rotate: number,
  text_color: number,
): string {
  const clipId = `c-${label.replace(/\s+/g, "")}`
  const textX = 150
  const textY = 65
  const DEFAULT_FONT_SIZE = 120
  const triCX = (10 + 450 + 430) / 3
  const triCY = (40 + -5 + 80) / 3
  const text_scaling_value = getTextScalingValue(label.length)
  const triScale = hovered ? text_scaling_value * 1.5 : 1
  const trianglePath = "M10,40 L450,-5 L430,80 Z"
  const svg = `<svg viewBox="-200 -200 750 550" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="${clipId}">
        ${
          hovered
            ? `
            <path d="${trianglePath}" 
            fill="#E63946"
            transform="translate(${triCX}, ${triCY}) scale(${triScale}) translate(${-triCX}, ${-triCY})"
          />`
            : `<path d="${trianglePath}"/>`
        }

      </clipPath>
    </defs>

    <g transform="rotate(${rotate}, ${textX}, ${textY})">
      ${
        hovered
          ? `
        <path d="${trianglePath}" 
          fill="#E63946"
          transform="translate(${triCX}, ${triCY}) scale(${triScale}) translate(${-triCX}, ${-triCY})"
        />`
          : ""
      }
      <text x="${textX}" y="${textY}" text-anchor="middle"
            style="font-size: ${hovered ? DEFAULT_FONT_SIZE * text_scaling_value * 1.5 : DEFAULT_FONT_SIZE * text_scaling_value}; font-weight: bold; font-family: sans-serif;"
            fill="${hovered ? "#1d1b1a" : text_color === 1 ? "#4a9fe9ff" : "#3dc0e4ff"}">${label}</text>
      ${
        hovered
          ? `<text x="${textX}" y="${textY}" text-anchor="middle"
        style="font-size: ${DEFAULT_FONT_SIZE * text_scaling_value * 1.5}; font-weight: bold; font-family: sans-serif;"
        fill="#fce6eb" clip-path="url(#${clipId})">${label}</text>`
          : ""
      }
    </g>
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%23/g, "#")}")`
}

export const SVGTEST = () => {
  return (
    <window
      visible
      name="svg"
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      keymode={Astal.Keymode.ON_DEMAND}
      onDestroy={(self) => {
        self.destroy()
      }}
    >
      <overlay>
        <Gtk.Picture
          css="min-width: 1500px; min-height: 900px;"
          hexpand
          vexpand
          canShrink
          contentFit={Gtk.ContentFit.FILL}
          $={(self) => {
            if (globalBgPixbuf) {
              self.set_pixbuf(globalBgPixbuf)
            }
          }}
        />

        <box
          orientation={Gtk.Orientation.VERTICAL}
          $type="overlay"
          class={"menu-box"}
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
        >
          {menus.map((label, index) => {
            const style = itemStyles[index]
            const [hovered, setHovered] = createState(false)
            return (
              /* FIX 2: Use a button with native onHover events instead of EventControllerMotion */
              <button
                css={hovered(
                  (h) => `
                  min-width: 400px;
                  min-height: 240px;
                  margin-top: -100px;
                  background-color: transparent;
                  border: none;
                  box-shadow: none;
                  background-image: ${makeMenuSvg(label, h, style.rotate, style.text_color)};
                  background-repeat: no-repeat;
                  background-size: contain;
                  background-position: center;
                  transition: all 150ms ease;
                  `,
                )}
                onClicked={() => {
                  WindowManager.hide("svg")
                  // WindowManager.close("svg")
                  triggerWindowUpdate()
                }}
                $={(self) => {
                  const motion = new Gtk.EventControllerMotion()
                  motion.connect("enter", () => setHovered(true))
                  motion.connect("leave", () => setHovered(false))
                  self.add_controller(motion)
                }}
              />
            )
          })}
        </box>
      </overlay>
    </window>
  )
}
