"""Generate the reusable jersey GLB used by the React viewer.

Run with Blender in background mode:
  blender --background --python scripts/generate_jersey_model.py -- public/models/jersey-base.glb
"""

from pathlib import Path
import math
import sys

import bpy


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def material(name, color, roughness=0.72, preserve_uv=False):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = 0.0
    if preserve_uv:
        image = bpy.data.images.new(f"{name}UV", width=2, height=2, alpha=False)
        image.pixels = [*color, 1.0] * 4
        image.update()
        image.pack()
        texture = mat.node_tree.nodes.new("ShaderNodeTexImage")
        texture.image = image
        mat.node_tree.links.new(texture.outputs["Color"], principled.inputs["Base Color"])
    return mat


def half_width(v):
    if v < 0.35:
        t = v / 0.35
        return 1.04 + (0.92 - 1.04) * t
    if v < 0.76:
        t = (v - 0.35) / 0.41
        return 0.92 + (1.12 - 0.92) * t
    t = (v - 0.76) / 0.24
    return 1.12 + (1.18 - 1.12) * t


def panel_position(u, v, front):
    width = half_width(v)
    x = (u * 2.0 - 1.0) * width
    z = -1.52 + v * 2.62
    shoulder = max(0.0, (v - 0.76) / 0.24)
    z += shoulder * (0.10 - 0.18 * abs(x) / width)
    center_curve = max(0.0, 1.0 - (x / width) ** 2)
    edge_curve = math.sin(math.pi * v)
    if front:
        y = -0.27 - edge_curve * 0.045 - center_curve * (0.11 + 0.045 * v)
    else:
        y = 0.23 + edge_curve * 0.035 + center_curve * (0.06 + 0.02 * v)
    return x, y, z


def create_panel(name, front, mat, x_segments=64, z_segments=76):
    vertices = []
    uvs = []
    for iz in range(z_segments + 1):
        v = iz / z_segments
        for ix in range(x_segments + 1):
            u = ix / x_segments
            vertices.append(panel_position(u, v, front))
            uvs.append((u, v))

    faces = []
    for iz in range(z_segments):
        for ix in range(x_segments):
            a = iz * (x_segments + 1) + ix
            b = a + 1
            d = (iz + 1) * (x_segments + 1) + ix
            c = d + 1
            faces.append((a, b, c, d) if front else (d, c, b, a))

    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        uv_layer.data[loop.index].uv = uvs[loop.vertex_index]

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return obj


def create_side_panels(mat, z_segments=76):
    vertices = []
    uvs = []
    faces = []
    for side_index, u in enumerate((0.0, 1.0)):
        base = len(vertices)
        for iz in range(z_segments + 1):
            v = iz / z_segments
            vertices.append(panel_position(u, v, True))
            vertices.append(panel_position(u, v, False))
            uvs.extend(((0.0, v), (1.0, v)))
        for iz in range(z_segments):
            a = base + iz * 2
            b = a + 1
            c = a + 3
            d = a + 2
            faces.append((a, b, c, d) if side_index == 0 else (d, c, b, a))

    mesh = bpy.data.meshes.new("SidePanelsMesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        uv_layer.data[loop.index].uv = uvs[loop.vertex_index]
    obj = bpy.data.objects.new("SidePanels", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return obj


def create_sleeve(name, side, mat):
    sign = -1.0 if side == "left" else 1.0
    inner_top = 1.02 * sign
    outer_top = 1.82 * sign
    outer_bottom = 1.70 * sign
    inner_bottom = 1.08 * sign
    front_y, back_y = -0.33, 0.28
    front = [
        (inner_top, front_y, 1.03),
        (outer_top, front_y + 0.015, 0.80),
        (outer_bottom, front_y + 0.015, 0.30),
        (inner_bottom, front_y, 0.43),
    ]
    back = [(x, back_y, z) for x, _, z in front]
    vertices = front + back
    if side == "left":
        faces = [
            (0, 1, 2, 3), (7, 6, 5, 4),
            (0, 4, 5, 1), (1, 5, 6, 2),
            (2, 6, 7, 3), (3, 7, 4, 0),
        ]
    else:
        faces = [
            (3, 2, 1, 0), (4, 5, 6, 7),
            (1, 5, 4, 0), (2, 6, 5, 1),
            (3, 7, 6, 2), (0, 4, 7, 3),
        ]
    uvs = [
        (0.0, 1.0), (1.0, 1.0), (1.0, 0.0), (0.0, 0.0),
        (0.0, 1.0), (1.0, 1.0), (1.0, 0.0), (0.0, 0.0),
    ]
    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        uv_layer.data[loop.index].uv = uvs[loop.vertex_index]
    bevel = mesh.attributes.new("bevel_weight_edge", "FLOAT", "EDGE")
    for value in bevel.data:
        value.value = 0.35
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    modifier = obj.modifiers.new("Soft sleeve edges", "BEVEL")
    modifier.width = 0.035
    modifier.segments = 3
    modifier.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth_by_angle()
    obj.select_set(False)
    return obj


def create_curve_mesh(name, points, mat, bevel_depth, cyclic=False):
    curve = bpy.data.curves.new(f"{name}Curve", "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 2
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 3
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coords in zip(spline.bezier_points, points):
        point.co = coords
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.select_set(False)
    return obj


def create_neck_insert(mat):
    vertices = [(-0.50, -0.465, 1.08), (0.0, -0.49, 0.70), (0.50, -0.465, 1.08)]
    mesh = bpy.data.meshes.new("NeckInsertMesh")
    mesh.from_pydata(vertices, [], [(0, 1, 2)])
    mesh.update()
    obj = bpy.data.objects.new("NeckInsert", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def main():
    output_arg = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "public/models/jersey-base.glb"
    output_path = Path(output_arg).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    clear_scene()
    front_mat = material("FrontMaterial", (0.10, 0.18, 0.32), preserve_uv=True)
    back_mat = material("BackMaterial", (0.10, 0.18, 0.32), preserve_uv=True)
    side_mat = material("SideMaterial", (0.04, 0.07, 0.12), preserve_uv=True)
    sleeve_mat = material("SleeveMaterial", (0.08, 0.13, 0.24), preserve_uv=True)
    trim_mat = material("TrimMaterial", (0.75, 0.82, 0.92), 0.62)
    inner_mat = material("InnerMaterial", (0.015, 0.02, 0.035), 0.88)

    create_panel("TorsoFront", True, front_mat)
    create_panel("TorsoBack", False, back_mat)
    create_side_panels(side_mat)
    create_sleeve("SleeveLeft", "left", sleeve_mat)
    create_sleeve("SleeveRight", "right", sleeve_mat)
    create_neck_insert(inner_mat)
    create_curve_mesh(
        "Collar",
        [
            (-0.51, -0.48, 1.08), (0.0, -0.51, 0.69), (0.51, -0.48, 1.08),
            (0.54, 0.35, 1.08), (0.0, 0.40, 1.18), (-0.54, 0.35, 1.08),
        ],
        trim_mat,
        0.052,
        cyclic=True,
    )
    create_curve_mesh(
        "HemTrim",
        [(-1.03, -0.32, -1.43), (0.0, -0.43, -1.47), (1.03, -0.32, -1.43)],
        trim_mat,
        0.024,
    )

    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"Generated {output_path}")


if __name__ == "__main__":
    main()
