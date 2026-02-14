import GLib from "gi://GLib?version=2.0";

export class FileUtils {
  static readFile(filePath: string): string | null {
    try {
      console.log("Reading file:", filePath)
      const [success, contents] = GLib.file_get_contents(filePath)
      
      if (!success) {
        console.error("Failed to read file:", filePath)
        return null
      }
      
      const text = new TextDecoder('utf-8').decode(contents)
      console.log("Successfully read file, length:", text.length)
      return text
    } catch (e) {
      console.error("Error reading file:", filePath, e)
      return null
    }
  }

    static writeFile(filePath: string, content: string): boolean {
        try {   
            return GLib.file_set_contents(filePath, content)
        } catch (e) {
            console.log("Error when writing to file " + filePath + " ", e)
            return false
        }
    }

    static mkdir(dirPath: string): boolean {
        try {
            const result = GLib.mkdir_with_parents(dirPath, 0o700)
            return result === 0
        } catch (e) {
            console.log("Error when trying to make directory in: " + dirPath + " ", e)
            return false
        }
    }

    static updateIndex(indexFilePath: string, newFilePath: string, newFileName: string): boolean {
        try {   
            const indexContent = this.readFile(indexFilePath)
            if (!indexContent) {
                console.log("Index file not exist")
                return false;
            }

            const data = JSON.parse(indexContent)
            if(data.notes.some((note: any) => note.title === newFileName)) {
                console.log("A note with the same name exist")
                return false;
            }
            
            const newNote = {
                id: Date.now().toString(),
                title: newFileName,
                filePath: newFilePath,
                createDate: new Date().toISOString(),
            }

            data.notes.push(newNote);
            
            const updatedIndexContent = JSON.stringify(data)

            return this.writeFile(indexFilePath, updatedIndexContent)
        } catch (e) {
            console.log("Error when trying to update index file ", e)
            return false
        }
    }
}