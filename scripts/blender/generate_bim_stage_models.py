"""
G1211 吉黑高速（明水—北安段）Blender 5.0.1 4D BIM 分工序模型生成脚本
为进度管理「BIM进度模拟」4 个示范工程各生成 4 道工序（共 16 个 .glb）至 public/models/bim/：
  1. 桥梁示例A   : bim-bridge-s1..s4.glb   (场地准备 → 桩基施工 → 墩台施工 → 梁板架设)
  2. 梁场示例A   : bim-yard-s1..s4.glb     (台座硬化 → 龙门吊   → 批量预制 → 智能张拉出梁)
  3. 拌合站示例A : bim-plant-s1..s4.glb    (料仓地基 → 机组安装 → 标定试产 → 冬季保温)
  4. K18+400路基 : bim-subgrade-s1..s4.glb (表土剥离 → 分层填筑 → 边坡防护 → 路基交验)

坐标系约定：同对象 4 个工序共用原点 (0,0,0) 位于地面 Z=0，+X 为主轴方向，+Z 向上。
"""

import math
import os
import bpy
import bmesh
from mathutils import Vector, Matrix

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_DIR = os.path.join(REPO_ROOT, "public", "models", "bim")


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def create_material(name, rgba, roughness=0.75, metallic=0.0, emission_rgba=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    if getattr(mat, "node_tree", None) is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
    out = next((n for n in nodes if n.type == "OUTPUT_MATERIAL"), None)
    if bsdf is None:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    if out is None:
        out = nodes.new(type="ShaderNodeOutputMaterial")
    if not out.inputs["Surface"].is_linked:
        nt.links.new(bsdf.outputs[0], out.inputs[0])

    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission_rgba is not None and emission_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_rgba
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    mat.diffuse_color = rgba
    return mat


def build_materials():
    return {
        "asphalt": create_material("Mat_Asphalt", (0.045, 0.055, 0.072, 1.0), roughness=0.86, metallic=0.0),
        "concrete": create_material("Mat_Concrete", (0.64, 0.68, 0.72, 1.0), roughness=0.72, metallic=0.0),
        "concrete_dark": create_material("Mat_ConcreteDark", (0.36, 0.40, 0.46, 1.0), roughness=0.80, metallic=0.0),
        "lane_white": create_material(
            "Mat_LaneWhite",
            (0.95, 0.97, 1.00, 1.0),
            roughness=0.35,
            metallic=0.0,
            emission_rgba=(0.95, 0.97, 1.0, 1.0),
            emission_strength=0.18,
        ),
        "median_green": create_material("Mat_MedianGreen", (0.05, 0.42, 0.14, 1.0), roughness=0.68, metallic=0.0),
        "guardrail": create_material("Mat_Guardrail", (0.78, 0.83, 0.88, 1.0), roughness=0.36, metallic=0.30),
        "steel_yellow": create_material("Mat_SteelYellow", (0.88, 0.58, 0.04, 1.0), roughness=0.42, metallic=0.35),
        "shed_blue": create_material("Mat_ShedBlue", (0.04, 0.52, 0.76, 1.0), roughness=0.32, metallic=0.22),
        "steel_silver": create_material("Mat_SteelSilver", (0.72, 0.76, 0.82, 1.0), roughness=0.38, metallic=0.45),
        "gravel": create_material("Mat_Gravel", (0.48, 0.46, 0.42, 1.0), roughness=0.92, metallic=0.0),
        "earthwork": create_material("Mat_Earthwork", (0.46, 0.36, 0.24, 1.0), roughness=0.90, metallic=0.0),
        "black_soil": create_material("Mat_BlackSoil", (0.14, 0.12, 0.10, 1.0), roughness=0.94, metallic=0.0),
    }


def add_mesh_object(name, bm, mat):
    mesh = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def add_box(name, cx, cy, cz, sx, sy, sz, mat):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    bmesh.ops.translate(bm, vec=(cx, cy, cz), verts=bm.verts)
    return add_mesh_object(name, bm, mat)


def add_cylinder(name, cx, cy, z0, z1, radius, segments, mat):
    height = z1 - z0
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=height,
    )
    bmesh.ops.translate(bm, vec=(cx, cy, (z0 + z1) * 0.5), verts=bm.verts)
    return add_mesh_object(name, bm, mat)


