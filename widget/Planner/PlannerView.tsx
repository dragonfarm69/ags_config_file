import { Gtk, Astal, Gdk } from "ags/gtk4"
import GObject from "gi://GObject"
import { Accessor, With } from "gnim"
import { PlanItem, PlannerData, Plans } from "./PlannerVariable"
import { PlannerStorage } from "./PlannerStorage"
import { createState, For } from "gnim"
import { PlannerChooser } from "./PlannerChooser"
import { ScrollingLabel } from "../Components/ScrollingLabel"
import { PlanEditBox } from "./PlanEditBox"

interface PlannerViewerProps {
  plans: Accessor<Plans[]>
  // selectedId: Accessor<string | null>
  // onSave: (title: string) => void
  // onCancel: () => void
}

let currentlyDraggedWidget: Gtk.Widget | null = null

export const PlannerViewer = ({ plans }: PlannerViewerProps) => {
  const [editItem, setEditItem] = createState<PlanItem | null>(null)

  let updateRevealer: (() => void) | null = null
  let updateTextView: (() => void) | null = null

  function onClicked(self: Gtk.Button) {
    console.log(self, "was clicked")
  }

  function DraggableItem(data: PlanItem) {
    const item = (
      <box
        class={"draggable-plan-item"}
        hasTooltip
        $={(self) =>
          self.connect("query-tooltip", (_, __, ___, ____, tooltip) => {
            const customView = (
              <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                css="padding: 10px;"
              >
                <label label={"Status: " + data.title} halign={Gtk.Align.START}/>
                <label label={"Description: " + data.description} halign={Gtk.Align.START}/>
                <label label="Status: Done/Not done/Something" halign={Gtk.Align.START}/>
                <label label="Created date: DATE" halign={Gtk.Align.START}/>
                <label label="Deadline: DATE" halign={Gtk.Align.START}/>
                <label label="Click to edit" halign={Gtk.Align.START}/>
              </box>
            ) as Gtk.Widget

            tooltip.set_custom(customView)
            return true
          })
        }
      >
        <Gtk.GestureClick
          propagationPhase={Gtk.PropagationPhase.CAPTURE}
          button={Gdk.BUTTON_SECONDARY}
          onPressed={() => {
            if (currentlyDraggedWidget === item) {
              setEditItem(null)
              return
            }
            setEditItem(data)
          }}
        />
        <ScrollingLabel text={data.title} maxChars={25} displayChars={30} />
      </box>
    ) as Gtk.Box

    const dragSource = new Gtk.DragSource()
    dragSource.set_actions(Gdk.DragAction.MOVE)

    dragSource.connect("prepare", () => {
      const val = new GObject.Value()
      val.init(GObject.TYPE_STRING)
      val.set_string(data.title)
      return Gdk.ContentProvider.new_for_value(val)
    })

    dragSource.connect("drag-begin", (_, drag) => {
      currentlyDraggedWidget = item
      item.set_opacity(0.4)

      const icon = Gtk.DragIcon.get_for_drag(drag)
      icon.set_child(
        (
          <box class={"draggable-plan-item dragging"}>
            <label label={data.title} class={"plan-content"} />
          </box>
        ) as Gtk.Box,
      )
    })

    dragSource.connect("drag-end", () => {
      item.set_opacity(1.0)
      currentlyDraggedWidget = null
    })

    const dropTarget = Gtk.DropTarget.new(
      GObject.TYPE_STRING,
      Gdk.DragAction.MOVE,
    )

    dropTarget.connect("drop", (target, value, x, y) => {
      if (!currentlyDraggedWidget || currentlyDraggedWidget === item)
        return false

      const targetParent = item.get_parent() as Gtk.Box
      const currentParent = currentlyDraggedWidget.get_parent() as Gtk.Box

      if (currentParent) {
        currentParent.remove(currentlyDraggedWidget)
      }

      const itemHeight = item.get_allocated_height()

      if (y < itemHeight / 2) {
        targetParent.insert_child_after(
          currentlyDraggedWidget,
          item.get_prev_sibling(),
        )
      } else {
        targetParent.insert_child_after(currentlyDraggedWidget, item)
      }

      return true
    })

    item.add_controller(dragSource)
    item.add_controller(dropTarget)
    return item
  }

  function PlannerColumn(title: string, initialTasks: PlanItem[]) {
    const columnBox = (
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={4}
        class={"plan-view-item"}
      >
        <ScrollingLabel text={title} maxChars={25} displayChars={30} />
      </box>
    ) as Gtk.Box

    initialTasks.forEach((task) => {
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
    <box orientation={Gtk.Orientation.VERTICAL}>
      <box class={"plan-view"}>
        <For each={plans}>
          {(item, index) => PlannerColumn(item.title, item.items)}
        </For>
      </box>
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={60}
        revealChild={editItem((item) => item !== null)}
      >
        <box orientation={Gtk.Orientation.VERTICAL}>
          <With value={editItem}>
            {(item) =>
              item !== null ? (
                <PlanEditBox planItem={editItem as Accessor<PlanItem>} />
              ) : (
                <box />
              )
            }
          </With>
        </box>
      </revealer>
    </box>
  )
}
