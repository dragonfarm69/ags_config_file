import GLib from "gi://GLib?version=2.0"
import { FileUtils } from "./File"
import { MAIN_DIR, NOTES_INDEX, NOTES_CONTENT_DIR } from "../Notes/constants"
import type { NoteItem } from "../Notes/type"

export class NoteStorage {
  static initialize() {
    if (!GLib.file_test(MAIN_DIR, GLib.FileTest.IS_DIR)) {
      console.log("Creating directory at:", MAIN_DIR)
      GLib.mkdir_with_parents(MAIN_DIR, 0o700)
    }

    if (!GLib.file_test(NOTES_INDEX, GLib.FileTest.IS_REGULAR)) {
      console.log("Creating index file at:", NOTES_INDEX)
      const index = JSON.stringify({ notes: [] }, null, 2)
      GLib.file_set_contents(NOTES_INDEX, index)
    }

    if (!GLib.file_test(NOTES_CONTENT_DIR, GLib.FileTest.IS_DIR)) {
      console.log("Creating directory at:", NOTES_CONTENT_DIR)
      GLib.mkdir_with_parents(NOTES_CONTENT_DIR, 0o700)
    }
  }

  static loadAll(): NoteItem[] {
    try {
      const indexContent = GLib.file_get_contents(NOTES_INDEX)[1]
      if (!indexContent) {
        console.log("Failed to load index file")
        return []
      }

      const indexData = JSON.parse(new TextDecoder().decode(indexContent))
      return indexData.notes || []
    } catch (e) {
      console.error("Error loading index file:", e)
      return []
    }
  }

  static create(title: string, content: string = ""): boolean {
    const fileName = `${title.trim()}.txt`
    const filePath = `${NOTES_CONTENT_DIR}/${fileName}`

    const fileCreated = FileUtils.writeFile(filePath, content)
    if (!fileCreated) return false

    const indexUpdated = FileUtils.updateIndex(NOTES_INDEX, filePath, title.trim())
    return indexUpdated
  }

  static read(filePath: string): string | null {
    return FileUtils.readFile(filePath)
  }

  static update(filePath: string, content: string): boolean {
    return FileUtils.writeFile(filePath, content)
  }

  static delete(noteId: string): boolean {
    // TODO: Implement delete functionality
    return false
  }
}