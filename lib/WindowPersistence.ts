import GLib from "gi://GLib?version=2.0";
import { HUB_MAIN_DIR, HUB_CONTENT } from "./WindowManager";
import type { WindowName } from "./WindowManager";

export type WindowPos = {
    x: number,
    y: number
}

export type WindowState = {
    name: WindowName,
    position: WindowPos,
    isOpen: boolean,
}

export type WindowsConfig = {
    windows: WindowState[]
    lastSaved: string
}

export class WindowPersistence {
    static initialize() {
        if (!GLib.file_test(HUB_MAIN_DIR, GLib.FileTest.IS_DIR)) {
            console.log("Creating HUB directory at:", HUB_MAIN_DIR)
            GLib.mkdir_with_parents(HUB_MAIN_DIR, 0o700)
        }

        if (!GLib.file_test(HUB_CONTENT, GLib.FileTest.IS_REGULAR)) {
            console.log("Creating windows config file at:", HUB_CONTENT)
            const emptyConfig: WindowsConfig = {
                windows: [],
                lastSaved: new Date().toISOString()
            }
            GLib.file_set_contents(HUB_CONTENT, JSON.stringify(emptyConfig, null, 2))
        }
    }

    static load(): WindowState[] {
        try {
            const [success, contents] = GLib.file_get_contents(HUB_CONTENT)
            if(!success) {
                console.log("Error when trying to read window position file")
                return []
            }

            const windowsConf = JSON.parse(new TextDecoder().decode(contents))
            console.log("Loaded widnow: ", windowsConf)
            return windowsConf.windows || []
        }
        catch(e) {
            console.log("Error when trying to load window states")
            return []
        }
    }

    static save(states: WindowState[]) {
        try {
            const config: WindowsConfig = {
                windows: states,
                lastSaved: new Date().toISOString()
            }

            const success = GLib.file_set_contents(
                HUB_CONTENT,
                JSON.stringify(config, null, 2)
            )
            
            if(success) {
                console.log("Windows state saved successfully")
            }
            else {
                console.log("Windows state failed to save")
            }

            return success
        }
        catch(e) {
            console.log("Error when trying to save window states", e)
            return false
        }
    }

    static getWindowState(name: WindowName): WindowState | null {
        const states = this.load()
        return states.find(s=>s.name == name) || null   
    } 

    static getOpenWindows(): WindowName[] {
        const states = this.load()
        return states.filter(s=>s.isOpen).map(s=>s.name)
    }

    static updateWindowState(state: WindowState) {
        const states = this.load()
        const index = states.findIndex(s=>s.name === state.name)
        
        if(index >= 0) {
            states[index] = state
        } else {
            states.push(state)
        }

        this.save(states)
    }
} 