def add_trapezoid_prism_x(name, x0, x1, y_bot_half, y_top_half, z_bot, z_top, mat):
    bm = bmesh.new()
    v0 = bm.verts.new((x0, -y_bot_half, z_bot))
    v1 = bm.verts.new((x0, y_bot_half, z_bot))
    v2 = bm.verts.new((x0, y_top_half, z_top))
    v3 = bm.verts.new((x0, -y_top_half, z_top))

    v4 = bm.verts.new((x1, -y_bot_half, z_bot))
    v5 = bm.verts.new((x1, y_bot_half, z_bot))
    v6 = bm.verts.new((x1, y_top_half, z_top))
    v7 = bm.verts.new((x1, -y_top_half, z_top))

    bm.faces.new((v0, v1, v2, v3))
    bm.faces.new((v7, v6, v5, v4))
    bm.faces.new((v0, v4, v5, v1))
    bm.faces.new((v1, v5, v6, v2))
    bm.faces.new((v2, v6, v7, v3))
    bm.faces.new((v3, v7, v4, v0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return add_mesh_object(name, bm, mat)


def add_sloped_abutment_x(name, x_bridge, x_toe, y_half_top, y_half_toe, z_top, mat):
    bm = bmesh.new()
    b0 = bm.verts.new((x_bridge, -y_half_toe, 0.0))
    b1 = bm.verts.new((x_bridge, y_half_toe, 0.0))
    t1 = bm.verts.new((x_bridge, y_half_top, z_top))
    t0 = bm.verts.new((x_bridge, -y_half_top, z_top))

    e0 = bm.verts.new((x_toe, -y_half_toe, 0.0))
    e1 = bm.verts.new((x_toe, y_half_toe, 0.0))
    et1 = bm.verts.new((x_toe, y_half_top, 0.35))
    et0 = bm.verts.new((x_toe, -y_half_top, 0.35))

    bm.faces.new((b0, b1, t1, t0))
    bm.faces.new((et0, et1, e1, e0))
    bm.faces.new((b0, e0, e1, b1))
    bm.faces.new((t0, t1, et1, et0))
    bm.faces.new((b1, e1, et1, t1))
    bm.faces.new((b0, t0, et0, e0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return add_mesh_object(name, bm, mat)


def add_pitched_roof(name, cx, cy, z_eave, z_ridge, sx, sy, mat):
    """沿 X 轴起脊的双坡屋顶。"""
    hx = sx * 0.5
    hy = sy * 0.5
    bm = bmesh.new()
    v0 = bm.verts.new((cx - hx, cy - hy, z_eave))
    v1 = bm.verts.new((cx + hx, cy - hy, z_eave))
    v2 = bm.verts.new((cx + hx, cy + hy, z_eave))
    v3 = bm.verts.new((cx - hx, cy + hy, z_eave))
    r0 = bm.verts.new((cx - hx, cy, z_ridge))
    r1 = bm.verts.new((cx + hx, cy, z_ridge))
    bm.faces.new((v0, v1, r1, r0))
    bm.faces.new((v1, v2, r1))
    bm.faces.new((v2, v3, r0, r1))
    bm.faces.new((v3, v0, r0))
    bm.faces.new((v0, v3, v2, v1))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return add_mesh_object(name, bm, mat)


def add_beam_between(name, p0, p1, width, height, mat):
    v0 = Vector(p0)
    v1 = Vector(p1)
    diff = v1 - v0
    length = diff.length
    if length < 1e-4:
        return None
    mid = (v0 + v1) * 0.5
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(length, width, height), verts=bm.verts)
    rot = diff.normalized().to_track_quat("X", "Z").to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation(mid) @ rot, verts=bm.verts)
    return add_mesh_object(name, bm, mat)


def export_glb(filename):
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, filename)
    kwargs = {
        "filepath": out_path,
        "export_format": "GLB",
        "export_yup": True,
        "export_apply": True,
        "export_materials": "EXPORT",
    }
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_yup=True, export_apply=True)
    size_kb = os.path.getsize(out_path) / 1024.0
    print(f"[EXPORTED] {out_path} ({size_kb:.1f} KB)")


