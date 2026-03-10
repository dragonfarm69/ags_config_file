import { Gtk } from "ags/gtk4"
import { interval } from "ags/time"
import { createComputed, createState, With, Accessor } from "gnim"

export const CountDownComponent = ({
  isVisible,
  setCountDownRunningTrue,
  setCountDownRunningFalse,
}: {
  isVisible: Accessor<boolean>
  setCountDownRunningTrue: () => void
  setCountDownRunningFalse: () => void
}) => {
  const [StartCountDown, setStartCountDown] = createState(false)

  const [hourTime, setHourTime] = createState(0)
  const [minutesTime, setMinutesTime] = createState(0)
  const [secondTime, setSecondTime] = createState(0)

  let intervalId: ReturnType<typeof interval> | null = null

  const [totalSeconds, setTotalSeconds] = createState(0)

  const startCountDown = () => {
    console.log("starting countDown")
    stopCountDown()
    setStartCountDown(true)

    setTotalSeconds(
      hourTime.get() * 3600 + minutesTime.get() * 60 + secondTime.get(),
    )

    intervalId = interval(1000, () => {
      let s = secondTime.get()
      let m = minutesTime.get()
      let h = hourTime.get()

      if (s > 0) {
        setSecondTime(s - 1)
      } else if (m > 0) {
        setSecondTime(59)
        setMinutesTime(m - 1)
      } else if (h > 0) {
        setSecondTime(59)
        setMinutesTime(59)
        setHourTime(h - 1)
      } else {
        stopCountDown()
        console.log("Count down done")
      }
    })
  }

  const stopCountDown = () => {
    if (intervalId) {
      intervalId.cancel()
      intervalId = null
    }
    setStartCountDown(false)
  }

  const resetCountDown = () => {
    stopCountDown()
    setSecondTime(0)
  }

  const fraction = createComputed((track) => {
    const total = track(totalSeconds)
    if (total === 0) return 0

    const remaining =
      track(hourTime) * 3600 + track(minutesTime) * 60 + track(secondTime)

    return remaining / total // 1.0 → 0.0 as time runs out
  })

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
                if (!StartCountDown.get()) {
                  setHourTime(hourTime.get() + 1)
                }
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
                  if (!StartCountDown.get()) {
                    setHourTime(hourTime.get() - 1)
                  }
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
                if (!StartCountDown.get()) {
                  setMinutesTime(minutesTime.get() + 1)
                }
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
                  if (!StartCountDown.get()) {
                    setMinutesTime(minutesTime.get() - 1)
                  }
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
                if (!StartCountDown.get()) {
                  setSecondTime(secondTime.get() + 1)
                }
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
                  if (!StartCountDown.get()) {
                    setSecondTime(secondTime.get() - 1)
                  }
                }
              }}
            ></button>
          </box>
        </box>
      </box>

      <Gtk.ProgressBar
        fraction={fraction}
        class={"countDown-progress"}
      ></Gtk.ProgressBar>

      <With value={StartCountDown}>
        {(value) =>
          value ? (
            <box
              halign={Gtk.Align.CENTER}
              hexpand
              spacing={20}
              class={"countDown-button-container"}
            >
              <button
                label={"Stop countdown"}
                class={"countDown-button"}
                onClicked={() => {
                  startCountDown()
                  setCountDownRunningFalse()
                }}
              />
              <button
                label={"Reset countdown"}
                class={"countDown-button"}
                onClicked={() => {
                  resetCountDown()
                  setCountDownRunningFalse()
                }}
              />
            </box>
          ) : (
            <box
              halign={Gtk.Align.CENTER}
              hexpand
              spacing={20}
              class={"countDown-button-container"}
            >
              <button
                label={"Start countdown"}
                class={"countDown-button"}
                onClicked={() => {
                  startCountDown()
                  setCountDownRunningTrue()
                }}
              />
              <button
                label={"Reset countdown"}
                class={"countDown-button"}
                onClicked={() => {
                  resetCountDown()
                  setCountDownRunningFalse()
                }}
              />
            </box>
          )
        }
      </With>
    </box>
  )
}

export default CountDownComponent
