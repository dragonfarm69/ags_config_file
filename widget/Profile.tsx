import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"
import Network from "gi://AstalNetwork";
import { readFile } from "ags/file";
import { createPoll } from "ags/time";
import { createComputed } from "gnim";
import Gio from "gi://Gio?version=2.0";
import AstalWp from "gi://AstalWp"
import { createBinding } from "gnim";
import { exec, execAsync } from "ags/process";
import { Astal } from "ags/gtk4";
import app from "ags/gtk4/app";

const img = `file:///${GLib.get_home_dir()}/.config/ags/assets/Elizabeth.png`

const network = Network.get_default();
const wifi = network.wifi;
const { defaultSpeaker: speaker, defaultMicrophone: microphone } = AstalWp.get_default()!

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB/s`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB/s`;
}

export const ProfileWidget = () => {
  let prev_rx = 0;
  let prev_tx = 0;

  const netSpeed = createPoll({ down: 0, up: 0 }, 1000, () => {
    try {
        const output = readFile(`/proc/net/dev`);
        const line = output.split('\n').find(l => l.includes("wlo1"));
        if (!line) return { down: 0, up: 0 };

        const parts = line.trim().split(/\s+/);
        const rx = parseInt(parts[1]);
        const tx = parseInt(parts[9]);

        const down = rx - prev_rx;
        const up = tx - prev_tx;

        prev_rx = rx;
        prev_tx = tx;

        return { down, up };
    } catch (e) {
        console.error(`Failed to get network speed: ${e}`);
        return { down: 0, up: 0 };
    }
  });

  const memInfo = createPoll({ used: 0, total: 1 }, 2000, () => {
    try {
        const output = readFile(`/proc/meminfo`);
        const lines = output.split('\n');
        const mem: { [key: string]: number } = {};
        lines.forEach(line => {
            const parts = line.split(/\s+/);
            if (parts.length > 1) {
                mem[parts[0].replace(':', '')] = parseInt(parts[1]);
            }
        });

        const total = mem['MemTotal'];
        const free = mem['MemFree'];
        const buffers = mem['Buffers'];
        const cached = mem['Cached'];
        const used = total - free - buffers - cached;

        return { used, total };
    } catch (e) {
        console.error(`Failed to get memory info: ${e}`);
        return { used: 0, total: 1 };
    }
  });

  const diskInfo = createPoll({ used: 0, total: 1 }, 5000, () => {
    try {
        const file = Gio.File.new_for_path("/");
        const info = file.query_filesystem_info(
            'filesystem::size,filesystem::free',
            null
        );
        const total = info.get_attribute_uint64('filesystem::size');
        const free = info.get_attribute_uint64('filesystem::free');
        const used = total - free;
        return { used, total };
    } catch (e) {
        console.error(`Failed to get disk info: ${e}`);
        return { used: 0, total: 1 };
    }
  });

  const downloadSpeed = createComputed((track) => track(netSpeed).down);
  const uploadSpeed = createComputed((track) => track(netSpeed).up);

  const downloadSpeedLabel = createComputed((track) => {
    const download_speed = formatBytes(track(downloadSpeed));
    return `󰇚  ${download_speed}`;
  });
  const uploadSpeedLabel = createComputed((track) => {
    const upload_speed = formatBytes(track(uploadSpeed))
    return `󰕒  ${upload_speed}`;
  });

  const usedRam = createComputed((track) => track(memInfo).used);
  const totalRam = createComputed((track) => track(memInfo).total);

  const ramUsageLabel = createComputed((track) => {
      const { used, total } = track(memInfo);
      const usedGb = (used / 1024 / 1024).toFixed(1);
      const totalGb = (total / 1024 / 1024).toFixed(1);
      return `${usedGb}GB / ${totalGb}GB`;
  });

  const usedDisk = createComputed((track) => track(diskInfo).used);
  const totalDisk = createComputed((track) => track(diskInfo).total);

  const diskUsageLabel = createComputed((track) => {
    const usedGb = (track(usedDisk) / 1024 / 1024 / 1024).toFixed(1);
    const totalGb = (track(totalDisk) / 1024 / 1024 / 1024).toFixed(1);
    return `${usedGb}GB / ${totalGb}GB`;
  });

  const volumeLabel = createComputed((track) => {
    const volume = track(createBinding(speaker, "volume"));
    return `${Math.round(volume * 100)}%`;
  });

  const microphoneLabel = createComputed((track) => {
    const volume = track(createBinding(microphone, "volume"));
    return `${Math.round(volume * 100)}%`;
  });

  const username = GLib.get_user_name();

  const distroName = (() => {
    try {
      const osRelease = readFile('/etc/os-release');
      const match = osRelease.match(/^PRETTY_NAME="(.+)"$/m);
      return match ? match[1] : 'Linux';
    } catch (e) {
      console.error(`Failed to get distro name: ${e}`);
      return 'Linux';
    }
  })();

  const NetGraph = ({ width = 200, height = 60, maxSamples = 50 }) => {
    let downHistory = Array(maxSamples).fill(0);
    let upHistory = Array(maxSamples).fill(0);

    // Push new values when computed changes
    const updateHistory = () => {
        const down = downloadSpeed.get();
        const up = uploadSpeed.get();
        downHistory.push(down);
        upHistory.push(up);

        if (downHistory.length > maxSamples) downHistory.shift();
        if (upHistory.length > maxSamples) upHistory.shift();

        area.queue_draw();
        return true;
    };

    // Update every second
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, updateHistory);

    const area = new Gtk.DrawingArea({
        width_request: width,
        height_request: height,
    });

    area.set_draw_func((_, cr, w, h) => {
        // background
        cr.setSourceRGBA(0.1, 0.1, 0.1, 0.5);
        cr.rectangle(0, 0, w, h);
        cr.fill();

        const maxValue = Math.max(...downHistory, ...upHistory, 1);

        // Helper to scale values
        const scale = (v: number) => h - (v / maxValue) * (h - 5);

        // Draw download line
        cr.setSourceRGBA(1, 0, 0, 1);  
        cr.setLineWidth(2);

        downHistory.forEach((v, i) => {
            const x = (i / (maxSamples - 1)) * w;
            const y = scale(v);
            if (i === 0) cr.moveTo(x, y);
            else cr.lineTo(x, y);
        });
        cr.stroke();

        // Draw upload line
        cr.setSourceRGBA(0, 1, 0, 1);
        cr.setLineWidth(2);

        upHistory.forEach((v, i) => {
            const x = (i / (maxSamples - 1)) * w;
            const y = scale(v);
            if (i === 0) cr.moveTo(x, y);
            else cr.lineTo(x, y);
        });
        cr.stroke();
    });

    return area;
};

  return (
    <window
      visible
      name="profile-window"
      class="profile-window"
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      application={app}
    >
      <box orientation={Gtk.Orientation.VERTICAL} class="profile-popover-box" spacing={40}>
        <box class="first-layer" spacing={20}>
          <box>
            <label class="profile_image" css={`background-image: url('${img}');`} />
          </box>

          <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <label label={"󰣇  " + distroName} halign={Gtk.Align.START}/>
            <label label={"  " + username} halign={Gtk.Align.START}/>
            <label label={"   " + network.wifi.ssid} halign={Gtk.Align.START}/>
          </box>
        </box>

        <box class="second-layer" orientation={Gtk.Orientation.VERTICAL}>
          <box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
            <box>
              <levelbar
                orientation={Gtk.Orientation.HORIZONTAL}
                widthRequest={250}
                minValue={0}
                maxValue={totalRam}
                value={usedRam}
              />
              <label label={ramUsageLabel} css={`font-size: 20px;`}></label>
            </box>

            <box>
              <levelbar
                orientation={Gtk.Orientation.HORIZONTAL}
                widthRequest={250}
                minValue={0}
                maxValue={totalDisk}
                value={usedDisk}
              />
              <label label={diskUsageLabel} css={`font-size: 20px;`}></label>
            </box>

          </box>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <box spacing={10} class={"network-status"}>
              <box>
                  <NetGraph width={250} height={70} maxSamples={60} />
              </box>
              <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                <label class={"download-label"} label={downloadSpeedLabel} halign={Gtk.Align.START} ></label>
                <label class={"upload-label"} label={uploadSpeedLabel} halign={Gtk.Align.START} ></label>
              </box>
            </box>

            <box>
              <label label={" "} halign={Gtk.Align.START}/>
              <slider
                min={0}
                max={1.3}
                widthRequest={260}
                onChangeValue={({ value }) => {speaker.set_volume(value);}}
                value={createBinding(speaker, "volume")}
              />
              <label label={volumeLabel} halign={Gtk.Align.START} ></label>
            </box>  
            <box>
              <label label={""} halign={Gtk.Align.START} css={`padding-left: 10px; margin-right: 7px`}/>
              <slider
                min={0}
                max={1.3}
                widthRequest={260}
                onChangeValue={({ value }) => {microphone.set_volume(value);}}
                value={createBinding(microphone, "volume")}
              />
              <label label={microphoneLabel} halign={Gtk.Align.START} ></label>
            </box>
          </box>
        </box>

        <box class="third-layer" spacing={20} halign={Gtk.Align.CENTER}> 
          <button onClicked={() => {
            execAsync(["bash", "-c", "setsid piper >/dev/null 2>&1 < /dev/null &"])
              .catch(err => console.error("Error executing 'piper':", err));
            }}>
            <label label={"󰍽"}/>
          </button>
          <button onClicked={() => {
            execAsync(["bash", "-c", "setsid pavucontrol >/dev/null 2>&1 < /dev/null &"])
              .catch(err => console.error("Error executing 'pavucontrol':", err));
            }}>
            <label label={" "}/>
          </button>
          <button onClicked={() => {
            execAsync(["bash", "-c", "setsid blueberry >/dev/null 2>&1 < /dev/null &"])
              .catch(err => console.error("Error executing 'blueberry':", err));
            }}>
            <label label={""}/>
          </button>
        </box>

        <box class="fourth-layer" spacing={20} halign={Gtk.Align.CENTER}> 
          <button onClicked={() => execAsync('loginctl terminate-session self').catch(console.error)}>
            <label label={"󰍃"}/>
          </button>
          <button onClicked={() => execAsync('systemctl suspend').catch(console.error)}>
            <label label={"󰤄"}/>
          </button>
          <button onClicked={() => execAsync('systemctl poweroff').catch(console.error)}>
            <label label={"⏻"}/>
          </button>
        </box>
      </box>
    </window>
  )
}