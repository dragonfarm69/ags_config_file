import { Gtk, Gdk } from "ags/gtk4"
import Gio from "gi://Gio?version=2.0"
import GLib from "gi://GLib?version=2.0"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"
import { execAsync } from "ags/process"

export const WallpaperList = (folder: string) => {
    const allImages: string[] = [];
    const dir = Gio.File.new_for_path(folder);
    
    let currentPage = 0;
    const IMAGES_PER_PAGE = 9;

    // Load all image paths first
    const enumerator = dir.enumerate_children(
        "standard::name,standard::type",
        Gio.FileQueryInfoFlags.NONE,
        null
    );

    let info;
    while ((info = enumerator.next_file(null)) !== null) {
        const name = info.get_name();
        if (name.match(/\.(png|jpg|jpeg|webp)$/i)) {
            allImages.push(`${folder}/${name}`);
        }
    }

    const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);

    // Container for images
    const imageBox = new Gtk.FlowBox({
        column_spacing: 10,
        row_spacing: 10,
        max_children_per_line: 3,   // <-- 3 columns
        min_children_per_line: 3,   // <-- exactly 3 columns
        selection_mode: Gtk.SelectionMode.NONE,
        margin_top: 10,
        margin_bottom: 10,
        margin_start: 10,
        margin_end: 10,
        cssClasses: ["image-viewer-main"],
    });

    // Navigation buttons
    const prevButton = new Gtk.Button({
        label: "← Previous",
        sensitive: false,
        cssClasses: ["image-viewer-button"],
    });

    const nextButton = new Gtk.Button({
        label: "Next →",
        sensitive: totalPages > 1,
        cssClasses: ["image-viewer-button"],
    });

    const pageLabel = new Gtk.Label({
        label: `Page ${currentPage + 1} / ${totalPages} (${allImages.length} images)`,
        hexpand: true,
        cssClasses: ["image-viewer-label"],
    });

    function loadPage(page: number) {
        // Clear existing images
        let child = imageBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            imageBox.remove(child);
            child = next;
        }

        const start = page * IMAGES_PER_PAGE;
        const end = Math.min(start + IMAGES_PER_PAGE, allImages.length);

        // Load images for current page
        for (let i = start; i < end; i++) {
            const path = allImages[i];
            
            const frame = new Gtk.Frame({
                width_request: 200,
                height_request: 120,
            });

            const img = new Gtk.Picture({
                width_request: 200,
                height_request: 120,
                keep_aspect_ratio: true,
                can_shrink: true,
            });

            const button = new Gtk.Button({
                child: img,
                can_focus: false,
                can_target: true,
            });

            button.connect("clicked", () => {
                execAsync(['swww', 'img' , path])
                    .catch(err => console.error(`Failed to set wallpaper: ${err}`));
            });

            imageBox.append(button);

            // Load image asynchronously
            GLib.idle_add(GLib.PRIORITY_LOW, () => {
                try {
                    const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                        path,
                        200,
                        120,
                        true
                    );
                    const texture = Gdk.Texture.new_for_pixbuf(pixbuf);
                    img.set_paintable(texture);
                } catch (e) {
                    console.error(`Failed to load: ${path}`);
                }
                return GLib.SOURCE_REMOVE;
            });
        }

        // Update button states
        prevButton.set_sensitive(page > 0);
        nextButton.set_sensitive(page < totalPages - 1);
        pageLabel.set_label(`Page ${page + 1} / ${totalPages} (${allImages.length} images)`);
    }

    prevButton.connect("clicked", () => {
        if (currentPage > 0) {
            currentPage--;
            loadPage(currentPage);
        }
    });

    nextButton.connect("clicked", () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadPage(currentPage);
        }
    });

    // Navigation bar
    const navBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
    });

    navBox.append(prevButton);
    navBox.append(pageLabel);
    navBox.append(nextButton);

    const scrolled = new Gtk.ScrolledWindow({
        width_request: 1000,
        height_request: 600,
        child: imageBox,
        hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
        vscrollbar_policy: Gtk.PolicyType.NEVER,
    });

    const mainBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 0,
    });

    mainBox.append(scrolled);
    mainBox.append(navBox);

    // Load first page
    loadPage(0);

    return mainBox;
};