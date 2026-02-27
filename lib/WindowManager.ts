import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"
import { WindowPersistence, WindowState } from "./WindowPersistence"
import Astal from "gi://Astal?version=3.0"

export const AGS_CONFIG_DIR = `${GLib.get_user_config_dir()}/ags`
export const HUB_MAIN_DIR = `${AGS_CONFIG_DIR}/HUB`
export const HUB_CONTENT = `${HUB_MAIN_DIR}/positon.json`

export type WindowName = "clock" | "profile" | "animation" | "wallpaper" | "notes" | "hub"

// Type for window factory functions
type WindowFactory = () => Astal.Window
type DisposeFn = () => void

class WindowManagerClass {
  private windows: Map<WindowName, Astal.Window> = new Map()
  private factories: Map<WindowName, WindowFactory> = new Map()

  private disposer: Map<WindowName, DisposeFn> = new Map()
  private autosave: boolean = true

  constructor() {
    WindowPersistence.initialize()
  }

  toggleAutoSave(current_state: boolean) {
    this.autosave = !current_state
  }

  /**
   * Register a factory function that creates a window
   */
  registerFactory(name: WindowName, factory: WindowFactory) {
    this.factories.set(name, factory)
    console.log(`Registered factory for: ${name}`)
  }

  /**
   * Register an already-created window
   */
  register(name: WindowName, window: Astal.Window) {
    this.windows.set(name, window)
    console.log(`Registered window instance: ${name}`)
  }

  getWindowPosition(name: WindowName): {x: number, y: number} | null {
    const window = this.windows.get(name)
    if(!window) {
      return null
    }

    const x = window.get_margin_left() || window.get_margin_right() || 0
    const y = window.get_margin_top() || 0
    
    return {x, y}
  }

  saveWindowPosition(name: WindowName) {
    const position = this.getWindowPosition(name)
    if(!position) {
      console.log("error when trying to get window position")
      return
    }
    console.log("Window name: ", name)
    console.log("Window position: ", position)


    const isOpen = this.isVisible(name)
    WindowPersistence.updateWindowState({
      name,
      position,
      isOpen
    })
  }

  saveAllWindowPosition() {
    this.windows.forEach((_, name) => {
      this.saveWindowPosition(name)
    })
  }

  /**
   * Unregister and destroy a window
   */
  unregister(name: WindowName) {
    const window = this.windows.get(name)
    if (window) {
      if(this.autosave) {
        this.saveWindowPosition(name)
      }
      window.destroy()
    }

    const dispose = this.disposer.get(name)
    if(dispose) {
      dispose()
      this.disposer.delete(name)
    }

    this.windows.delete(name)

    if(this.autosave) {
      const state = WindowPersistence.getWindowState(name)
      if(state) {
        WindowPersistence.updateWindowState({
          ...state,
          isOpen: false
        })
      }
    }
    console.log(`Unregistered window: ${name}`)
  }

  /**
   * Get or create a window
   */
  private getOrCreate(name: WindowName): Astal.Window | null {
    // Check if window already exists
    let window = this.windows.get(name)
    
    if (!window) {
      // Check if we have a factory
      const factory = this.factories.get(name)
      if (factory) {
        console.log(`Creating new window: ${name}`)
        window = factory()

        if(window) {
          this.windows.set(name, window)

          const savedState = WindowPersistence.getWindowState(name)
          if(savedState) {
            this.setWindowPosition(name, savedState.position)
          }
        }
      } else {
        console.error(`No window or factory found for: ${name}`)
        return null
      }
    }
    
    return window
  }

  setWindowPosition(name: WindowName, position: {x: number, y: number}) {
    const window = this.windows.get(name)

    if(!window) {
      return
    }

    window.set_margin_left(position.x)
    window.set_margin_top(position.y)
  }

  /**
   * Show a window (creates it if it doesn't exist)
   */
  show(name: WindowName) {
    const window = this.getOrCreate(name)
    if (window) {
      window.set_visible(true)
      window.present()
      console.log(`Showed window: ${name}`)
    }
  }

  /**
   * Hide a window
   */
  hide(name: WindowName) {
    const window = this.windows.get(name)
    if (window) {
      window.set_visible(false)
      console.log(`Hid window: ${name}`)
    }
  }

  /**
   * Toggle window visibility (creates if needed)
   */
  toggle(name: WindowName) {
    const window = this.windows.get(name)
    
    if (window && window.get_visible()) {
      this.hide(name)
    } else {
      this.show(name)
    }
  }

  /**
   * Close and destroy a window
   */
  close(name: WindowName) {
    this.hide(name)
    this.unregister(name)
  }

  /**
   * Check if window exists and is visible
   */
  isVisible(name: WindowName): boolean {
    const window = this.windows.get(name)
    return window ? window.get_visible() : false
  }

  /**
   * Check if window exists (created or not)
   */
  exists(name: WindowName): boolean {
    return this.windows.has(name)
  }

  /**
   * Toggle all windows
   */
  toggleAll() {
    this.windows.forEach((window, name) => {
      this.toggle(name)
    })
  }

  /**
   * Close all windows
   */
  closeAll() {
    this.windows.forEach((window, name) => {
      this.close(name)
    })
  }

  /**
   * Show all existing windows
   */
  showAll() {
    this.windows.forEach((window, name) => {
      this.show(name)
    })
  }

  /**
   * Destroy all windows and clear registry
   */
  destroyAll() {
    this.windows.forEach((window, name) => {
      window.destroy()
    })
    this.windows.clear()
  }

  /**
   * Get all registered window names
   */
  getAllWindows(): WindowName[] {
    return Array.from(this.factories.keys())
  }

  /**
   * Get all active (created) window names
   */
  getActiveWindows(): WindowName[] {
    return Array.from(this.windows.keys())
  }

  restoreSession() {
    const openWindows = WindowPersistence.getOpenWindows()

    openWindows.forEach(name => {
      if (name !== "hub") {
        console.log("Loaded window: ", name)
        this.show(name)
      }
    })
  }
}

// Singleton instance
export const WindowManager = new WindowManagerClass()