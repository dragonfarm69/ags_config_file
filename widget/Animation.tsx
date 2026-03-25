import { Gtk } from "ags/gtk4"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"
import GLib from "gi://GLib"
import Gdk from "gi://Gdk?version=4.0"

export const AnimationWidget = () => {
  const desiredWidth = 400
  const desiredHeight = 600

  const anim = GdkPixbuf.PixbufAnimation.new_from_file(
    "/home/dragonfarm/.config/ags/assets/persona_3.gif",
  )
  const iter = anim.get_iter(null)

  const image = new Gtk.Picture({
    width_request: desiredWidth,
    height_request: desiredHeight,
  })

  image.set_content_fit(Gtk.ContentFit.FILL)

  const updateFrame = () => {
    const delay = iter.get_delay_time()
    iter.advance(null)

    const pixbuf = iter.get_pixbuf()

    if (pixbuf) {
      const scaled = pixbuf.scale_simple(
        desiredWidth,
        desiredHeight,
        GdkPixbuf.InterpType.NEAREST,
      )

      if (scaled) {
        image.set_paintable(Gdk.Texture.new_for_pixbuf(scaled))
      }
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, updateFrame)
    return false
  }

  updateFrame()

  return (
    <box width_request={desiredWidth} height_request={desiredHeight}>
      {image}
    </box>
  )
}
