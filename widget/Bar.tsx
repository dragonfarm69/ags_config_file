import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createState, For } from "gnim"
import GLib from "gi://GLib"
import { ClockWidget } from "./Clock"
import { ProfileWidget } from "./Profile"
import { AnimationWidget } from "./Animation"
import { WallpaperList } from "./wallpaper_viewer"
import { NoteWidget } from "./Notes/Note"
import { Accessor } from "gnim"
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
  const [notifications, setNotifications] = createState<Notification[]>([])
  const [showProfile, setShowProfile] = createState(false)
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  let notificationId = 0

  const addNotification = () => {
    const id = notificationId++
    const notif: Notification = {
      id,
      message: `Notification #${id + 1}`,
    }

    setNotifications(prev => [notif, ...prev])
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const hasNotifications = notifications(n => n.length > 0)

  function NotificationItem(props: {
    notif: Notification;
    remove: (id: number) => void;
  }) {
    const { notif, remove } = props;
    const [show, setShow] = createState(false)

    const TRANSITION = 300

    const handleRemove = () => {
      setShow(false)
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, TRANSITION, () => {
        remove(notif.id)
        return GLib.SOURCE_REMOVE
      })
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
      setShow(true)
      return GLib.SOURCE_REMOVE
    })

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => {
      handleRemove()
      return GLib.SOURCE_REMOVE
    })

    return (
      <box halign={Gtk.Align.END} widthRequest={250} hexpand={false}>
        <revealer
          transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
          transitionDuration={TRANSITION}
          revealChild={show}
        >
          <box class="notification_item_box" widthRequest={320} hexpand={false} halign={Gtk.Align.END}>
            <label class="notification_image" css={`background-image: url('${img}');`} />
            <box orientation={Gtk.Orientation.VERTICAL} hexpand>
              <box orientation={Gtk.Orientation.HORIZONTAL}>
                <label label="test" hexpand />
                <button $type="close" onClicked={handleRemove}>
                  <label label="✕" />
                </button>
              </box>
              <label label={notif.message} />
            </box>
          </box>
        </revealer>
      </box>
    )
  }

  return (
    <>
      {/* Top Bar */}
      <window
        visible
        name="bar-top"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        anchor={TOP | LEFT}
        application={app}
      >
        {/* <ClockWidget></ClockWidget> */}
      </window>

      {/* Bottom Bar */}
      <window
        visible
        name="bar-bottom"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        anchor={BOTTOM | LEFT | RIGHT}
        application={app}
      >
        <centerbox cssName="centerbox">
          <box $type="start" hexpand halign={Gtk.Align.START}>
            <button
              $type="start"
              onClicked={addNotification}
              hexpand
              halign={Gtk.Align.START}
            >
              <label label="Show Notification" />
            </button>
            <AnimationWidget/>
          </box>
        </centerbox>
      </window>

      <ControlHub></ControlHub>
      {/* <NoteWidget></NoteWidget> */}

      {/* Profile Window */}
      {/* <ProfileWidget/> */}

      {/* Notifications Window - Only visible when there are notifications */}
      {/* <window
        visible={hasNotifications}
        name="notification"
        class="Notification"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.IGNORE}
        anchor={TOP | RIGHT}
        application={app}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={10} css="padding: 10px;">
          <For each={notifications}>
            {(notif: Notification) => <NotificationItem notif={notif} remove={removeNotification} />}
          </For>
        </box>
      </window> */}


      {/* <window
        visible
        name="image_viewer"
        class="image-viewer"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.IGNORE}
        application={app}
      >
        <box orientation={Gtk.Orientation.HORIZONTAL}>
            {WallpaperList("/home/dragonfarm/Pictures/Wallpapers")}
        </box>
      </window> */}
    </> 
  )
}