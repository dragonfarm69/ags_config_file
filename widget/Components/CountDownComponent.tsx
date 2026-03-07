import { Gtk } from "ags/gtk4"
import { interval } from "ags/time"
import { createComputed, createState, With, Accessor } from "gnim"

export const CountDownComponent = ({isVisible} : {isVisible: Accessor<boolean>}) => {
  const [startTimer, setStartTimer] = createState(false)

  const [hourTime, setHourTime] = createState(0)
  const [minutesTime, setMinutesTime] = createState(0)
  const [secondTime, setSecondTime] = createState(0)

  return (
    <box visible={isVisible}>
      <box class={"CountDownBox"} spacing={10}>
        <box class="HourBox">
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
                  if(hourTime.get() > 0) {
                    setHourTime(hourTime.get() - 1)
                  }
                }
                //return true to stop the event
                return true
              })

              self.add_controller(scroll)
            }}
          />
          <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <button
              class={"countDown-up-button"}
              label={"^"}
              onClicked={() => {
                setHourTime(hourTime.get() + 1)
              }}
            ></button>

            <button
              class={"countDown-down-button"}
              label={"v"}
              onClicked={() => {
                if(hourTime.get() > 0) {
                  setHourTime(hourTime.get() - 1)
                }
              }}
            ></button>
          </box>
        </box>
        <box class="TimeSeperator">
          <label label={":"} />
        </box>
        <box class="MinuteBox">
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
                  if(minutesTime.get() > 0) {
                    setMinutesTime(minutesTime.get() - 1)
                  }
                }
                //return true to stop the event
                return true
              })

              self.add_controller(scroll)
            }}
          />
          <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <button
              class={"countDown-up-button"}
              label={"Up"}
              onClicked={() => {
                setMinutesTime(minutesTime.get() + 1)
              }}
            ></button>

            <button
              class={"countDown-down-button"}
              label={"Down"}
              onClicked={() => {
                if(minutesTime.get() > 0) {
                  setMinutesTime(minutesTime.get() - 1)
                }
              }}
            ></button>
          </box>
        </box>
        <box class="TimeSeperator">
          <label label={":"} />
        </box>
        <box class="SecondBox">
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
                  if(secondTime.get() > 0) {
                    setSecondTime(secondTime.get() - 1)
                  }
                }
                //return true to stop the event
                return true
              })

              self.add_controller(scroll)
            }}
          />

          <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <button
              class={"countDown-up-button"}
              label={"^"}
              onClicked={() => {
                setSecondTime(secondTime.get() + 1)
              }}
            ></button>

            <button
              class={"countDown-down-button"}
              label={"v"}
              onClicked={() => {
                if(secondTime.get() > 0) {
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
            <box>
              <button label={"Stop timer"} class={"timer-button"} />
              <button label={"Reset timer"} class={"timer-button"} />
            </box>
          ) : (
            <box>
              <button label={"Start timer"} class={"timer-button"} />
              <button label={"Reset timer"} class={"timer-button"} />
            </box>
          )
        }
      </With>
    </box>
  )
}

export default CountDownComponent
