import { createPoll } from "ags/time";
import { readFile } from "ags/file";
import { createComputed } from "gnim";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib";
import Network from "gi://AstalNetwork";

// --- Basic Info ---
export const username = GLib.get_user_name();
export const distroName = (() => {
  try {
    const osRelease = readFile('/etc/os-release');
    const match = osRelease.match(/^PRETTY_NAME="(.+)"$/m);
    return match ? match[1] : 'Linux';
  } catch {
    return 'Linux';
  }
})();

// --- Network ---
export const wifi = Network.get_default().wifi;

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
export const downloadSpeed = createComputed((track) => track(netSpeed).down);
export const uploadSpeed = createComputed((track) => track(netSpeed).up);

// --- Memory ---
const memInfo = createPoll({ used: 0, total: 1 }, 2000, () => {
    try {
        const output = readFile(`/proc/meminfo`);
        const lines = output.split('\n');
        const mem: { [key: string]: number } = {};
        lines.forEach(line => {
            const parts = line.split(/\s+/);
            if (parts.length > 1) mem[parts[0].replace(':', '')] = parseInt(parts[1]);
        });
        const { MemTotal, MemFree, Buffers, Cached } = mem;
        return { used: MemTotal - MemFree - Buffers - Cached, total: MemTotal };
    } catch (e) {
        console.error(`Failed to get memory info: ${e}`);
        return { used: 0, total: 1 };
    }
});
export const usedRam = createComputed((track) => track(memInfo).used);
export const totalRam = createComputed((track) => track(memInfo).total);

// --- Disk ---
const diskInfo = createPoll({ used: 0, total: 1 }, 5000, () => {
    try {
        const file = Gio.File.new_for_path("/");
        const info = file.query_filesystem_info('filesystem::size,filesystem::free', null);
        const total = info.get_attribute_uint64('filesystem::size');
        const free = info.get_attribute_uint64('filesystem::free');
        return { used: total - free, total };
    } catch (e) {
        console.error(`Failed to get disk info: ${e}`);
        return { used: 0, total: 1 };
    }
});
export const usedDisk = createComputed((track) => track(diskInfo).used);
export const totalDisk = createComputed((track) => track(diskInfo).total);