# ── 1. 桥梁示例A（320m 6跨双向四车道大桥，4工序） ───────────────────────────
def build_bridge_stages():
    pier_xs = [-106.7, -53.3, 0.0, 53.3, 106.7]

    # S1: 场地准备（便道与施工平台）
    reset_scene()
    mats = build_materials()
    add_box("HaulRoad", 0.0, 17.5, 0.20, 356.0, 6.5, 0.40, mats["gravel"])
    for idx, px in enumerate(pier_xs):
        add_box(f"WorkPad_{idx}", px, 0.0, 0.22, 16.0, 30.0, 0.44, mats["gravel"])
    add_box("WorkPad_AbutL", -166.0, 0.0, 0.25, 22.0, 32.0, 0.50, mats["gravel"])
    add_box("WorkPad_AbutR", 166.0, 0.0, 0.25, 22.0, 32.0, 0.50, mats["gravel"])
    export_glb("bim-bridge-s1.glb")

    # S2: 桩基施工（48根钻孔灌注桩桩头与承台）
    reset_scene()
    mats = build_materials()
    for idx, px in enumerate(pier_xs):
        for side, py in (("L", 6.5), ("R", -6.5)):
            add_box(f"Cap_{idx}_{side}", px, py, 0.70, 5.2, 5.2, 1.40, mats["concrete_dark"])
            for ox in (-1.35, 1.35):
                for oy in (-1.35, 1.35):
                    add_cylinder(f"Pile_{idx}_{side}_{ox}_{oy}", px + ox, py + oy, 0.0, 1.85, 0.62, 10, mats["concrete"])
    add_box("AbutBaseL", -158.0, 0.0, 0.75, 4.8, 25.8, 1.50, mats["concrete_dark"])
    add_box("AbutBaseR", 158.0, 0.0, 0.75, 4.8, 25.8, 1.50, mats["concrete_dark"])
    export_glb("bim-bridge-s2.glb")

    # S3: 墩台施工（双柱墩、盖梁、桥台与锥坡）
    reset_scene()
    mats = build_materials()
    for idx, px in enumerate(pier_xs):
        add_box(f"PierCap_{idx}", px, 0.0, 10.15, 3.0, 22.8, 1.25, mats["concrete"])
        for side, py in (("L", 6.5), ("R", -6.5)):
            add_cylinder(f"PierCol_{idx}_{side}", px, py, 1.35, 9.6, 1.25, 16, mats["concrete_dark"])
    add_box("AbutWallL", -158.0, 0.0, 6.0, 4.0, 24.8, 9.2, mats["concrete_dark"])
    add_box("AbutWallR", 158.0, 0.0, 6.0, 4.0, 24.8, 9.2, mats["concrete_dark"])
    add_sloped_abutment_x("ApproachL", -160.0, -182.0, 12.6, 16.8, 13.8, mats["gravel"])
    add_sloped_abutment_x("ApproachR", 160.0, 182.0, 12.6, 16.8, 13.8, mats["gravel"])
    export_glb("bim-bridge-s3.glb")

    # S4: 梁板架设（箱梁、四车道沥青桥面、标线、隔离带、护栏）
    reset_scene()
    mats = build_materials()
    deck_z = 14.0
    add_trapezoid_prism_x("BoxGirder", -160.0, 160.0, 9.6, 12.9, 10.6, 13.6, mats["concrete"])
    add_box("BridgeAsphalt", 0.0, 0.0, deck_z - 0.2, 320.0, 24.4, 0.4, mats["asphalt"])
    add_box("MedianCurb", 0.0, 0.0, deck_z + 0.35, 320.0, 1.8, 0.70, mats["concrete"])
    add_box("MedianGreen", 0.0, 0.0, deck_z + 0.73, 320.0, 1.1, 0.10, mats["median_green"])
    add_box("RailL", 0.0, 12.68, deck_z + 0.45, 320.0, 0.55, 0.90, mats["guardrail"])
    add_box("RailR", 0.0, -12.68, deck_z + 0.45, 320.0, 0.55, 0.90, mats["guardrail"])
    for idx, y_pos in enumerate((-11.2, -1.45, 1.45, 11.2)):
        add_box(f"SolidLine_{idx}", 0.0, y_pos, deck_z + 0.04, 320.0, 0.28, 0.04, mats["lane_white"])
    bm_dash = bmesh.new()
    x_cur = -157.0
    while x_cur + 6.0 <= 158.0:
        for y_dash in (-6.3, 6.3):
            res = bmesh.ops.create_cube(bm_dash, size=1.0)
            bmesh.ops.scale(bm_dash, vec=(6.0, 0.26, 0.04), verts=res["verts"])
            bmesh.ops.translate(bm_dash, vec=(x_cur + 3.0, y_dash, deck_z + 0.04), verts=res["verts"])
        x_cur += 15.0
    add_mesh_object("DashedLines", bm_dash, mats["lane_white"])
    export_glb("bim-bridge-s4.glb")


