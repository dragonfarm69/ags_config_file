import { Gtk, Gdk, Astal } from "ags/gtk4"
import { createState, With } from "gnim"
import { WindowManager } from "../lib/WindowManager"
import { DRAG_THRESHOLD } from "../lib/constVariable"
import { ClockComponent } from "./Components/ClockComponent"
import { TimerComponent } from "./Components/TimerComponent"
import { CountDownComponent } from "./Components/CountDownComponent"

const DEFAULT_POSX = 100
const DEFAULT_POSY = 100

export type ClockState = "clock" | "timer" | "countdown"

export const ClockWidget = () => {
  const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })

  const [state, setState] = createState<ClockState>("clock");

  const renderContent = () => {
    if (state.get() === "clock") {
      return <ClockComponent></ClockComponent>
    }
    else if (state.get() === "timer") {
      return <TimerComponent></TimerComponent>
    }
    else if (state.get() === "countdown") {
      return <CountDownComponent></CountDownComponent>
    }
    return null
  }

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
      <box hexpand={false} halign={Gtk.Align.START}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <button 
            label={"Clock"} 
            class={"clock-status"}
            onClicked={() => {
              setState("clock")
            }}
          ></button>

          <button 
            label={"Timer"} 
            class={"clock-status"}
            onClicked={() => {
              setState("timer")
              console.log(state.get())
            }}
          ></button>

          <button 
            label={"Count Down"} 
            class={"clock-status"}
            onClicked={() => {
              setState("countdown")
            }}
          ></button>
        </box>
        <With
          value={state}
        >
          {() => renderContent()}
        </With>
      </box>
    </window>
  )
}