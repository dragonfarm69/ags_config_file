import { Gtk, Astal } from "ags/gtk4"
import { createState, With } from "gnim"
import { WindowManager, WindowName } from "../lib/WindowManager"

export const ControlHub = () => {
  const [updateTrigger, setUpdateTrigger] = createState(0)
  const windows: WindowName[] = ["clock", "profile", "animation", "wallpaper", "notes"]

  const toggleWindow = (name: WindowName) => {
    WindowManager.toggle(name)
    setUpdateTrigger(updateTrigger.get() + 1) // Force UI update
  }

  const closeWindow = (name: WindowName) => {
    WindowManager.close(name)
    setUpdateTrigger(updateTrigger.get() + 1)
  }

  return (
    <window
      visible
      name="control-hub"
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      keymode={Astal.Keymode.ON_DEMAND}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        css={`
          background-color: rgba(30, 30, 30, 0.95);
          padding: 16px;
          border-radius: 8px;
          min-width: 220px;
        `}
      >
        <label 
          label="Widget Hub" 
          css="font-size: 18px; font-weight: bold; color: #eceff4; margin-bottom: 8px;" 
        />
        
        <With value={updateTrigger}>
          {(_) => (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
              {windows.map((windowName) => {
                const exists = WindowManager.exists(windowName)
                const isVisible = WindowManager.isVisible(windowName)
                
                return (
                  <box spacing={4}>
                    <button
                      onClicked={() => toggleWindow(windowName)}
                      hexpand
                      css={`
                        padding: 10px 12px;
                        background-color: ${isVisible ? "#4c566a" : "#3b4252"};
                        color: #eceff4;
                        border-radius: 6px;
                        border-left: 3px solid ${isVisible ? "#88c0d0" : "transparent"};
                      `}
                    >
                      <box spacing={8}>
                        <label 
                          label={windowName.charAt(0).toUpperCase() + windowName.slice(1)} 
                          hexpand 
                          xalign={0}
                        />
                        <label 
                          label={exists ? (isVisible ? "●" : "○") : "×"}
                          css={`
                            color: ${isVisible ? "#a3be8c" : exists ? "#d08770" : "#bf616a"};
                            font-weight: bold;
                          `}
                        />
                      </box>
                    </button>
                    
                    {/* Close button - only show if window exists */}
                    {exists && (
                      <button
                        onClicked={() => closeWindow(windowName)}
                        css={`
                          padding: 10px 12px;
                          background-color: #bf616a;
                          color: #eceff4;
                          border-radius: 6px;
                          min-width: 40px;
                        `}
                      >
                        <label label="×" css="font-size: 16px; font-weight: bold;" />
                      </button>
                    )}
                  </box>
                )
              })}
            </box>
          )}
        </With>

        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} css="margin-top: 12px;">
          <button
            onClicked={() => {
              WindowManager.showAll()
              setUpdateTrigger(updateTrigger.get() + 1)
            }}
            css="padding: 8px; background-color: #a3be8c; color: #2e3440; border-radius: 4px; font-weight: bold;"
            hexpand
          >
            <label label="Show All" />
          </button>
          
          <button
            onClicked={() => {
              WindowManager.closeAll()
              setUpdateTrigger(updateTrigger.get() + 1)
            }}
            css="padding: 8px; background-color: #bf616a; color: #eceff4; border-radius: 4px; font-weight: bold;"
            hexpand
          >
            <label label="Hide All" />
          </button>
        </box>

        <button
          onClicked={() => {
            WindowManager.destroyAll()
            setUpdateTrigger(updateTrigger.get() + 1)
          }}
          css="padding: 8px; background-color: #d08770; color: #2e3440; border-radius: 4px; font-weight: bold; margin-top: 4px;"
        >
          <label label="Destroy All Windows" />
        </button>

        <button
          onClicked={() => {
            WindowManager.saveAllWindowPosition()
          }}
          css="padding: 8px; background-color: #8fbcbb; color: #2e3440; border-radius: 4px; font-weight: bold; margin-top: 4px;"
        >
          <label label="Save Positions" />
        </button>
      </box>
    </window>
  )
}