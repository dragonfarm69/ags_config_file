import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";
import { downloadSpeed, uploadSpeed } from "./services/System";

type NetGraphProps = {
  width?: number;
  height?: number;
  maxSamples?: number;
};

export const NetGraph = ({ width = 250, height = 70, maxSamples = 60 }: NetGraphProps) => {
    let downHistory = Array(maxSamples).fill(0);
    let upHistory = Array(maxSamples).fill(0);
    downloadSpeed.subscribe(() => area.queue_draw());
    uploadSpeed.subscribe(() => area.queue_draw());
    
    const area = new Gtk.DrawingArea({
        width_request: width,
        height_request: height,
    });

    const updateHistory = () => {
        downHistory.push(downloadSpeed.get());
        upHistory.push(uploadSpeed.get());
        if (downHistory.length > maxSamples) downHistory.shift();
        if (upHistory.length > maxSamples) upHistory.shift();
        area.queue_draw();
        return true;
    };

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, updateHistory);

    area.set_draw_func((_, cr, w, h) => {
    cr.setSourceRGBA(0.1, 0.1, 0.1, 0.5);
    cr.rectangle(0, 0, w, h);
    cr.fill();

    const maxValue = Math.max(...downHistory, ...upHistory, 1);
    const scale = (v: number) => h - (v / maxValue) * (h - 5);

    // Draw download line
    cr.setSourceRGBA(1, 0, 0, 1);
    cr.setLineWidth(2);
    downHistory.forEach((v, i) => {
        const x = (i / (maxSamples - 1)) * w;
        if (i === 0) cr.moveTo(x, scale(v));
        else cr.lineTo(x, scale(v));
    });
    cr.stroke();

    // Draw upload line
    cr.setSourceRGBA(0, 1, 0, 1);
    cr.setLineWidth(2);
    upHistory.forEach((v, i) => {
        const x = (i / (maxSamples - 1)) * w;
        if (i === 0) cr.moveTo(x, scale(v));
        else cr.lineTo(x, scale(v));
    });
    cr.stroke();
    });

    return area;
};