# ── 2. 梁场示例A（180m × 110m 智慧梁场，4工序） ──────────────────────────────
def build_beam_yard_stages():
    # S1: 台座基础硬化
    reset_scene()
    mats = build_materials()
    add_box("YardSlab", 0.0, 0.0, 0.28, 180.0, 110.0, 0.56, mats["concrete_dark"])
    add_box("YardApron", 0.0, 0.0, 0.58, 174.0, 102.0, 0.08, mats["concrete"])
    for row_y in (-16.0, -6.0, 6.0, 16.0):
        for col_x in (-56.0, -18.0, 20.0):
            add_box(f"Pedestal_{row_y}_{col_x}", col_x, row_y, 0.85, 30.0, 2.2, 0.50, mats["concrete"])
    export_glb("bim-yard-s1.glb")

    # S2: 龙门吊拼装检定（轨道 + 2 台双80t 龙门吊）
    reset_scene()
    mats = build_materials()
    for ry in (-26.0, 26.0):
        add_box(f"CraneTrack_{ry}", -12.0, ry, 0.82, 146.0, 1.2, 0.52, mats["steel_silver"])
    for gx in (-44.0, 12.0):
        for sy in (-26.0, 26.0):
            add_beam_between(f"LegA_{gx}_{sy}", (gx - 3.0, sy, 1.0), (gx, sy, 16.0), 1.0, 1.0, mats["steel_yellow"])
            add_beam_between(f"LegB_{gx}_{sy}", (gx + 3.0, sy, 1.0), (gx, sy, 16.0), 1.0, 1.0, mats["steel_yellow"])
        add_box(f"CraneGirderA_{gx}", gx - 1.2, 0.0, 16.6, 1.1, 56.0, 1.8, mats["steel_yellow"])
        add_box(f"CraneGirderB_{gx}", gx + 1.2, 0.0, 16.6, 1.1, 56.0, 1.8, mats["steel_yellow"])
        add_box(f"Trolley_{gx}", gx, 4.0, 18.0, 3.8, 4.5, 1.6, mats["shed_blue"])
    export_glb("bim-yard-s2.glb")

    # S3: 箱梁批量预制（12片台座梁 + 4片存梁区成品箱梁）
    reset_scene()
    mats = build_materials()
    for row_y in (-16.0, -6.0, 6.0, 16.0):
        for col_x in (-56.0, -18.0, 20.0):
            add_box(f"PrecastBeam_{row_y}_{col_x}", col_x, row_y, 2.0, 28.5, 2.4, 1.8, mats["concrete"])
    for sy in (-38.0, -33.5, 33.5, 38.0):
        add_box(f"StoredBeam_{sy}", -18.0, sy, 1.6, 28.5, 2.4, 1.9, mats["concrete"])
    export_glb("bim-yard-s3.glb")

    # S4: 智能张拉与出梁（喷淋养护大棚 + 控制楼 + 运梁通道）
    reset_scene()
    mats = build_materials()
    for sx in (58.0,):
        for sy in (-16.0, 16.0):
            for cx in (sx - 18.0, sx, sx + 18.0):
                for cy in (sy - 11.0, sy + 11.0):
                    add_cylinder(f"ShedCol_{sx}_{sy}_{cx}_{cy}", cx, cy, 0.6, 7.6, 0.4, 10, mats["steel_silver"])
            add_pitched_roof(f"TensionShed_{sx}_{sy}", sx, sy, 7.6, 9.8, 42.0, 24.0, mats["shed_blue"])
    add_box("ControlHouse", 66.0, -40.0, 3.8, 20.0, 12.0, 6.4, mats["concrete"])
    add_box("ControlRoof", 66.0, -40.0, 7.2, 21.0, 13.0, 0.5, mats["shed_blue"])
    add_box("HaulApron", 58.0, 0.0, 0.68, 46.0, 12.0, 0.25, mats["asphalt"])
    export_glb("bim-yard-s4.glb")


