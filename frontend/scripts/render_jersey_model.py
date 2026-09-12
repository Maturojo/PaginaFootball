"""Render front and back previews of the exported jersey GLB for visual QA.

Run with Blender in background mode:
  blender --background --python scripts/render_jersey_model.py -- \
    public/models/jersey-base.glb preview-front.png preview-back.png [preview-side.png]
"""

from pathlib import Path
import math
import sys

import bpy
from mathutils import Vector


def look_at(camera, target):
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area_light(name, location, energy, size):
    data = bpy.data.lights.new(name=name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    look_at(light, (0.0, 0.0, -0.1))


def render_view(camera, location, output_path):
    camera.location = location
    look_at(camera, (0.0, 0.0, -0.15))
    bpy.context.scene.render.filepath = str(output_path)
    bpy.ops.render.render(write_still=True)


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) not in (3, 4):
        raise SystemExit("Expected GLB, front PNG, back PNG and optional side PNG paths")

    model_path, front_path, back_path = (Path(arg).resolve() for arg in args[:3])
    side_path = Path(args[3]).resolve() if len(args) == 4 else None
    front_path.parent.mkdir(parents=True, exist_ok=True)
    back_path.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(model_path))

    camera_data = bpy.data.cameras.new("ReviewCamera")
    camera_data.lens = 56
    camera = bpy.data.objects.new("ReviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    add_area_light("Key", (-3.6, -4.5, 4.2), 850, 4.0)
    add_area_light("Fill", (3.8, -2.8, 1.2), 480, 3.2)
    add_area_light("Rim", (0.0, 3.2, 3.8), 650, 3.0)

    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.008,
        0.012,
        0.02,
        1.0,
    )
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.22

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 680
    scene.render.resolution_y = 760
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"

    render_view(camera, (0.0, -6.6, -0.05), front_path)
    render_view(camera, (0.0, 6.6, -0.05), back_path)
    if side_path:
        side_path.parent.mkdir(parents=True, exist_ok=True)
        render_view(camera, (6.6, 0.0, -0.05), side_path)
    print(f"Rendered previews for {model_path}")


if __name__ == "__main__":
    main()
