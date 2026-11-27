"""
G1211 吉黑高速（明水—北安段）Blender 5.0.1 无头参数化建模脚本
生成 5 套轻量级低模 .glb 模板至 public/models/：
  1. bridge-large.glb        (320m 6跨双向四车道大桥)
  2. bridge-medium.glb       (120m 3跨双向四车道中桥)
  3. bridge-small.glb        (48m 单跨双向四车道小桥)
  4. interchange-hub.glb     (420m×420m 双向四车道枢纽互通立交)
  5. interchange-trumpet.glb (420m×260m 单喇叭互通 + 匝道收费站)

坐标系约定（严格匹配 CesiumJS ENU）：
  - 原点 (0, 0, 0) 位于中心线正下方地面 (Z=0)
  - +X 为主线前进方向，Y 为横断面方向（路基宽 26m，Y∈[-13, 13]），+Z 向上
"""

import math
import os
import bpy
import bmesh
from mathutils import Vector, Matrix

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_DIR = os.path.join(REPO_ROOT, "public", "models")


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
        "asphalt": create_material("Mat_Asphalt", (0.032, 0.040, 0.052, 1.0), roughness=0.88, metallic=0.0),
        "concrete": create_material("Mat_Concrete", (0.52, 0.56, 0.61, 1.0), roughness=0.72, metallic=0.0),
        "concrete_dark": create_material("Mat_ConcreteDark", (0.26, 0.30, 0.35, 1.0), roughness=0.80, metallic=0.0),
        "lane_white": create_material(
            "Mat_LaneWhite",
            (0.95, 0.97, 1.00, 1.0),
            roughness=0.35,
            metallic=0.0,
            emission_rgba=(0.95, 0.97, 1.0, 1.0),
            emission_strength=0.22,
        ),
        "median_green": create_material(
            "Mat_MedianGreen",
            (0.035, 0.36, 0.11, 1.0),
            roughness=0.68,
            metallic=0.0,
            emission_rgba=(0.04, 0.32, 0.10, 1.0),
            emission_strength=0.08,
        ),
        "guardrail": create_material("Mat_Guardrail", (0.74, 0.79, 0.85, 1.0), roughness=0.38, metallic=0.25),
        "toll_cyan": create_material(
            "Mat_TollCyan",
            (0.015, 0.56, 0.78, 1.0),
            roughness=0.28,
            metallic=0.15,
            emission_rgba=(0.02, 0.55, 0.78, 1.0),
            emission_strength=0.25,
        ),
        "embankment": create_material("Mat_Embankment", (0.36, 0.40, 0.44, 1.0), roughness=0.88, metallic=0.0),
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
    """沿 X 轴的梯形断面棱柱（用于箱梁、斜坡路堤、桥台）。"""
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
    """桥头锥坡/台背回填棱台（沿 X 方向由桥台顶坡降至地面 Z=0）。"""
    bm = bmesh.new()
    # Bridge-end face (vertical)
    b0 = bm.verts.new((x_bridge, -y_half_toe, 0.0))
    b1 = bm.verts.new((x_bridge, y_half_toe, 0.0))
    t1 = bm.verts.new((x_bridge, y_half_top, z_top))
    t0 = bm.verts.new((x_bridge, -y_half_top, z_top))
    # Toe-end face (low ramp to ground)
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


