import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"
import { ControlHub } from "./ControlHub"

const img = `file:///${GLib.get_home_dir()}/.config/ags/assets/test.png`

type Notification = {
  id: number;
  message: string;
  body?: string;
  appName?: string;
};

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date")
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <>
    </> 
  )
}