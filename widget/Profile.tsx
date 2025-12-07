import { Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createComputed } from "gnim"

export const ProfileWidget = () => {
  return (
    <>
        <menubutton $type="end" hexpand halign={Gtk.Align.END}>
            <box class="TimeBox">
                <label label={"TEST"}></label>
            </box>

            <popover>
            <box orientation={Gtk.Orientation.VERTICAL} class="calendar-popover-box">
                <label label={"test"}></label>
            </box>
        </popover>
        </menubutton>
    </>
  )
}