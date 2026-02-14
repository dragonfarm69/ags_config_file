import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";
import AstalWp from "gi://AstalWp";
import { createBinding, createComputed } from "gnim";
import { execAsync } from "ags/process";
import { Astal } from "ags/gtk4";
import app from "ags/gtk4/app";
import * as System from "./services/System"
import { NetGraph } from "./NetGraph";
import { createState } from "gnim";
import { WindowManager } from "../lib/WindowManager";
import { DRAG_THRESHOLD } from "../lib/constVariable";

const img = `file:///${GLib.get_home_dir()}/.config/ags/assets/Elizabeth.png`;
const { defaultSpeaker: speaker, defaultMicrophone: microphone } = AstalWp.get_default()!;

const DEFAULT_POSX = 100
const DEFAULT_POSY = 100
const [pos, setPosition] = createState({ x: DEFAULT_POSX, y: DEFAULT_POSY })

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB/s`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB/s`;
};

// --- UI Components ---

const Header = () => (
  <box class="first-layer" spacing={20} halign={Gtk.Align.CENTER}>
    <label class="profile_image" css={`background-image: url('${img}');`} />
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      <label label={`󰣇  ${System.distroName}`} halign={Gtk.Align.START}/>
      <label label={`  ${System.username}`} halign={Gtk.Align.START}/>
      <label label={`   ${System.wifi.ssid}`} halign={Gtk.Align.START}/>
    </box>
  </box>
);

const SystemMonitors = () => {
  const ramLabel = createComputed(track => `${(track(System.usedRam) / 1024 / 1024).toFixed(1)}GB / ${(track(System.totalRam) / 1024 / 1024).toFixed(1)}GB`);
  const diskLabel = createComputed(track => `${(track(System.usedDisk) / 1e9).toFixed(1)}GB / ${(track(System.totalDisk) / 1e9).toFixed(1)}GB`);
  const downloadLabel = createComputed(track => `󰇚  ${formatBytes(track(System.downloadSpeed))}`);
  const uploadLabel = createComputed(track => `󰕒  ${formatBytes(track(System.uploadSpeed))}`);
  const volumeLabel = createComputed(track => `${Math.round(track(createBinding(speaker, "volume")) * 100)}%`);
  const micLabel = createComputed(track => `${Math.round(track(createBinding(microphone, "volume")) * 100)}%`);

  return (
    <box class="second-layer" orientation={Gtk.Orientation.VERTICAL} spacing={10} halign={Gtk.Align.CENTER}>
      {/* RAM and Disk */}
      <box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
        <box spacing={10}>
          <levelbar 
            widthRequest={160} 
            maxValue={System.totalRam} 
            value={System.usedRam} 
          />
          <label label={ramLabel} css="font-size: 20px;"/>
        </box>
        <box spacing={10}>
          <levelbar 
            widthRequest={160}
            maxValue={System.totalDisk} 
            value={System.usedDisk} 
          />
          <label label={diskLabel} css="font-size: 20px;"/>
        </box>
      </box>

      {/* Network */}
      <box spacing={10} class="network-status">
        <NetGraph />
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label class="download-label" label={downloadLabel} halign={Gtk.Align.START} />
          <label class="upload-label" label={uploadLabel} halign={Gtk.Align.START} />
        </box>
      </box>

      {/* Volume */}
      <box>
        <label label=" " />
        <slider 
          widthRequest={260} 
          value={createBinding(speaker, "volume")} 
          onChangeValue={({ value }) => speaker.set_volume(value)} 
        />
        <label label={volumeLabel} /></box>
      <box> 
        <label label="" css="padding-left: 10px; margin-right: 7px" />
        <slider 
          widthRequest={260} 
          value={createBinding(microphone, "volume")} 
          onChangeValue={({ value }) => microphone.set_volume(value)} 
        />
        <label label={micLabel} /></box>
    </box>
  );
};

const AppLaunchers = () => (
  <box class="third-layer" spacing={20} halign={Gtk.Align.CENTER}>
    <button 
    onClicked={() => execAsync(["bash", "-c", "setsid piper &"]).catch(console.error)}>
      <label label="󰍽"/>
    </button>
    <button onClicked={() => execAsync(["bash", "-c", "setsid pavucontrol &"]).catch(console.error)}>
      <label label=" "/>
    </button>
    <button onClicked={() => execAsync(["bash", "-c", "setsid blueberry &"]).catch(console.error)}>
      <label label=""/>
    </button>
  </box>
);

const PowerControls = () => (
  <box class="fourth-layer" spacing={20} halign={Gtk.Align.CENTER}>
    <button onClicked={() => execAsync('loginctl terminate-session self').catch(console.error)}>
      <label label="󰍃"/>
    </button>
    <button onClicked={() => execAsync('systemctl suspend').catch(console.error)}>
      <label label="󰤄"/>
    </button>
    <button onClicked={() => execAsync('systemctl poweroff').catch(console.error)}>
      <label label="⏻"/>
    </button>
  </box>
);

export const ProfileWidget = () => (
  <window
    visible
    name="profile-window"
    class="profile-window"
    exclusivity={Astal.Exclusivity.IGNORE}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
    application={app}
    keymode={Astal.Keymode.ON_DEMAND}
    onDestroy={(self) => {
      self.destroy()
    }}
    $={(self) => {
      const drag = Gtk.GestureDrag.new()
      let startX = 0
      let startY = 0

      drag.connect("drag-begin", () => {
        startX = self.get_margin_left()
        startY = self.get_margin_top()
      })

      drag.connect("drag-update", (_, dx, dy) => {
        self.set_margin_left(Math.max(0, startX + dx))
        self.set_margin_top(Math.max(0, startY + dy))
      })

      drag.connect("drag-end", (_, dx, dy) => {
        setPosition({
          x: Math.max(0, startX + dx),
          y: Math.max(0, startY + dy),
        })

        const dragDistance = Math.sqrt(dx * dx + dy * dy)
        if(dragDistance > DRAG_THRESHOLD) {
          // console.log("Event drag-end")
          WindowManager.saveWindowPosition("notes")
        }
      })

      self.add_controller(drag)
    }}
  >
    <box orientation={Gtk.Orientation.VERTICAL} class="profile-popover-box" spacing={40}>
      <Header />
      <SystemMonitors />
      <AppLaunchers />
      <PowerControls />
    </box>
  </window>
);