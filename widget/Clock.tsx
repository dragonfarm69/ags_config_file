import { Gtk, Gdk, Astal } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createComputed } from "gnim"
import { createState } from "gnim"
import { WindowManager } from "../lib/WindowManager"
import { DRAG_THRESHOLD } from "../lib/constVariable"

const DEFAULT_POSX = 100
const DEFAULT_POSY = 100
export const ClockWidget = () => {
  const date = createPoll(new Date(), 1000, () => new Date())

  const hours = createComputed((track) => track(date).getHours().toString().padStart(2, '0'))
  const minutes = createComputed((track) => track(date).getMinutes().toString().padStart(2, '0'))
  const day = createComputed((track) => track(date).getDate().toString())
  const month = createComputed((track) => (track(date).getMonth() + 1).toString()) // getMonth() is 0-indexed
  const year = createComputed((track) => track(date).getFullYear().toString())

  const dateMonth = createComputed((track) => `${track(day)}/${track(month)}`)

  const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })

  return (
    <window
      visible
      name="clock-widget"
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
            WindowManager.saveWindowPosition("clock")
          }
        })

        self.add_controller(drag)
      }}
    >
        <menubutton $type="end" hexpand halign={Gtk.Align.END} class={"time-menu-button"}>
        <box class={"TimeBox"}>
            <box class="HourBox">
                <label label={hours} />
            </box>

            <box class="TimeSeperator">
                <label label={":"}/>
            </box>
            
            <box class="MinuteBox">
                <label label={minutes} />
            </box>
        </box>

        {/* <label label={timeLabel} /> */}
        <popover>
            <box orientation={Gtk.Orientation.VERTICAL} class="calendar-popover-box">
                {/* Header section */}
                <box orientation={Gtk.Orientation.VERTICAL} class="calendar-header">
                    <label label={year} class="calendar-title" />
                    <label label={dateMonth} class="calendar-time" />
                </box>
                
                {/* Calendar */}
                <Gtk.Calendar class="my-calendar" showHeading={false}/>
                
                {/* Optional footer */}
                <box class="calendar-footer">
                    <label label="Click a date to select" class="calendar-hint" />
                </box>
            </box>
        </popover>
        </menubutton>
    </window>
  )
}