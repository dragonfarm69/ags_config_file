import { Gtk, Astal, Gdk } from "ags/gtk4"
import { Accessor, createState, With } from "gnim";

interface PlanEditProps {
    title: string,
    data: string;
}

export const PlanEdit = ({data, title}: PlanEditProps) => {
    const [text, setText] = createState("")

  return (
    <box hexpand vexpand
    >
        <label label={title}/>
        <Gtk.TextView
        hexpand={true}
        vexpand={true} 
        wrap_mode={Gtk.WrapMode.WORD_CHAR}
        class={"plan-edit-content"}
        margin_top={10}
        margin_bottom={10}
        margin_start={10}
        margin_end={10}
        $={(self) => {
            self.buffer.set_text(data, -1)

            self.buffer.connect("changed", () => {
                console.log("Changing")
                const start = self.buffer.get_start_iter()
                const end = self.buffer.get_end_iter()
                setText(self.buffer.get_text(start, end, false))
            })
        }}
        />
    </box>
  )
}