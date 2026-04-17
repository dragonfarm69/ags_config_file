import { Gtk, Astal, Gdk } from "ags/gtk4"
import GObject from "gi://GObject"
import { Accessor, With } from "gnim";
import { PlanFileMeta } from "./PlannerVariable"
import { ScrollingLabel } from "../Components/ScrollingLabel";

interface PlannerChooserProps {
  plans: Accessor<PlanFileMeta[]>;
  onPlanSelect: (planId: string) => void
}

export const PlannerChooser = ({plans, onPlanSelect}: PlannerChooserProps) => {
  return (
        <scrolledwindow
          class={"planner-scroll-window"}
          $={(self) => {
            self.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
            self.set_max_content_height(500)
            self.set_propagate_natural_height(true)
            self.set_propagate_natural_width(false)
          }}
        >
          <With value={plans}>
            {(planList) =>
              planList && (
                <box
                  orientation={Gtk.Orientation.VERTICAL}
                  spacing={4}
                  class="plan-selection"
                >
                  {planList.map((plan) => (
                    <button
                      class="plan-item"
                      onClicked={() => onPlanSelect(plan.id)}
                    >
                      <ScrollingLabel
                        text={plan.title}
                        maxChars={25}
                        displayChars={30}
                      />
                    </button>
                  ))}
                  {/* <button class="create-new-note" onClicked={onCreateNew}>
                    <label label="Create New Note" />
                  </button> */}
                </box>
              )
            }
          </With>
        </scrolledwindow> 
  )
}