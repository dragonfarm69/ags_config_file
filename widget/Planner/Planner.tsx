import { Gtk, Astal, Gdk } from "ags/gtk4"
import GObject from "gi://GObject"
import { PlannerStorage } from "./PlannerStorage"

// Global Drag Reference
let currentlyDraggedWidget: Gtk.Widget | null = null

export const Planner = () => {
function DraggableItem(label: string) {
    const item = (
      <box css="background: #333; padding: 10px; margin: 5px; border-radius: 6px;">
        <label label={label} />
      </box>
    ) as Gtk.Box

    const dragSource = new Gtk.DragSource()
    dragSource.set_actions(Gdk.DragAction.MOVE)

    dragSource.connect("prepare", () => {
      const val = new GObject.Value()
      val.init(GObject.TYPE_STRING)
      val.set_string(label)
      return Gdk.ContentProvider.new_for_value(val)
    })

    dragSource.connect("drag-begin", (_, drag) => {
      currentlyDraggedWidget = item 
      item.set_opacity(0.4) 

      const icon = Gtk.DragIcon.get_for_drag(drag)
      icon.set_child(
        <box css="background: rgba(230, 57, 70, 0.8); padding: 10px; border-radius: 6px;">
          <label label={label} css="color: white; font-weight: bold;" />
        </box> as Gtk.Box
      )
    })

    dragSource.connect("drag-end", () => {
      item.set_opacity(1.0)
      currentlyDraggedWidget = null
    })

    const dropTarget = Gtk.DropTarget.new(GObject.TYPE_STRING, Gdk.DragAction.MOVE)

    dropTarget.connect("drop", (target, value, x, y) => {
      if (!currentlyDraggedWidget || currentlyDraggedWidget === item) return false

      const targetParent = item.get_parent() as Gtk.Box
      const currentParent = currentlyDraggedWidget.get_parent() as Gtk.Box

      if (currentParent) {
        currentParent.remove(currentlyDraggedWidget)
      }

      const itemHeight = item.get_allocated_height()
      
      if (y < itemHeight / 2) {
        targetParent.insert_child_after(currentlyDraggedWidget, item.get_prev_sibling())
      } else {
        targetParent.insert_child_after(currentlyDraggedWidget, item)
      }

      return true
    })

    item.add_controller(dragSource)
    item.add_controller(dropTarget)
    return item
  }
  
  function PlannerColumn(title: string, initialTasks: string[]) {
    const columnBox = (
      <box 
        orientation={Gtk.Orientation.VERTICAL} 
        spacing={4} 
        css="min-width: 200px; min-height: 300px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-right: 15px;"
      >
        <label label={title} css="font-weight: bold; margin-bottom: 10px; color: #0dcaff;" />
      </box>
    ) as Gtk.Box

    initialTasks.forEach(task => {
      columnBox.append(DraggableItem(task))
    })

    const dropTarget = Gtk.DropTarget.new(
      GObject.TYPE_STRING,
      Gdk.DragAction.MOVE,
    )

    dropTarget.connect("drop", () => {
      if (currentlyDraggedWidget) {
        const currentParent = currentlyDraggedWidget.get_parent() as Gtk.Box
        if (currentParent && currentParent !== columnBox) {
          currentParent.remove(currentlyDraggedWidget)
          columnBox.append(currentlyDraggedWidget)
        }
        //save to file
        // PlannerStorage.
        return true
      }
      return false
    })

    columnBox.add_controller(dropTarget)
    return columnBox
  }

  return (
    <window
      visible
      name="planner-widget"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
    >
      <box css="padding: 20px; background: #1d1b1a; border-radius: 12px;">
        {PlannerColumn("To Do", ["Finish Login UI", "Fix Memory Leak"])}
        {PlannerColumn("In Progress", ["Drink Water"])}
        {PlannerColumn("Done", ["Setup Arch Linux", "Install Niri"])}
      </box>
    </window>
  )
}