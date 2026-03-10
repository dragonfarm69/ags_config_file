import { Gtk } from "ags/gtk4"
import { interval } from "ags/time"
import { createComputed, createState, With, Accessor } from "gnim"

export const CountDownComponent = ({
  isVisible,
}: {
  isVisible: Accessor<boolean>
}) => {
  const [startTimer, setStartTimer] = createState(false)

  const [hourTime, setHourTime] = createState(0)
  const [minutesTime, setMinutesTime] = createState(0)
  const [secondTime, setSecondTime] = createState(0)

  return (
    <box
      visible={isVisible}
      orientation={Gtk.Orientation.VERTICAL}
      vexpand
      hexpand
      valign={Gtk.Align.CENTER}
      class={"CountDownBox"}
      spacing={5}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={3}>
        <label
          class={"countdown-title"}
          label={"Set countdown"}
          halign={Gtk.Align.START}
        ></label>
        <box halign={Gtk.Align.CENTER} hexpand>
          <box class="HourBox" orientation={Gtk.Orientation.VERTICAL}>
            <button
              class={"countDown-up-button"}
              label={""}
              onClicked={() => {
                setHourTime(hourTime.get() + 1)
              }}
            ></button>
            <label
              class="Hours"
              label={hourTime((v) => v.toString().padStart(2, "0"))}
              $={(self) => {
                const scroll = Gtk.EventControllerScroll.new(
                  Gtk.EventControllerScrollFlags.VERTICAL,
                )

                scroll.connect("scroll", (_self, _dx, dy) => {
                  //scrolled Up
                  if (dy < 0) {
                    setHourTime(hourTime.get() + 1)
                  }
                  //scrolled Down
                  else if (dy > 0) {
                    if (hourTime.get() > 0) {
                      setHourTime(hourTime.get() - 1)
                    }
                  }
                  //return true to stop the event
                  return true
                })

                self.add_controller(scroll)
              }}
            />
            <button
              class={"countDown-down-button"}
              label={""}
              onClicked={() => {
                if (hourTime.get() > 0) {
                  setHourTime(hourTime.get() - 1)
                }
              }}
            ></button>
          </box>
          <box class="TimeSeperator">
            <label label={":"} />
          </box>
          <box class="MinuteBox" orientation={Gtk.Orientation.VERTICAL}>
            <button
              class={"countDown-up-button"}
              label={""}
              onClicked={() => {
                setMinutesTime(minutesTime.get() + 1)
              }}
            ></button>
            <label
              class="Minutes"
              label={minutesTime((v) => v.toString().padStart(2, "0"))}
              $={(self) => {
                const scroll = Gtk.EventControllerScroll.new(
                  Gtk.EventControllerScrollFlags.VERTICAL,
                )

                scroll.connect("scroll", (_self, _dx, dy) => {
                  //scrolled Up
                  if (dy < 0) {
                    setMinutesTime(minutesTime.get() + 1)
                  }
                  //scrolled Down
                  else if (dy > 0) {
                    if (minutesTime.get() > 0) {
                      setMinutesTime(minutesTime.get() - 1)
                    }
                  }
                  //return true to stop the event
                  return true
                })

                self.add_controller(scroll)
              }}
            />
            <button
              class={"countDown-down-button"}
              label={""}
              onClicked={() => {
                if (minutesTime.get() > 0) {
                  setMinutesTime(minutesTime.get() - 1)
                }
              }}
            ></button>
          </box>
          <box class="TimeSeperator">
            <label label={":"} />
          </box>
          <box class="SecondBox" orientation={Gtk.Orientation.VERTICAL}>
            <button
              class={"countDown-up-button"}
              label={""}
              onClicked={() => {
                setSecondTime(secondTime.get() + 1)
              }}
            ></button>
            <label
              class="Seconds"
              label={secondTime((v) => v.toString().padStart(2, "0"))}
              $={(self) => {
                const scroll = Gtk.EventControllerScroll.new(
                  Gtk.EventControllerScrollFlags.VERTICAL,
                )

                scroll.connect("scroll", (_self, _dx, dy) => {
                  //scrolled Up
                  if (dy < 0) {
                    setSecondTime(secondTime.get() + 1)
                  }
                  //scrolled Down
                  else if (dy > 0) {
                    if (secondTime.get() > 0) {
                      setSecondTime(secondTime.get() - 1)
                    }
                  }
                  //return true to stop the event
                  return true
                })

                self.add_controller(scroll)
              }}
            />
            <button
              class={"countDown-down-button"}
              label={""}
              onClicked={() => {
                if (secondTime.get() > 0) {
                  setSecondTime(secondTime.get() - 1)
                }
              }}
            ></button>
          </box>
        </box>
      </box>

      <With value={startTimer}>
        {(value) =>
          value ? (
            <box
              halign={Gtk.Align.CENTER}
              hexpand
              spacing={20}
              class={"countDown-button-container"}
            >
              <button label={"Stop countdown"} class={"countDown-button"} />
              <button label={"Reset countdown"} class={"countDown-button"} />
            </box>
          ) : (
            <box
              halign={Gtk.Align.CENTER}
              hexpand
              spacing={20}
              class={"countDown-button-container"}
            >
              <button label={"Start countdown"} class={"countDown-button"} />
              <button label={"Reset countdown"} class={"countDown-button"} />
            </box>
          )
        }
      </With>
    </box>
  )
}

export default CountDownComponent