def add_ribbon_along_points(name, points_xyz, width, thickness, mat_deck, mat_rail=None, rail_height=0.85, solid_center_line=False, mat_line=None):
    """
    沿 3D 中心线路径扫掠生成平整道路/匝道带面（含底板厚度、可选护栏与中心标线）。
    points_xyz: [(x, y, z), ...] 为顶面中心线坐标。
    """
    n = len(points_xyz)
    if n < 2:
        return
    half_w = width * 0.5
    pts = [Vector(p) for p in points_xyz]

    def tangent_at(idx):
        if idx == 0:
            t = pts[1] - pts[0]
        elif idx == n - 1:
            t = pts[-1] - pts[-2]
        else:
            t = pts[idx + 1] - pts[idx - 1]
        t_xy = Vector((t.x, t.y, 0.0))
        if t_xy.length < 1e-6:
            return Vector((1.0, 0.0, 0.0))
        return t_xy.normalized()

    bm = bmesh.new()
    rings = []
    for i, p in enumerate(pts):
        tan = tangent_at(i)
        right = Vector((-tan.y, tan.x, 0.0))
        tl = bm.verts.new(p - right * half_w)
        tr = bm.verts.new(p + right * half_w)
        br = bm.verts.new(p + right * half_w - Vector((0.0, 0.0, thickness)))
        bl = bm.verts.new(p - right * half_w - Vector((0.0, 0.0, thickness)))
        rings.append((tl, tr, br, bl))

    # Caps
    bm.faces.new((rings[0][0], rings[0][3], rings[0][2], rings[0][1]))
    bm.faces.new((rings[-1][0], rings[-1][1], rings[-1][2], rings[-1][3]))
    for i in range(n - 1):
        a = rings[i]
        b = rings[i + 1]
        bm.faces.new((a[0], a[1], b[1], b[0]))  # top
        bm.faces.new((a[1], a[2], b[2], b[1]))  # right
        bm.faces.new((a[2], a[3], b[3], b[2]))  # bottom
        bm.faces.new((a[3], a[0], b[0], b[3]))  # left
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    add_mesh_object(name, bm, mat_deck)

    if mat_rail is not None:
        rail_w = 0.45
        for side_name, sign in (("L", -1.0), ("R", 1.0)):
            bm_r = bmesh.new()
            r_rings = []
            for i, p in enumerate(pts):
                tan = tangent_at(i)
                right = Vector((-tan.y, tan.x, 0.0))
                offset = right * (sign * (half_w - rail_w * 0.6))
                c_top = p + offset + Vector((0.0, 0.0, rail_height))
                c_bot = p + offset
                r_rings.append((
                    bm_r.verts.new(c_top - right * (rail_w * 0.5)),
                    bm_r.verts.new(c_top + right * (rail_w * 0.5)),
                    bm_r.verts.new(c_bot + right * (rail_w * 0.5)),
                    bm_r.verts.new(c_bot - right * (rail_w * 0.5)),
                ))
            bm_r.faces.new((r_rings[0][0], r_rings[0][3], r_rings[0][2], r_rings[0][1]))
            bm_r.faces.new((r_rings[-1][0], r_rings[-1][1], r_rings[-1][2], r_rings[-1][3]))
            for i in range(n - 1):
                a = r_rings[i]
                b = r_rings[i + 1]
                bm_r.faces.new((a[0], a[1], b[1], b[0]))
                bm_r.faces.new((a[1], a[2], b[2], b[1]))
                bm_r.faces.new((a[2], a[3], b[3], b[2]))
                bm_r.faces.new((a[3], a[0], b[0], b[3]))
            bmesh.ops.recalc_face_normals(bm_r, faces=bm_r.faces)
            add_mesh_object(f"{name}_Rail_{side_name}", bm_r, mat_rail)

    if solid_center_line and mat_line is not None:
        # 匝道边线或分隔线
        for line_name, lat_off in (("EdgeL", -half_w + 0.8), ("EdgeR", half_w - 0.8)):
            bm_l = bmesh.new()
            l_rings = []
            for i, p in enumerate(pts):
                tan = tangent_at(i)
                right = Vector((-tan.y, tan.x, 0.0))
                c = p + right * lat_off + Vector((0.0, 0.0, 0.04))
                l_rings.append((
                    bm_l.verts.new(c - right * 0.14),
                    bm_l.verts.new(c + right * 0.14),
                ))
            for i in range(n - 1):
                a = l_rings[i]
                b = l_rings[i + 1]
                bm_l.faces.new((a[0], a[1], b[1], b[0]))
            bmesh.ops.recalc_face_normals(bm_l, faces=bm_l.faces)
            add_mesh_object(f"{name}_{line_name}", bm_l, mat_line)


