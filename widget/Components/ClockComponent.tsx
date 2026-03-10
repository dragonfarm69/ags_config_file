import { Gtk, Gdk, Astal } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createComputed } from "gnim"
import { Accessor } from "gnim"
export const ClockComponent = ({
  isVisible,
}: {
  isVisible: Accessor<boolean>
}) => {
  const date = createPoll(new Date(), 1000, () => new Date())

  const hours = createComputed((track) =>
    track(date).getHours().toString().padStart(2, "0"),
  )
  const minutes = createComputed((track) =>
    track(date).getMinutes().toString().padStart(2, "0"),
  )
  const day = createComputed((track) => track(date).getDate().toString())
  const month = createComputed((track) =>
    (track(date).getMonth() + 1).toString(),
  ) // getMonth() is 0-indexed
  const year = createComputed((track) => track(date).getFullYear().toString())

  const dayOfWeek = createComputed((track) =>
    new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(track(date)),
  )

  const dateMonthYear = createComputed(
    (track) =>
      `${track(dayOfWeek)}, ${track(day)}/${track(month)}/${track(year)}`,
  )

  return (
    <menubutton
      $type="end"
      hexpand
      class={"time-menu-button"}
      visible={isVisible}
    >
      <box
        class={"TimeBox"}
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
      >
        <box class="date-box">
          <label class="date-label" label={dateMonthYear}></label>
        </box>

        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          class={"time-container"}
          vexpand
          width_request={300}
        >
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <box class="HourBox" hexpand halign={Gtk.Align.END}>
              <label label={hours} />
            </box>
            <box class="TimeSeperator" hexpand halign={Gtk.Align.CENTER}>
              <label label={":"} />
            </box>
            <box class="MinuteBox" hexpand halign={Gtk.Align.START}>
              <label label={minutes} />
            </box>
          </box>
          <box class="timezone-label" halign={Gtk.Align.CENTER}>
            <label label={"GMT+7 Ho Chi Minh City"} />
          </box>
        </box>
      </box>

      {/* <label label={timeLabel} /> */}
      <popover
        $={(self) => {
          self.set_offset(0, 4)
          self.set_has_arrow(true)
        }}
      >
        <box
          orientation={Gtk.Orientation.VERTICAL}
          class="calendar-popover-box"
        >
          {/* Calendar */}
          <Gtk.Calendar class="my-calendar" showHeading={false} />

          {/* Optional footer */}
          <box class="calendar-footer">
            <label label="Click a date to select" class="calendar-hint" />
          </box>
        </box>
      </popover>
    </menubutton>
  )
}
