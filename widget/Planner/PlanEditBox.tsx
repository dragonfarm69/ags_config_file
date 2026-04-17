import { Accessor} from "gnim";
import { PlanItem } from "./PlannerVariable"
import { PlanEdit } from "./PlanEdit";
import { Gtk } from "ags/gtk4";

interface PlanEditBoxProps {
    planItem: Accessor<PlanItem>,
}

export const PlanEditBox = ({planItem}: PlanEditBoxProps) => {
  console.log("Plan item: ", planItem.get().title)
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
        <PlanEdit title={"Title"} data={planItem.get().title}/>
        <PlanEdit title={"Description"} data={planItem.get().description}/>
        <PlanEdit title={"Deadline"} data={planItem.get().deadline}/>
        <PlanEdit title={"Created Date: "} data={planItem.get().created_date}/>
        <PlanEdit title={"Last saved: "} data={planItem.get().updated_date}/>
    </box>
  )
}