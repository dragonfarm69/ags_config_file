import { Gtk, Astal, Gdk } from "ags/gtk4"
import GObject from "gi://GObject"
import { PlannerStorage } from "./PlannerStorage"
import { Accessor, createState, For, With } from "gnim"
import { PlannerChooser } from "./PlannerChooser"
import { PlannerViewer } from "./PlannerView"
import { PlanFileMeta, PlanItem, PlannerData, Plans } from "./PlannerVariable" // Added Plans
import { WindowManager } from "../../lib/WindowManager"
import { DEFAULT_POSX, DEFAULT_POSY } from "./PlannerConstants"
import { DRAG_THRESHOLD } from "../../lib/constVariable"

export const Planner = () => {
  const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })
  const [plans, setPlans] = createState(PlannerStorage.loadAll())
  const [planData, setPlanData] = createState<PlannerData>({ plans: [] })
  const [selectedId, setSelectedId] = createState<string | null>("")
  let updateRevealer: (() => void) | null = null

  const firstPlan = plans.get()[0]

  const data = firstPlan ? PlannerStorage.read(firstPlan.filePath) : null

  function isPlanItem(value: unknown): value is PlanItem {
    if (typeof value !== "object" || value === null) return false
    const v = value as Record<string, unknown>
    return (
      typeof v.title === "string" &&
      typeof v.description === "string" &&
      typeof v.created_date === "string" &&
      typeof v.updated_date === "string" &&
      typeof v.deadline === "string"
    )
  }

  // Changed to return value is Plans
  function isPlan(value: unknown): value is Plans {
    if (typeof value !== "object" || value === null) return false
    const v = value as Record<string, unknown>
    return (
      typeof v.title === "string" &&
      Array.isArray(v.items) &&
      v.items.every(isPlanItem)
    )
  }

  // Changed to return value is PlannerData
  function isPlannerData(value: unknown): value is PlannerData {
    if (typeof value !== "object" || value === null) return false
    const v = value as Record<string, unknown>
    return (
      Array.isArray(v.plans) &&
      v.plans.every(isPlan) &&
      (v.lastSaved === undefined || typeof v.lastSaved === "string")
    )
  }

  function onPlanSelect(id: string) {
    let index = plans.get().findIndex((plan) => plan.id === id)
    
    setSelectedId(plans.get()[index].id)
    if (updateRevealer) updateRevealer()
  }

  const parsedUnknown: unknown = data ? JSON.parse(data) : null

  // Updated type from PlanFileMeta to PlannerData
  const dataParsed: PlannerData = isPlannerData(parsedUnknown)
    ? parsedUnknown
    : { plans: [] }
  setPlanData(dataParsed)

  return (
    <window
      visible
      name="planner"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
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

          if (dragDistance > DRAG_THRESHOLD) {
            // console.log("Event drag-end")
            WindowManager.saveWindowPosition("notes")
          } else {
            // console.log("Not saving")
          }
        })

        self.add_controller(drag)
      }}
    >
      <box css="padding: 20px; background: #1d1b1a; border-radius: 12px;">
        <PlannerChooser plans={plans} onPlanSelect={onPlanSelect} />

        <revealer
          transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
          transitionDuration={60}
          $={(self) => {
            updateRevealer = () => {
              const shouldReveal =
                selectedId.get() !== null && selectedId.get() !== ""
              self.set_reveal_child(shouldReveal)
            }
            updateRevealer()
          }}
        >
          <box orientation={Gtk.Orientation.VERTICAL}>
            <PlannerViewer plans={new Accessor(() => planData.get().plans)} />
          </box>
        </revealer>
      </box>
    </window>
  )
}