# ── 3. 拌合站示例A（140m × 95m 封闭式智能拌合站，4工序） ─────────────────────
def build_batch_plant_stages():
    # S1: 料仓地基施工
    reset_scene()
    mats = build_materials()
    add_box("PlantSlab", 0.0, 0.0, 0.28, 140.0, 95.0, 0.56, mats["concrete_dark"])
    for wx in (-56.0, -42.0, -28.0, -14.0, 0.0):
        add_box(f"BinWall_{wx}", wx, 24.0, 2.2, 0.9, 28.0, 3.3, mats["concrete"])
    add_box("BinBackWall", -28.0, 38.0, 2.2, 57.0, 0.9, 3.3, mats["concrete"])
    add_box("TowerPlinthA", 20.0, 0.0, 0.85, 16.0, 16.0, 0.6, mats["concrete"])
    add_box("TowerPlinthB", 42.0, 0.0, 0.85, 16.0, 16.0, 0.6, mats["concrete"])
    export_glb("bim-plant-s1.glb")

    # S2: HZS180 机组安装（双主楼 + 6座粉料罐）
    reset_scene()
    mats = build_materials()
    for tx in (20.0, 42.0):
        add_box(f"MixTower_{tx}", tx, 0.0, 10.0, 12.0, 12.0, 18.0, mats["steel_silver"])
        add_box(f"MixTop_{tx}", tx, 0.0, 19.6, 13.0, 13.0, 1.2, mats["shed_blue"])
    for sx in (15.0, 25.0, 37.0, 47.0):
        for sy in (16.0,):
            add_cylinder(f"Silo_{sx}_{sy}", sx, sy, 4.2, 22.0, 2.6, 16, mats["concrete"])
            add_cylinder(f"SiloSkirt_{sx}_{sy}", sx, sy, 0.6, 4.2, 2.1, 12, mats["concrete_dark"])
    for sx in (20.0, 42.0):
        add_cylinder(f"SiloBack_{sx}", sx, 25.0, 4.2, 22.0, 2.6, 16, mats["concrete"])
        add_cylinder(f"SiloBackSkirt_{sx}", sx, 25.0, 0.6, 4.2, 2.1, 12, mats["concrete_dark"])
    add_box("SiloWalkway", 31.0, 18.0, 22.3, 38.0, 12.0, 0.45, mats["steel_silver"])
    export_glb("bim-plant-s2.glb")

    # S3: 标定试生产（斜皮带输送走廊 + 中控室 + 过磅出料区）
    reset_scene()
    mats = build_materials()
    add_beam_between("ConveyorA", (-12.0, 18.0, 2.6), (20.0, 2.0, 15.0), 3.2, 2.4, mats["steel_yellow"])
    add_beam_between("ConveyorB", (-4.0, 18.0, 2.6), (42.0, 2.0, 15.0), 3.2, 2.4, mats["steel_yellow"])
    add_box("ControlRoom", 30.0, -26.0, 3.2, 20.0, 11.0, 5.2, mats["concrete"])
    add_box("ControlTrim", 30.0, -26.0, 6.0, 20.8, 11.8, 0.5, mats["shed_blue"])
    add_box("Weighbridge", 31.0, -11.0, 0.72, 44.0, 7.5, 0.32, mats["asphalt"])
    export_glb("bim-plant-s3.glb")

    # S4: 冬季保温供料（全封闭料仓大棚 + 蒸汽锅炉房 + 保温接料棚）
    reset_scene()
    mats = build_materials()
    add_box("BinWallL", -56.5, 24.0, 4.8, 0.8, 30.0, 8.4, mats["steel_silver"])
    add_box("BinWallR", 0.5, 24.0, 4.8, 0.8, 30.0, 8.4, mats["steel_silver"])
    add_box("BinWallBack", -28.0, 38.6, 4.8, 57.5, 0.8, 8.4, mats["steel_silver"])
    add_pitched_roof("BinCanopy", -28.0, 24.0, 9.0, 12.0, 59.0, 32.0, mats["shed_blue"])
    add_box("BoilerHouse", -34.0, -24.0, 3.6, 22.0, 14.0, 6.0, mats["concrete"])
    add_pitched_roof("BoilerRoof", -34.0, -24.0, 6.6, 8.2, 23.0, 15.0, mats["shed_blue"])
    export_glb("bim-plant-s4.glb")


