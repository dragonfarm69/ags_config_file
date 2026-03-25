import { Astal, Gtk } from "ags/gtk4"
import Gio from "gi://Gio?version=2.0"
import { createState } from "gnim"

function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const menus = ["Home", "Settings", "Profile", "About", "Menu 5", "Menu 6", "Menu 7"]

const itemStyles = menus.map(() => ({
  rotate: randomIntBetween(-20, 5),
  text_color: randomIntBetween(0, 1)
}))

//change text scaling value based on length
function getTextScalingValue(text_length: number): number {
  // 1/8 of the size
  if(text_length > 7) {
    return 0.8
  }
  return 1
}

//For the triangle
function getRotationScalingValue(value: number): number {
  if(value >= 7) {
    return 5
  } else if (value <= -7) {
    return -5
  }

  return 0
}

function makeMenuSvg(label: string, hovered: boolean, rotate: number, text_color: number): string {
  const clipId = `c-${label.replace(/\s+/g, '')}`
  const textX = 150
  const textY = 65
  const DEFAULT_FONT_SIZE = 60;
  
  const text_scaling_value = getTextScalingValue(label.length);
  const trianglePath = "M25,40 L265,10 L250,75 Z"

  const svg = `<svg viewBox="-20 -20 340 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="${clipId}">
        <path d="${trianglePath}"/>
      </clipPath>
    </defs>

    <g transform="rotate(${rotate}, ${textX}, ${textY})">
      ${hovered ? `<path d="${trianglePath}" fill="#E63946"/>` : ""}

      <text x="${textX}" y="${textY}" text-anchor="middle"
            style="font-size: ${DEFAULT_FONT_SIZE * text_scaling_value}; font-weight: bold; font-family: sans-serif;"
            fill="${hovered ? "#1d1b1a" : text_color === 1 ? "#398bd4" : "#0dcaff"}">${label}</text>

      ${hovered ? `<text x="${textX}" y="${textY}" text-anchor="middle"
      style="font-size: ${DEFAULT_FONT_SIZE * text_scaling_value}; font-weight: bold; font-family: sans-serif;"
      fill="#fce6eb" clip-path="url(#${clipId})">${label}</text>` : ""}
    </g>
  </svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%23/g, '#')}")`
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
    >
      <overlay>
        <Gtk.Picture
          widthRequest={300}
          heightRequest={800}
          contentFit={Gtk.ContentFit.COVER}
          file={Gio.File.new_for_path(`${SRC}/assets/persona_3.png`)}
        >
        </Gtk.Picture>


        <box 
          orientation={Gtk.Orientation.VERTICAL} 
          $type="overlay"
          class={"menu-box"}
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
        >
          {menus.map((label, index) => {
            const style = itemStyles[index];
            const [hovered, setHovered] = createState(false)
            console.log(style.rotate)

            return (
              <box
                css={hovered(
                  (h) => `
                  min-width: 300px;
                  min-height: 100px;
                  background-image: ${makeMenuSvg(label, h, style.rotate, style.text_color)};
                  background-repeat: no-repeat;
                  background-size: contain;
                  background-position: center;
                  transition: all 150ms ease;
                  `,
                )}
                $={(self) => {
                  const motion = new Gtk.EventControllerMotion()
                  motion.connect("enter", () => setHovered(true))
                  motion.connect("leave", () => setHovered(false))
                  self.add_controller(motion)
                }}
              /> // ← no <label> child, text lives in the SVG now
            )
          })}
        </box>
      </overlay>
    </window>
  )
}
