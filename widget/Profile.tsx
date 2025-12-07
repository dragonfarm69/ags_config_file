import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"
import Network from "gi://AstalNetwork";
import { readFile } from "ags/file";
import { createPoll } from "ags/time";
import { createComputed } from "gnim";
import Gio from "gi://Gio?version=2.0";

const img = `file:///${GLib.get_home_dir()}/.config/ags/assets/test.png`

const network = Network.get_default();
const wifi = network.wifi;

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
    return `Download Speed: ${download_speed}`;
  });
  const uploadSpeedLabel = createComputed((track) => {
    const upload_speed = formatBytes(track(uploadSpeed))
    return `Upload Speed: ${upload_speed}`;
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

  return (
    <>
        <menubutton $type="end" hexpand halign={Gtk.Align.END}>   
            <box class="TimeBox">
                <label label={"TEST"}></label>
            </box>

            <popover>
              <box orientation={Gtk.Orientation.VERTICAL} class="profile-popover-box" spacing={40}>
                <box class="first-layer" spacing={20}>
                  <box>
                    <label class="profile_image" css={`background-image: url('${img}');`} />
                  </box>

                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label label={"SOMETHING"}/>
                    <label label={network.wifi.ssid}/>
                  </box>
                </box>

                <box class="second-layer" orientation={Gtk.Orientation.VERTICAL}>
                  <label label={"SECOND LAYER"}/>
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
                        maxValue={totalRam}
                        value={usedRam}
                      />
                      <label label={diskUsageLabel} css={`font-size: 20px;`}></label>
                    </box>

                  </box>
                  <box orientation={Gtk.Orientation.VERTICAL}>
                    <label label={downloadSpeedLabel} halign={Gtk.Align.START} ></label>
                    <label label={uploadSpeedLabel} halign={Gtk.Align.START} ></label>
                  </box>

                  
                </box>

                <box class="third-layer"> 
                  <label label={"THIRD LAYER"}></label>
                </box>

                <box class="fourth-layer"> 
                  <label label={"fourth LAYER"}></label>
                </box>
              
              </box>
          </popover>
        </menubutton>
    </>
  )
}