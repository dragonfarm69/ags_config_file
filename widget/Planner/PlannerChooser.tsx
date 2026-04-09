import { Gtk, Astal, Gdk } from "ags/gtk4"
import GObject from "gi://GObject"

export const PlannerChooser = () => {
  return (
    <window
      visible
      name="planner-widget"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
    >
    </window>
  )
}