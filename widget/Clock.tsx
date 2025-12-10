import { Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createComputed } from "gnim"

export const ClockWidget = () => {
  const date = createPoll(new Date(), 1000, () => new Date())

  const hours = createComputed((track) => track(date).getHours().toString().padStart(2, '0'))
  const minutes = createComputed((track) => track(date).getMinutes().toString().padStart(2, '0'))
  const day = createComputed((track) => track(date).getDate().toString())
  const month = createComputed((track) => (track(date).getMonth() + 1).toString()) // getMonth() is 0-indexed
  const year = createComputed((track) => track(date).getFullYear().toString())

  const dateMonth = createComputed((track) => `${track(day)}/${track(month)}`)

  return (
    <>
        <menubutton $type="end" hexpand halign={Gtk.Align.END} class={"time-menu-button"}>
        <box class={"TimeBox"}>
            <box class="HourBox">
                <label label={hours} />
            </box>

            <box class="TimeSeperator">
                <label label={":"}/>
            </box>
            
            <box class="MinuteBox">
                <label label={minutes} />
            </box>
        </box>

        {/* <label label={timeLabel} /> */}
        <popover>
            <box orientation={Gtk.Orientation.VERTICAL} class="calendar-popover-box">
                {/* Header section */}
                <box orientation={Gtk.Orientation.VERTICAL} class="calendar-header">
                    <label label={year} class="calendar-title" />
                    <label label={dateMonth} class="calendar-time" />
                </box>
                
                {/* Calendar */}
                <Gtk.Calendar class="my-calendar" showHeading={false}/>
                
                {/* Optional footer */}
                <box class="calendar-footer">
                    <label label="Click a date to select" class="calendar-hint" />
                </box>
            </box>
        </popover>
        </menubutton>
    </>
  )
}