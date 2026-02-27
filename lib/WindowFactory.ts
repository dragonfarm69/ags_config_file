import { createRoot } from "gnim"
import { WindowManager } from "./WindowManager"
import { NoteWidget } from "../widget/Notes/Note"
import { ClockWidget } from "../widget/Clock"
import { ProfileWidget } from "../widget/Profile"
import { AnimationWidget } from "../widget/Animation"
import { ControlHub } from "../widget/ControlHub"

/**
 * Register all window factories
 * This should be called once at app startup
 */
export function registerWindowFactories() {

  WindowManager.registerFactory("hub", () => {
    return createRoot(() => ControlHub()) as any
  })


  // Notes widget factory
  WindowManager.registerFactory("notes", () => {
    return createRoot(() => NoteWidget()) as any
  })

  // Clock widget factory
  WindowManager.registerFactory("clock", () => {
    return createRoot(() => ClockWidget()) as any
  })

  // Profile widget factory
  WindowManager.registerFactory("profile", () => {
    return createRoot(() => ProfileWidget()) as any
  })

  // Animation widget factory
  // WindowManager.registerFactory("animation", () => {
  //   return createRoot(() => AnimationWidget()) as any
  // })

//   // Wallpaper viewer factory
//   WindowManager.registerFactory("wallpaper", () => {
//     return createRoot(() => WallpaperList()) as any
//   })
}