def add_four_lane_markings_x(prefix, x_start, x_end, deck_z, mats, include_median=True, include_guardrails=True, half_width=13.0):
    """在沿 X 轴的 26m 宽双向四车道桥/路面上铺设标线、中央隔离带与防撞护栏。"""
    length = x_end - x_start
    cx = (x_start + x_end) * 0.5
    line_z = deck_z + 0.04

    # 中央隔离带 (路缘石 + 绿带)
    if include_median:
        add_box(f"{prefix}_MedianCurb", cx, 0.0, deck_z + 0.35, length, 1.8, 0.70, mats["concrete"])
        add_box(f"{prefix}_MedianGreen", cx, 0.0, deck_z + 0.73, length, 1.1, 0.10, mats["median_green"])

    # 左右防撞护栏
    if include_guardrails:
        rail_y = half_width - 0.32
        add_box(f"{prefix}_RailL", cx, rail_y, deck_z + 0.45, length, 0.55, 0.90, mats["guardrail"])
        add_box(f"{prefix}_RailR", cx, -rail_y, deck_z + 0.45, length, 0.55, 0.90, mats["guardrail"])

    # 4 条实线（中央分隔带两侧缘线 + 两侧行车道外缘线）
    for idx, y_pos in enumerate((-11.2, -1.45, 1.45, 11.2)):
        if abs(y_pos) < half_width - 0.8:
            add_box(f"{prefix}_SolidLine_{idx}", cx, y_pos, line_z, length, 0.28, 0.04, mats["lane_white"])

    # 双向各 1 条虚线（分隔同向两车道）—— 合并到一个 Mesh 以减少 DrawCall
    bm_dash = bmesh.new()
    dash_len = 6.0
    gap_len = 9.0
    step = dash_len + gap_len
    x_cur = x_start + 3.0
    while x_cur + dash_len <= x_end - 2.0:
        for y_dash in (-6.3, 6.3):
            if abs(y_dash) < half_width - 1.5:
                res = bmesh.ops.create_cube(bm_dash, size=1.0)
                bmesh.ops.scale(bm_dash, vec=(dash_len, 0.26, 0.04), verts=res["verts"])
                bmesh.ops.translate(bm_dash, vec=(x_cur + dash_len * 0.5, y_dash, line_z), verts=res["verts"])
        x_cur += step
    if len(bm_dash.verts) > 0:
        add_mesh_object(f"{prefix}_DashedLines", bm_dash, mats["lane_white"])
    else:
        bm_dash.free()


def build_bridge_template(filename, total_len, deck_z, pier_xs, is_slab=False):
    reset_scene()
    mats = build_materials()
    half_l = total_len * 0.5
    half_w = 13.0  # 26m 路基宽

    if is_slab:
        # 简支板桥上部结构
        add_box("BridgeSlab", 0.0, 0.0, deck_z - 1.1, total_len, 26.0, 1.4, mats["concrete"])
        add_box("BridgeAsphalt", 0.0, 0.0, deck_z - 0.2, total_len, 24.4, 0.4, mats["asphalt"])
        # 两端八字墙/斜坡桥台
        add_box("AbutmentL", -half_l + 1.5, 0.0, (deck_z - 1.4) * 0.5, 3.0, 25.6, deck_z - 1.4, mats["concrete_dark"])
        add_box("AbutmentR", half_l - 1.5, 0.0, (deck_z - 1.4) * 0.5, 3.0, 25.6, deck_z - 1.4, mats["concrete_dark"])
        add_sloped_abutment_x("ApproachL", -half_l, -half_l - 12.0, 12.6, 15.5, deck_z - 0.1, mats["embankment"])
        add_sloped_abutment_x("ApproachR", half_l, half_l + 12.0, 12.6, 15.5, deck_z - 0.1, mats["embankment"])
    else:
        # 预应力混凝土梯形箱梁 + 翼缘板 + 沥青桥面
        girder_bot = deck_z - 3.4
        girder_top = deck_z - 0.4
        add_trapezoid_prism_x("BoxGirder", -half_l, half_l, 9.6, 12.9, girder_bot, girder_top, mats["concrete"])
        add_box("BridgeAsphalt", 0.0, 0.0, deck_z - 0.2, total_len, 24.4, 0.4, mats["asphalt"])

        # 双柱式桥墩 + 承台 + 盖梁
        cap_bot = girder_bot - 1.2
        cap_top = girder_bot + 0.05
        for idx, px in enumerate(pier_xs):
            add_box(f"PierCap_{idx}", px, 0.0, (cap_bot + cap_top) * 0.5, 3.0, 22.8, cap_top - cap_bot, mats["concrete"])
            for side, py in (("L", 6.5), ("R", -6.5)):
                add_cylinder(f"PierCol_{idx}_{side}", px, py, 0.9, cap_bot + 0.1, 1.25, 16, mats["concrete_dark"])
                add_box(f"PierFooting_{idx}_{side}", px, py, 0.5, 4.2, 4.2, 1.0, mats["concrete_dark"])

        # 两端桥台及台后锥坡
        abut_len = 4.0
        add_box("AbutmentL", -half_l + abut_len * 0.5, 0.0, girder_bot * 0.5, abut_len, 24.8, girder_bot, mats["concrete_dark"])
        add_box("AbutmentR", half_l - abut_len * 0.5, 0.0, girder_bot * 0.5, abut_len, 24.8, girder_bot, mats["concrete_dark"])
        approach_len = 22.0 if total_len > 200 else 16.0
        add_sloped_abutment_x("ApproachL", -half_l, -half_l - approach_len, 12.6, 16.8, deck_z - 0.1, mats["embankment"])
        add_sloped_abutment_x("ApproachR", half_l, half_l + approach_len, 12.6, 16.8, deck_z - 0.1, mats["embankment"])

    add_four_lane_markings_x("Deck", -half_l, half_l, deck_z, mats, half_width=half_w)
    export_glb(filename)


