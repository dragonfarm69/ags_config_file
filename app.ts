import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { registerWindowFactories } from "./lib/WindowFactory"
import { WindowManager } from "./lib/WindowManager"
import { ControlHub, triggerWindowUpdate } from "./widget/ControlHub"
import { WindowName } from "./lib/WindowManager"

registerWindowFactories()

app.start({
  css: style,
  requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd, arg, ...rest] = argv
    if (cmd == "toggle") {
      //toggle all windows
      if(arg == "all") {
        WindowManager.toggleAll()
      }
      else {
        WindowManager.close(arg as WindowName)
      }
      triggerWindowUpdate()
      return response(arg)
    }
    response("unknown command")
  },
  main() {
    WindowManager.show("hub")
    WindowManager.restoreSession()
    app.get_monitors().map(Bar)
  },
})

app.connect("shutdown", () => {
  console.log("Saving session")
  WindowManager.saveAllWindowPosition()
})