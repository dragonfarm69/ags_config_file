import GLib from "gi://GLib?version=2.0"

export const AGS_CONFIG_DIR = `${GLib.get_user_config_dir()}/ags`
export const MAIN_DIR = `${AGS_CONFIG_DIR}/notes`
export const NOTES_INDEX = `${MAIN_DIR}/index.json`
export const NOTES_CONTENT_DIR = `${MAIN_DIR}/content`

export const DEFAULT_POSX = 100
export const DEFAULT_POSY = 100