def add_ramp_piers(prefix, pts_xyz, skip_start=3, skip_end=3, step=4, mat=None, deck_thick=1.1):
    """为高架匝道自动布置等距圆柱桥墩（避开接地点与跨线桥净空区）。"""
    for i in range(skip_start, len(pts_xyz) - skip_end, step):
        x, y, z = pts_xyz[i]
        if z > 2.8:
            add_cylinder(f"{prefix}_Pier_{i}", x, y, 0.0, z - deck_thick + 0.1, 0.9, 12, mat)


def build_interchange_hub(filename):
    """420m x 420m 双层双向四车道枢纽立交（含 4 象限苜蓿叶环形匝道 + 4 条外围右转定向匝道）。"""
    reset_scene()
    mats = build_materials()
    L = 420.0
    half_l = L * 0.5

    # 1) 一层主线（沿 X 轴，顶面 Z = 2.2m，双向四车道 26m 宽）
    main_z = 2.2
    add_trapezoid_prism_x("MainlineEmbank", -half_l, half_l, 15.2, 13.0, 0.0, main_z - 0.3, mats["embankment"])
    add_box("MainlineAsphalt", 0.0, 0.0, main_z - 0.15, L, 24.6, 0.3, mats["asphalt"])
    add_four_lane_markings_x("MainX", -half_l, half_l, main_z, mats, half_width=13.0)

    # 2) 二层跨线主干道（沿 Y 轴，跨中抬升至 Z = 12.2m，两端平滑落地至 Z = 2.2m）
    cross_pts = []
    n_y = 48
    for i in range(n_y + 1):
        y = -half_l + L * (i / n_y)
        # 平滑钟形纵坡曲线，|Y|<55m 处保持 Z>=10.5m 上跨一层主线
        t = abs(y) / half_l
        if t < 0.72:
            s = 0.5 * (1.0 + math.cos(math.pi * (t / 0.72)))
        else:
            s = 0.0
        z = 2.2 + 10.0 * s
        cross_pts.append((0.0, y, z))

    add_ribbon_along_points("CrossOverpass", cross_pts, 24.0, 2.0, mats["asphalt"], mats["guardrail"], rail_height=0.85, solid_center_line=True, mat_line=mats["lane_white"])
    # 跨线桥下箱梁底板及中央分隔带
    cross_girder_pts = [(x, y, z - 0.4) for (x, y, z) in cross_pts]
    add_ribbon_along_points("CrossGirder", cross_girder_pts, 21.6, 1.8, mats["concrete"])
    cross_med_pts = [(x, y, z + 0.65) for (x, y, z) in cross_pts]
    add_ribbon_along_points("CrossMedian", cross_med_pts, 1.2, 0.65, mats["median_green"])

    # 跨线桥墩（避开 |Y| < 20m 主线范围）
    for i in range(4, len(cross_pts) - 4, 4):
        _, y, z = cross_pts[i]
        if abs(y) > 22.0 and z > 3.2:
            for sx in (-6.0, 6.0):
                add_cylinder(f"CrossPier_{i}_{sx}", sx, y, 0.0, z - 2.0, 1.15, 14, mats["concrete_dark"])

    # 3) 4 象限内侧苜蓿叶环形匝道（平滑连接一层主线与二层跨线）
    for q_idx, (sx, sy) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
        loop_pts = []
        steps = 28
        cx, cy = sx * 68.0, sy * 68.0
        r = 52.0
        for i in range(steps + 1):
            u = i / steps
            # 从近主线侧绕行 270 度进入跨线桥侧
            base_ang = math.atan2(-sy, -sx)
            ang = base_ang + sx * sy * (u * 1.55 * math.pi)
            px = cx + math.cos(ang) * r
            py = cy + math.sin(ang) * r
            # 高程：由 2.2m 平缓爬升至 7.8m 再衔接跨线桥或主线
            z = 2.2 + 5.6 * math.sin(math.pi * u)
            loop_pts.append((px, py, z))
        add_ribbon_along_points(f"LoopRamp_{q_idx}", loop_pts, 9.0, 1.1, mats["asphalt"], mats["guardrail"], 0.75, True, mats["lane_white"])
        add_ramp_piers(f"LoopRamp_{q_idx}", loop_pts, skip_start=3, skip_end=3, step=5, mat=mats["concrete_dark"])

    # 4) 4 条外围右转定向匝道
    for d_idx, (sx, sy) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
        dir_pts = []
        steps = 22
        p0 = Vector((sx * 185.0, sy * 15.0, 2.2))
        p1 = Vector((sx * 110.0, sy * 110.0, 4.6))
        p2 = Vector((sx * 15.0, sy * 185.0, 2.2))
        for i in range(steps + 1):
            t = i / steps
            pos = ((1 - t) ** 2) * p0 + 2 * (1 - t) * t * p1 + (t ** 2) * p2
            dir_pts.append((pos.x, pos.y, pos.z))
        add_ribbon_along_points(f"DirRamp_{d_idx}", dir_pts, 9.0, 1.0, mats["asphalt"], mats["guardrail"], 0.75, True, mats["lane_white"])
        add_ramp_piers(f"DirRamp_{d_idx}", dir_pts, skip_start=4, skip_end=4, step=5, mat=mats["concrete_dark"])

    export_glb(filename)


