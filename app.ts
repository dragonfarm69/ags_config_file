import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { registerWindowFactories } from "./lib/WindowFactory"
import { WindowManager } from "./lib/WindowManager"
import { ControlHub } from "./widget/ControlHub"

registerWindowFactories()

app.start({
  css: style,
  main() {
    ControlHub()

    WindowManager.restoreSession()
    app.get_monitors().map(Bar)
  },
})

app.connect("shutdown", () => {
  console.log("Saving session")
  WindowManager.saveAllWindowPosition()
})