# ── 4. 一工区 K18+400 路基（360m 试验段，4工序） ──────────────────────────────
def build_subgrade_stages():
    # S1: 黑土表土剥离（清表基底 + 集中堆土场）
    reset_scene()
    mats = build_materials()
    add_box("ClearedStrip", 0.0, 0.0, 0.28, 360.0, 42.0, 0.56, mats["gravel"])
    for mx in (-110.0, 0.0, 110.0):
        add_trapezoid_prism_x(f"BlackSoilMound_{mx}", mx - 38.0, mx + 38.0, 9.0, 5.5, 0.0, 3.4, mats["black_soil"])
    export_glb("bim-subgrade-s1.glb")

    # S2: 路基分层填筑（梯形土石方路堤）
    reset_scene()
    mats = build_materials()
    add_trapezoid_prism_x("EmbankmentBody", -180.0, 180.0, 19.0, 13.0, 0.56, 4.20, mats["earthwork"])
    export_glb("bim-subgrade-s2.glb")

    # S3: 边坡防护砌筑（两侧护坡混凝土肋 + 排水边沟）
    reset_scene()
    mats = build_materials()
    for sx in range(-165, 166, 30):
        for side, sy_top, sy_bot in (("L", 13.0, 19.0), ("R", -13.0, -19.0)):
            add_beam_between(f"SlopeRib_{sx}_{side}", (sx, sy_top, 4.18), (sx, sy_bot, 0.62), 1.4, 0.45, mats["concrete"])
    for side, sy in (("L", 20.2), ("R", -20.2)):
        add_box(f"DrainDitch_{side}", 0.0, sy, 0.55, 360.0, 1.8, 0.55, mats["concrete"])
    export_glb("bim-subgrade-s3.glb")

    # S4: 路基交验移交（26m 四车道路面基层/沥青试验面 + 护栏标线）
    reset_scene()
    mats = build_materials()
    deck_z = 4.60
    add_box("SubgradeSurface", 0.0, 0.0, deck_z - 0.2, 360.0, 24.6, 0.4, mats["asphalt"])
    add_box("MedianCurb", 0.0, 0.0, deck_z + 0.30, 360.0, 1.8, 0.60, mats["concrete"])
    add_box("MedianGreen", 0.0, 0.0, deck_z + 0.63, 360.0, 1.1, 0.10, mats["median_green"])
    add_box("RailL", 0.0, 12.68, deck_z + 0.40, 360.0, 0.50, 0.80, mats["guardrail"])
    add_box("RailR", 0.0, -12.68, deck_z + 0.40, 360.0, 0.50, 0.80, mats["guardrail"])
    for idx, y_pos in enumerate((-11.2, -1.45, 1.45, 11.2)):
        add_box(f"SolidLine_{idx}", 0.0, y_pos, deck_z + 0.04, 360.0, 0.28, 0.04, mats["lane_white"])
    bm_dash = bmesh.new()
    x_cur = -175.0
    while x_cur + 6.0 <= 176.0:
        for y_dash in (-6.3, 6.3):
            res = bmesh.ops.create_cube(bm_dash, size=1.0)
            bmesh.ops.scale(bm_dash, vec=(6.0, 0.26, 0.04), verts=res["verts"])
            bmesh.ops.translate(bm_dash, vec=(x_cur + 3.0, y_dash, deck_z + 0.04), verts=res["verts"])
        x_cur += 15.0
    add_mesh_object("DashedLines", bm_dash, mats["lane_white"])
    export_glb("bim-subgrade-s4.glb")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    build_bridge_stages()
    build_beam_yard_stages()
    build_batch_plant_stages()
    build_subgrade_stages()
    print("[DONE] All 16 staged 4D BIM GLB models generated successfully.")


if __name__ == "__main__":
    main()