def build_interchange_trumpet(filename):
    """420m x 260m 单喇叭互通立交 + 匝道收费站（蓝色雨棚）。"""
    reset_scene()
    mats = build_materials()
    L = 420.0
    half_l = L * 0.5
    main_z = 2.2

    # 1) 主线（沿 X 轴，双向四车道 26m）
    add_trapezoid_prism_x("MainlineEmbank", -half_l, half_l, 15.2, 13.0, 0.0, main_z - 0.3, mats["embankment"])
    add_box("MainlineAsphalt", 0.0, 0.0, main_z - 0.15, L, 24.6, 0.3, mats["asphalt"])
    add_four_lane_markings_x("MainX", -half_l, half_l, main_z, mats, half_width=13.0)

    # 2) 单喇叭环形上跨匝道（从主线右侧起坡上跨主线至 -Y 侧收费站引线）
    loop_pts = []
    steps = 36
    for i in range(steps + 1):
        u = i / steps
        # 参数化单喇叭曲线：绕行 +Y 侧环岛后跨过 X=0 上方进入 -Y 侧连接线
        if u <= 0.55:
            t = u / 0.55
            ang = -math.pi * 0.5 + t * math.pi * 1.35
            px = -35.0 + math.cos(ang) * 58.0
            py = 56.0 + math.sin(ang) * 46.0
        else:
            t = (u - 0.55) / 0.45
            p0 = Vector((-35.0 + math.cos(0.85 * math.pi) * 58.0, 56.0 + math.sin(0.85 * math.pi) * 46.0, 0.0))
            p1 = Vector((-12.0, 2.0, 0.0))
            p2 = Vector((0.0, -96.0, 0.0))
            pos = ((1 - t) ** 2) * p0 + 2 * (1 - t) * t * p1 + (t ** 2) * p2
            px, py = pos.x, pos.y

        # 当 py 跨越主线 (|py| < 22m) 时高架至 Z = 10.8m
        cross_factor = math.exp(-((py / 28.0) ** 2))
        ramp_z = 2.2 + 8.6 * cross_factor + 2.2 * math.sin(math.pi * min(1.0, u * 1.1)) * (1.0 - cross_factor)
        if u < 0.12:
            ramp_z = 2.2 + (ramp_z - 2.2) * (u / 0.12)
        if u > 0.90:
            ramp_z = 2.2 + (ramp_z - 2.2) * ((1.0 - u) / 0.10)
        loop_pts.append((px, py, ramp_z))

    add_ribbon_along_points("TrumpetLoopRamp", loop_pts, 9.5, 1.2, mats["asphalt"], mats["guardrail"], 0.75, True, mats["lane_white"])
    # 避开主线净空区 (|py| < 18m) 布置桥墩
    for i in range(3, len(loop_pts) - 3, 4):
        px, py, pz = loop_pts[i]
        if abs(py) > 18.0 and pz > 3.0:
            add_cylinder(f"TrumpetPier_{i}", px, py, 0.0, pz - 1.1, 0.95, 12, mats["concrete_dark"])

    # 3) 两条外侧平面定向进出匝道（-Y 侧左右分合流）
    for side_name, sx in (("Left", -1.0), ("Right", 1.0)):
        pts = []
        p0 = Vector((sx * 165.0, -14.0, 2.2))
        p1 = Vector((sx * 75.0, -48.0, 2.2))
        p2 = Vector((sx * 8.0, -96.0, 2.2))
        for i in range(19):
            t = i / 18.0
            pos = ((1 - t) ** 2) * p0 + 2 * (1 - t) * t * p1 + (t ** 2) * p2
            pts.append((pos.x, pos.y, pos.z))
        add_ribbon_along_points(f"BranchRamp_{side_name}", pts, 9.0, 0.8, mats["asphalt"], mats["guardrail"], 0.65, True, mats["lane_white"])

    # 4) 收费站连接线 + 广场 + 科技蓝收费站雨棚 (Y ∈ [-95, -225])
    branch_pts = [(0.0, -95.0 - i * 10.0, 2.2) for i in range(14)]
    add_ribbon_along_points("TollConnector", branch_pts, 18.0, 1.6, mats["asphalt"], mats["guardrail"], 0.70, True, mats["lane_white"])
    add_box("TollPlazaSlab", 0.0, -155.0, 1.1, 44.0, 34.0, 2.2, mats["concrete"])
    add_box("TollPlazaAsphalt", 0.0, -155.0, 2.22, 42.0, 32.0, 0.16, mats["asphalt"])

    # 4 座收费安全岛 + 科技蓝收费站大棚
    for island_x in (-13.5, -4.5, 4.5, 13.5):
        add_box(f"TollIsland_{island_x}", island_x, -155.0, 2.75, 2.0, 16.0, 0.9, mats["concrete_dark"])
        add_cylinder(f"TollCanopyCol_{island_x}", island_x, -155.0, 3.1, 8.2, 0.45, 10, mats["guardrail"])

    add_box("TollCanopyRoof", 0.0, -155.0, 8.9, 38.0, 14.5, 1.5, mats["toll_cyan"])
    add_box("TollCanopyTrim", 0.0, -155.0, 9.7, 38.4, 14.9, 0.25, mats["lane_white"])

    export_glb(filename)


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


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # 1. 大桥模板 (320m, 6跨, 5个双柱墩)
    build_bridge_template("bridge-large.glb", 320.0, 14.0, [-106.7, -53.3, 0.0, 53.3, 106.7], is_slab=False)

    # 2. 中桥模板 (120m, 3跨, 2个双柱墩)
    build_bridge_template("bridge-medium.glb", 120.0, 10.0, [-20.0, 20.0], is_slab=False)

    # 3. 小桥模板 (48m, 单跨板桥)
    build_bridge_template("bridge-small.glb", 48.0, 5.2, [], is_slab=True)

    # 4. 枢纽互通模板
    build_interchange_hub("interchange-hub.glb")

    # 5. 一般单喇叭互通 + 匝道收费站模板
    build_interchange_trumpet("interchange-trumpet.glb")

    print("[DONE] All 5 highway GLB models generated successfully.")


if __name__ == "__main__":
    main()
