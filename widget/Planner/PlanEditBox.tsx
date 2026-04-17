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
        <PlanEdit data={"Title"} title={planItem.get().title}/>
        <PlanEdit data={"Description"} title={planItem.get().description}/>
        <PlanEdit data={"Deadline"} title={planItem.get().deadline}/>
        <PlanEdit data={"Created Date: "} title={planItem.get().created_date}/>
        <PlanEdit data={"Last saved: "} title={planItem.get().updated_date}/>
    </box>
  )
}