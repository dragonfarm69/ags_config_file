import { Gtk } from "ags/gtk4"
import { interval } from "ags/time"
import { createComputed, createState, With, Accessor } from "gnim"

export const TimerComponent = ({
  isVisible,
  setTimerRunningTrue,
  setTimerRunningFalse,
}: {
  isVisible: Accessor<boolean>
  setTimerRunningTrue: () => void
  setTimerRunningFalse: () => void
}) => {
  const [startTimer, setStartTimer] = createState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = createState<number>(0)

  let intervalId: ReturnType<typeof interval> | null = null

  const hours = createComputed((track) =>
    Math.floor(track(elapsedSeconds) / 3600),
  )

  const minutes = createComputed(
    (track) => Math.floor(track(elapsedSeconds) / 60) % 60,
  )

  const seconds = createComputed((track) => track(elapsedSeconds) % 60)

  const startTimerFunc = () => {
    console.log("starting timer")
    if (intervalId) return
    intervalId = interval(1000, () => {
      setElapsedSeconds(elapsedSeconds.get() + 1)
    })
    setStartTimer(true)
  }

  const stopTimerFunc = () => {
    if (intervalId) {
      intervalId.cancel()
      intervalId = null
    }
    setStartTimer(false)
  }

  const resetTimerFunc = () => {
    stopTimerFunc()
    setElapsedSeconds(0)
  }

  return (
    <box
      visible={isVisible}
      orientation={Gtk.Orientation.VERTICAL}
      class={"TimerBox"}
    >
      <box vexpand hexpand halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
        <box class="HourBox">
          <label label={hours((h) => h.toString().padStart(2, "0"))} />
        </box>
        <box class="TimeSeperator">
          <label label={":"} />
        </box>
        <box class="MinuteBox">
          <label label={minutes((m) => m.toString().padStart(2, "0"))} />
        </box>
        <box class="TimeSeperator">
          <label label={":"} />
        </box>
        <box class="SecondBox">
          <label label={seconds((s) => s.toString().padStart(2, "0"))} />
        </box>
      </box>

      <With value={startTimer}>
        {(value) =>
          value ? (
            <box
              spacing={10}
              class={"timer-button-container"}
              vexpand
              hexpand
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
            >
              <button
                label={"Stop timer"}
                class={"timer-button"}
                onClicked={() => {
                  stopTimerFunc()
                  setTimerRunningFalse()
                }}
              />
              <button
                label={"Reset timer"}
                class={"timer-button"}
                onClicked={() => {
                  resetTimerFunc()
                  setTimerRunningFalse()
                }}
              />
            </box>
          ) : (
            <box
              spacing={10}
              class={"timer-button-container"}
              vexpand
              hexpand
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
            >
              <button
                label={"Start timer"}
                class={"timer-button"}
                onClicked={() => {
                  startTimerFunc()
                  setTimerRunningTrue()
                }}
              />

              <button
                label={"Reset timer"}
                class={"timer-button"}
                onClicked={() => {
                  resetTimerFunc()
                  setTimerRunningFalse()
                }}
              />
            </box>
          )
        }
      </With>
    </box>
  )
}

export default TimerComponent
