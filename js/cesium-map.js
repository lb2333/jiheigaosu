/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   CesiumJS 3D 数字孪生底图引擎（开源影像 + 矢量发光路线 + 3D BIM 模型 + 飞行漫游）
   ========================================================================== */

(function () {
  'use strict';

  const CFG = window.JIHEI_CONFIG || {};
  const CESIUM_ION_TOKEN =
    CFG.cesiumIonToken ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNDcxY2E3Zi04YjcxLTQxMDYtYmVkMi0xZTBmYTMxNDI2ZmQiLCJpZCI6MjEzNjUyLCJpYXQiOjE3MTUxMzU3NTN9.8w7jF6ETAg1bmeWfSLNRO0xVrp5rlYCnDKJt_XD0K8Y';
  const TDT_TK = CFG.tiandituToken || 'd0ff04fb27c18bfd43ef85d3dcf4dc7f';
  const OFFLINE_ERROR_THRESHOLD = Number(CFG.offlineFallbackThreshold) || 6;

  /* 真实地理位置：G1211 吉黑高速（自然大半径高速曲线线形）
     起点：明水县北新发四队东南侧（BK0+000） 125.8202, 47.2916
     终点：北安市建华枢纽互通                 126.4135, 48.2372 */
  const CONTROL_POINTS = [
    [125.8202, 47.2916], // 起点：明水县北新发四队东南侧（BK0+000，一工区）
    [125.9150, 47.3620], // 向东偏北绕避居民点（一/二工区交界）
    [125.9820, 47.4520], // 二工区核心（桥梁示例A / 梁场 / 拌合站）
    [126.0150, 47.5520], // 顺缓曲线北上（二/三工区交界）
    [125.9920, 47.6520], // 三工区向西北轻折绕行农田水系
    [126.0280, 47.7480], // 三/四工区交界
    [126.1350, 47.8380], // 四工区大半径向东北展线
    [126.2520, 47.9260], // 四/五工区交界
    [126.3280, 48.0280], // 五工区沿走廊缓弯北上
    [126.3620, 48.1350], // 五/六工区交界
    [126.4135, 48.2372]  // 终点：北安市建华枢纽互通（六工区）
  ];

  /* Catmull-Rom 样条插值，生成平滑高精度矢量线路坐标 */
  function interpolateSpline(pts, samplesPerSeg) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(n - 1, i + 2)];
      for (let s = 0; s < samplesPerSeg; s++) {
        const t = s / samplesPerSeg;
        const t2 = t * t;
        const t3 = t2 * t;
        const lon = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const lat = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([lon, lat]);
      }
    }
    out.push(pts[n - 1]);
    return out;
  }

  const ROUTE_COORDS = interpolateSpline(CONTROL_POINTS, 18);

  /* 各工区起止比例与真实经纬度 */
  const SECTION_RANGES = [
    { id: 'sec1', name: '一工区', start: 0.00, end: 0.16, color: '#22d3ee' },
    { id: 'sec2', name: '二工区', start: 0.16, end: 0.34, color: '#06b6d4' },
    { id: 'sec3', name: '三工区', start: 0.34, end: 0.51, color: '#38bdf8' },
    { id: 'sec4', name: '四工区', start: 0.51, end: 0.68, color: '#22d3ee' },
    { id: 'sec5', name: '五工区', start: 0.68, end: 0.84, color: '#0ea5e9' },
    { id: 'sec6', name: '六工区', start: 0.84, end: 1.00, color: '#38f2ff' }
  ];

  /* 工程点位真实三维坐标（紧贴二工区弯曲走廊自然分布，避免标牌遮挡） */
  const POI_GEO = {
    bridgeA:     { lon: 125.9820, lat: 47.4520, alt: 235 },
    beamYardA:   { lon: 126.1150, lat: 47.5080, alt: 220 },
    batchPlantA: { lon: 126.1350, lat: 47.4020, alt: 218 }
  };

  /* 漫游站点真实三维坐标与最佳相机参数（俯瞰高空全景 vs 沿线低空沉浸巡飞） */
  const ROAM_GEO = {
    start:       { lon: 125.8202, lat: 47.2916, alt: 215, headingOver: 22, headingAlong: 34, pitchOver: -42, pitchAlong: -12, rangeOver: 18000, rangeAlong: 3600 },
    bridgeA:     { lon: 125.9820, lat: 47.4520, alt: 235, headingOver: 20, headingAlong: 20, pitchOver: -40, pitchAlong: -11, rangeOver: 15000, rangeAlong: 3200 },
    beamYardA:   { lon: 126.1150, lat: 47.5080, alt: 220, headingOver: 16, headingAlong: 18, pitchOver: -42, pitchAlong: -12, rangeOver: 13000, rangeAlong: 3000 },
    batchPlantA: { lon: 126.1350, lat: 47.4020, alt: 218, headingOver: 22, headingAlong: 24, pitchOver: -42, pitchAlong: -12, rangeOver: 13000, rangeAlong: 3000 },
    end:         { lon: 126.4135, lat: 48.2372, alt: 260, headingOver: 16, headingAlong: 20, pitchOver: -40, pitchAlong: -12, rangeOver: 19000, rangeAlong: 4000 }
  };

  /* 按官方天地图 WMTS 规范加载影像底图 (img_c) 与中文注记 (cia_c) */
  function loadTianditu(viewer) {
    const tianditu_img = new Cesium.WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/img_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=img&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=${TDT_TK}`,
      layer: 'img',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      credit: new Cesium.Credit('天地图全球影像服务'),
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 15,
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
    });
    const imageryLayer1 = viewer.imageryLayers.addImageryProvider(tianditu_img);

    const tdtNoteLayerProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/cia_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=cia&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=${TDT_TK}`,
      layer: 'cia',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      credit: new Cesium.Credit('天地图中文注记服务'),
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 18,
      tilingScheme: new Cesium.GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
    });
    const imageryLayer = viewer.imageryLayers.addImageryProvider(tdtNoteLayerProvider);
    return { tdtImgLayer: imageryLayer1, tdtNoteLayer: imageryLayer };
  }
  window.loadTianditu = loadTianditu;

  function getPointAtRatio(r) {
    const idx = Math.max(0, Math.min(ROUTE_COORDS.length - 1, Math.round(r * (ROUTE_COORDS.length - 1))));
    return ROUTE_COORDS[idx];
  }

  /* 注册自定义动态流光材质（矢量路线发光流动脉冲效果） */
  function registerFlowLineMaterial() {
    if (!window.Cesium || Cesium.Material.JiheiFlowLineType) return;
    const FlowType = 'JiheiFlowLine';
    Cesium.Material.JiheiFlowLineType = FlowType;
    Cesium.Material._materialCache.addMaterial(FlowType, {
      fabric: {
        type: FlowType,
        uniforms: {
          color: new Cesium.Color(0.22, 0.95, 1.0, 1.0),
          headColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          speed: 1.6,
          repeat: 10.0
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            float time = czm_frameNumber * 0.012 * speed;
            float pos = fract(st.s * repeat - time);
            // 细腻柔光拖尾 + 精致中心亮核（不刺眼不过曝）
            float tail = smoothstep(0.0, 0.78, pos) * (1.0 - smoothstep(0.78, 0.99, pos));
            float core = exp(-abs(st.t - 0.5) * 10.0);
            float baseLine = exp(-abs(st.t - 0.5) * 6.5) * 0.38;
            float intensity = clamp(baseLine + tail * core * 0.85, 0.0, 0.92);
            vec3 col = mix(color.rgb, headColor.rgb, smoothstep(0.62, 0.94, pos) * core * 0.65);
            material.diffuse = col;
            material.emission = col * (0.45 + tail * 0.65);
            material.alpha = clamp(intensity * color.a, 0.0, 0.9);
            return material;
          }
        `
      },
      translucent: function () { return true; }
    });

    /* 自定义 MaterialProperty 包装器，支持 Cesium Entity 直接绑定 */
    function JiheiFlowLineMaterialProperty(options) {
      options = options || {};
      this._definitionChanged = new Cesium.Event();
      this._color = options.color || Cesium.Color.fromCssColorString('#38f2ff');
      this._headColor = options.headColor || Cesium.Color.WHITE;
      this._speed = options.speed !== undefined ? options.speed : 1.5;
      this._repeat = options.repeat !== undefined ? options.repeat : 12.0;
    }
    Object.defineProperties(JiheiFlowLineMaterialProperty.prototype, {
      isConstant: { get: function () { return false; } },
      definitionChanged: { get: function () { return this._definitionChanged; } }
    });
    JiheiFlowLineMaterialProperty.prototype.getType = function () { return FlowType; };
    JiheiFlowLineMaterialProperty.prototype.getValue = function (time, result) {
      if (!result) result = {};
      result.color = this._color;
      result.headColor = this._headColor;
      result.speed = this._speed;
      result.repeat = this._repeat;
      return result;
    };
    JiheiFlowLineMaterialProperty.prototype.equals = function (other) {
      return this === other;
    };
    Cesium.JiheiFlowLineMaterialProperty = JiheiFlowLineMaterialProperty;
  }

  /* 注册点位脉冲光环自定义 GLSL 材质（替代每帧重建几何体的 CallbackProperty，大幅降低 CPU/GPU 开销） */
  function registerPulseRingMaterial() {
    if (!window.Cesium || Cesium.Material.JiheiPulseRingType) return;
    const PulseType = 'JiheiPulseRing';
    Cesium.Material.JiheiPulseRingType = PulseType;
    Cesium.Material._materialCache.addMaterial(PulseType, {
      fabric: {
        type: PulseType,
        uniforms: {
          color: new Cesium.Color(0.22, 0.95, 1.0, 1.0),
          speed: 0.72
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 centered = materialInput.st - vec2(0.5);
            float dist = length(centered) * 2.0;
            if (dist > 1.0) {
              discard;
            }
            float t1 = fract(czm_frameNumber * 0.008 * speed);
            float t2 = fract(t1 + 0.5);
            float ring1 = exp(-pow((dist - t1) * 14.0, 2.0)) * (1.0 - t1);
            float ring2 = exp(-pow((dist - t2) * 14.0, 2.0)) * (1.0 - t2) * 0.75;
            float fill = smoothstep(t1 + 0.04, 0.0, dist) * (1.0 - t1) * 0.28;
            float outerRim = smoothstep(0.94, 0.985, dist) * (1.0 - smoothstep(0.985, 1.0, dist)) * 0.45;
            float alpha = clamp((ring1 + ring2 + fill + outerRim) * color.a, 0.0, 0.85);
            material.diffuse = color.rgb;
            material.emission = color.rgb * (0.65 + (ring1 + ring2) * 0.9);
            material.alpha = alpha;
            return material;
          }
        `
      },
      translucent: function () { return true; }
    });

    function JiheiPulseRingMaterialProperty(options) {
      options = options || {};
      this._definitionChanged = new Cesium.Event();
      this._color = options.color || Cesium.Color.fromCssColorString('#38f2ff');
      this._speed = options.speed !== undefined ? options.speed : 0.72;
    }
    Object.defineProperties(JiheiPulseRingMaterialProperty.prototype, {
      isConstant: { get: function () { return false; } },
      definitionChanged: { get: function () { return this._definitionChanged; } }
    });
    JiheiPulseRingMaterialProperty.prototype.getType = function () { return PulseType; };
    JiheiPulseRingMaterialProperty.prototype.getValue = function (time, result) {
      if (!result) result = {};
      result.color = this._color;
      result.speed = this._speed;
      return result;
    };
    JiheiPulseRingMaterialProperty.prototype.equals = function (other) {
      return this === other;
    };
    Cesium.JiheiPulseRingMaterialProperty = JiheiPulseRingMaterialProperty;
  }

  /* 零外网依赖的本地深海科技蓝暗色底图（用于设计模型预览及无网/内网自动降级兜底） */
  function createLocalDarkImageryProvider() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#071b3b');
    grad.addColorStop(0.5, '#0a254e');
    grad.addColorStop(1, '#051530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(512, y + 0.5);
      ctx.stroke();
    }
    return new Cesium.SingleTileImageryProvider({
      url: canvas.toDataURL('image/png'),
      tileWidth: 512,
      tileHeight: 256,
      rectangle: Cesium.Rectangle.MAX_VALUE
    });
  }

  /* ------------------------------------------------------------------------
     主 Cesium 3D 地图控制器类
     ------------------------------------------------------------------------ */
  class JiheiCesiumEngine {
    constructor() {
      this.viewer = null;
      this.ready = false;
      this.layers = {};
      this.sectionEntities = {};
      this.routeEntities = [];
      this.bimEntities = [];
      this.poiEntities = [];
      this.projectedPins = [];
      this.activeSectionId = null;
      this.overlayRoot = null;
      this.viewpointGeo = null;
      this.viewpointEl = null;
      this.onPoiClick = null;
      this.onSectionClick = null;
      this.orbitActive = false;
      this.sceneVisible = true;
      this.renderActive = true;
      this.offlineFallbackActive = false;
      this.tileErrorCount = 0;
      this.canvasWidth = 0;
      this.canvasHeight = 0;
      this._resizeObserver = null;
      this._lastLayerOpts = null;
    }

    init(containerId, overlayContainerId, callbacks) {
      this.overlayRoot = document.getElementById(overlayContainerId);
      this.onPoiClick = callbacks && callbacks.onPoiClick;
      this.onSectionClick = callbacks && callbacks.onSectionClick;

      if (!window.Cesium) {
        this._showFallbackNotice(containerId, 'CesiumJS 正在加载或当前环境离线，请检查网络后刷新页面。');
        return false;
      }

      try {
        Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
        registerFlowLineMaterial();
        registerPulseRingMaterial();

        /* 初始化 Cesium Viewer（禁用默认底图，改由天地图影像 + 中文注记挂载） */
        const viewerOpts = {
          baseLayer: false,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          vrButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          creditContainer: document.createElement('div'),
          requestRenderMode: false,
          contextOptions: {
            webgl: { alpha: false, antialias: true, preserveDrawingBuffer: false }
          }
        };

        /* 若以 file:// 直接双击打开，浏览器会拦截本地 Web Worker；给出清晰一键启动提示 */
        if (window.location && window.location.protocol === 'file:') {
          this._showFallbackNotice(
            containerId,
            '浏览器安全策略禁止 file:// 协议加载 Cesium Web Worker，请双击目录中的【启动三维平台.bat】或使用 Live Server（http://127.0.0.1:8088/index.html）打开即可秒开三维地球！'
          );
          return false;
        }

        /* 优先启用 Cesium World Terrain 真实 3D 地形（支持配置开关及离线自动回退） */
        if (CFG.enableWorldTerrain !== false && Cesium.Terrain && Cesium.Terrain.fromWorldTerrain) {
          try {
            viewerOpts.terrain = Cesium.Terrain.fromWorldTerrain({
              requestVertexNormals: true,
              requestWaterMask: false
            });
          } catch (e) {
            console.warn('[JiheiCesiumEngine] World terrain fallback:', e);
          }
        }

        this.viewer = new Cesium.Viewer(containerId, viewerOpts);
        window.viewer = this.viewer;

        if (this.viewer.terrainProvider && this.viewer.terrainProvider.errorEvent) {
          this.viewer.terrainProvider.errorEvent.addEventListener(() => {
            if (!(this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)) {
              this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
            }
          });
        }

        /* 1. 加载天地图全球影像底图 (img_c) + 天地图中文注记 (cia_c) */
        const { tdtImgLayer, tdtNoteLayer } = loadTianditu(this.viewer);
        this.layers.satellite = tdtImgLayer;
        this.layers.labels = tdtNoteLayer;
        window.tdtNoteLayer = tdtNoteLayer;

        /* 色彩调优：让天地图影像通透明亮，层次清晰 */
        this.layers.satellite.brightness = 1.16;
        this.layers.satellite.contrast = 1.12;
        this.layers.satellite.saturation = 1.18;
        this.layers.satellite.gamma = 1.02;

        /* 2. 零外网依赖本地深蓝科技底图（用于“设计模型预览”及离线/内网兜底） */
        this.layers.darkBase = this.viewer.imageryLayers.addImageryProvider(
          createLocalDarkImageryProvider()
        );
        this.layers.darkBase.show = false;

        /* 外网影像连续异常时自动平滑降级为本地暗色科技底图 + 经纬格网 */
        if (tdtImgLayer && tdtImgLayer.imageryProvider && tdtImgLayer.imageryProvider.errorEvent) {
          tdtImgLayer.imageryProvider.errorEvent.addEventListener(() => {
            this.tileErrorCount += 1;
            if (!this.offlineFallbackActive && this.tileErrorCount >= OFFLINE_ERROR_THRESHOLD) {
              this.offlineFallbackActive = true;
              this.layers.satellite.show = false;
              this.layers.darkBase.show = true;
              this.layers.techGrid.show = true;
              if (window.JIHEI_PLATFORM && typeof window.JIHEI_PLATFORM.showToast === 'function') {
                window.JIHEI_PLATFORM.showToast('外网影像受限，已自动切换为本地三维数字孪生兜底底图');
              }
            }
          });
        }

        /* 3. 天地图矢量地形辅助叠加（开启“高分遥感影像”开关时叠加科技格网强化） */
        this.layers.osmTopo = this.viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            url: `https://{s}.tianditu.gov.cn/ter_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=ter&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=${TDT_TK}`,
            layer: 'ter',
            style: 'default',
            format: 'tiles',
            tileMatrixSetID: 'c',
            subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
            maximumLevel: 14,
            tilingScheme: new Cesium.GeographicTilingScheme(),
            tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
          })
        );
        this.layers.osmTopo.show = false;
        this.layers.osmTopo.alpha = 0.36;

        /* 经纬网科技格网层 */
        this.layers.techGrid = this.viewer.imageryLayers.addImageryProvider(
          new Cesium.GridImageryProvider({
            cells: 6,
            color: Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.32),
            glowColor: Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.18),
            glowWidth: 2,
            backgroundColor: Cesium.Color.TRANSPARENT
          })
        );
        this.layers.techGrid.show = false;

        /* 确保天地图中文注记始终位于影像与格网最顶层 */
        this.viewer.imageryLayers.raiseToTop(this.layers.labels);

        /* 场景视觉美化配置：晴朗蓝天大气层 + 通透远景雾 + FXAA 抗锯齿 */
        const scene = this.viewer.scene;
        scene.globe.enableLighting = false;
        scene.globe.depthTestAgainstTerrain = false;
        scene.globe.baseColor = Cesium.Color.fromCssColorString('#10305a');
        scene.backgroundColor = Cesium.Color.fromCssColorString('#163b72');
        scene.skyBox.show = false;
        if (scene.skyAtmosphere) {
          scene.skyAtmosphere.show = true;
          scene.skyAtmosphere.hueShift = -0.02;
          scene.skyAtmosphere.saturationShift = 0.16;
          scene.skyAtmosphere.brightnessShift = 0.24;
        }
        scene.fog.enabled = true;
        scene.fog.density = 0.00006;
        scene.fog.screenSpaceErrorFactor = 2.0;
        scene.postProcessStages.fxaa.enabled = true;
        if (scene.postProcessStages.bloom) {
          scene.postProcessStages.bloom.enabled = false;
        }

        /* 限制相机过度钻地或飞离地球 */
        const ctrl = scene.screenSpaceCameraController;
        ctrl.minimumZoomDistance = 450;
        ctrl.maximumZoomDistance = 320000;
        ctrl.tiltEventTypes = [
          Cesium.CameraEventType.RIGHT_DRAG,
          Cesium.CameraEventType.PINCH,
          { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
          { eventType: Cesium.CameraEventType.MIDDLE_DRAG }
        ];

        /* 构建全部矢量图层与三维模型 */
        this._buildSectionCorridorVectors();
        this._buildGlowingRouteVectors();
        this._buildBim3DModels();
        this._buildPoiVectorAnchors();
        this._bindSceneEvents();

        /* 先标记 ready = true，再立即瞬时定位至明水—北安段斜向全景俯瞰视角（第 1 帧即直达目标区域！） */
        this.ready = true;
        this.setOverviewImmediate();
        return true;
      } catch (err) {
        console.error('[JiheiCesiumEngine] Init failed:', err);
        this._showFallbackNotice(containerId, 'Cesium 三维引擎初始化失败：' + (err.message || err));
        return false;
      }
    }

    /* ----------------------------------------------------------------------
       1. 矢量工区走廊面（6个工区独立矢量 Corridor + 分界标线）
       ---------------------------------------------------------------------- */
    _buildSectionCorridorVectors() {
      const total = ROUTE_COORDS.length - 1;
      SECTION_RANGES.forEach((sec, idx) => {
        const iStart = Math.floor(sec.start * total);
        const iEnd = Math.min(total, Math.ceil(sec.end * total));
        const slice = ROUTE_COORDS.slice(iStart, iEnd + 1);
        const flat = [];
        slice.forEach(p => flat.push(p[0], p[1]));

        const baseColor = Cesium.Color.fromCssColorString(sec.color);
        const entity = this.viewer.entities.add({
          id: 'corridor_' + sec.id,
          name: sec.name,
          corridor: {
            positions: Cesium.Cartesian3.fromDegreesArray(flat),
            width: 1450,
            cornerType: Cesium.CornerType.ROUNDED,
            material: new Cesium.ColorMaterialProperty(baseColor.withAlpha(idx % 2 === 0 ? 0.22 : 0.16)),
            outline: false,
            classificationType: Cesium.ClassificationType.BOTH
          }
        });
        entity._secId = sec.id;
        this.sectionEntities[sec.id] = entity;

        /* 工区分界横向矢量标线 */
        if (idx > 0) {
          const p = ROUTE_COORDS[iStart];
          const prev = ROUTE_COORDS[Math.max(0, iStart - 1)];
          const dx = p[0] - prev[0];
          const dy = p[1] - prev[1];
          const len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * 0.012;
          const ny = (dx / len) * 0.008;
          const tick = this.viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([p[0] - nx, p[1] - ny, p[0] + nx, p[1] + ny]),
              width: 1.5,
              clampToGround: true,
              material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.fromCssColorString('#7dd3fc').withAlpha(0.68),
                dashLength: 8
              })
            }
          });
          this.sectionEntities['tick_' + sec.id] = tick;
        }
      });
    }

    /* ----------------------------------------------------------------------
       2. 精致通透发光矢量路线（柔和外晕 + 纤细流光中线 + 精细路幅边线）
       ---------------------------------------------------------------------- */
    _buildGlowingRouteVectors() {
      const flat = [];
      const flatElevated = [];
      ROUTE_COORDS.forEach(p => {
        flat.push(p[0], p[1]);
        flatElevated.push(p[0], p[1], 300);
      });
      const positions = Cesium.Cartesian3.fromDegreesArray(flat);
      const elevatedPositions = Cesium.Cartesian3.fromDegreesArrayHeights(flatElevated);

      /* 底层柔和天青色外发光（收敛宽度与亮度，不喧宾夺主） */
      const glowOuter = this.viewer.entities.add({
        polyline: {
          positions: positions,
          width: 9,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.22,
            taperPower: 1.0,
            color: Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.58)
          })
        }
      });

      /* 中层纤细动态流光脉冲矢量线 */
      const flowCore = this.viewer.entities.add({
        polyline: {
          positions: elevatedPositions,
          width: 3.2,
          clampToGround: false,
          material: new Cesium.JiheiFlowLineMaterialProperty({
            color: Cesium.Color.fromCssColorString('#38e8ff').withAlpha(0.88),
            headColor: Cesium.Color.fromCssColorString('#e0faff'),
            speed: 1.15,
            repeat: 12.0
          })
        }
      });

      /* 道路双侧精细边线（贴合 1450m 矢量走廊边缘） */
      const leftFlat = [];
      const rightFlat = [];
      for (let i = 0; i < ROUTE_COORDS.length; i++) {
        const cur = ROUTE_COORDS[i];
        const next = ROUTE_COORDS[Math.min(ROUTE_COORDS.length - 1, i + 1)];
        const prev = ROUTE_COORDS[Math.max(0, i - 1)];
        const dx = next[0] - prev[0];
        const dy = next[1] - prev[1];
        const len = Math.hypot(dx, dy) || 1;
        const offLon = (-dy / len) * 0.0068;
        const offLat = (dx / len) * 0.0046;
        leftFlat.push(cur[0] + offLon, cur[1] + offLat);
        rightFlat.push(cur[0] - offLon, cur[1] - offLat);
      }

      const leftEdge = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(leftFlat),
          width: 1.3,
          clampToGround: true,
          material: Cesium.Color.fromCssColorString('#67e8f9').withAlpha(0.46)
        }
      });
      const rightEdge = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(rightFlat),
          width: 1.3,
          clampToGround: true,
          material: Cesium.Color.fromCssColorString('#67e8f9').withAlpha(0.46)
        }
      });

      /* 沿线 4 个精致矢量流向箭头 */
      [0.14, 0.38, 0.62, 0.85].forEach(ratio => {
        const i = Math.floor(ratio * (ROUTE_COORDS.length - 4));
        const p1 = ROUTE_COORDS[i];
        const p2 = ROUTE_COORDS[i + 3];
        const arrow = this.viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([p1[0], p1[1], p2[0], p2[1]]),
            width: 8,
            clampToGround: true,
            material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.fromCssColorString('#cffafe').withAlpha(0.72))
          }
        });
        this.routeEntities.push(arrow);
      });

      this.routeEntities.push(glowOuter, flowCore, leftEdge, rightEdge);
    }

    /* ----------------------------------------------------------------------
       3. 三维矢量 BIM 模型（桥梁示例A / 梁场示例A / 拌合站示例A，支持开关）
       ---------------------------------------------------------------------- */
    _buildBim3DModels() {
      const cyanFill = Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.45);
      const cyanWire = Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.95);
      const goldFill = Cesium.Color.fromCssColorString('#facc15').withAlpha(0.85);

      /* 桥梁示例A：3D 双幅箱梁 + 6座桥墩模型 */
      const b = POI_GEO.bridgeA;
      const bridgeDeck = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 380),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 380),
          new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(28), 0, 0)
        ),
        box: {
          dimensions: new Cesium.Cartesian3(380, 2600, 65),
          material: cyanFill,
          outline: true,
          outlineColor: cyanWire
        },
        show: false
      });
      this.bimEntities.push(bridgeDeck);

      for (let k = -2; k <= 2; k++) {
        const pier = this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(b.lon + k * 0.0024, b.lat + k * 0.0042, 240),
          cylinder: {
            length: 280,
            topRadius: 55,
            bottomRadius: 72,
            material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.55),
            outline: true,
            outlineColor: cyanWire
          },
          show: false
        });
        this.bimEntities.push(pier);
      }

      /* 梁场示例A：3D 预制区 + 金色龙门吊框架 */
      const y = POI_GEO.beamYardA;
      const yardPad = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(y.lon, y.lat, 260),
        box: {
          dimensions: new Cesium.Cartesian3(1400, 900, 45),
          material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.35),
          outline: true,
          outlineColor: cyanWire
        },
        show: false
      });
      const gantry = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(y.lon, y.lat, 420),
        box: {
          dimensions: new Cesium.Cartesian3(950, 120, 110),
          material: goldFill,
          outline: true,
          outlineColor: Cesium.Color.WHITE
        },
        show: false
      });
      this.bimEntities.push(yardPad, gantry);

      /* 拌合站示例A：3D 筒仓群 */
      const p = POI_GEO.batchPlantA;
      [-0.0022, 0, 0.0022].forEach(dx => {
        const silo = this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(p.lon + dx, p.lat, 340),
          cylinder: {
            length: 340,
            topRadius: 95,
            bottomRadius: 95,
            material: Cesium.Color.fromCssColorString('#7dd3fc').withAlpha(0.68),
            outline: true,
            outlineColor: Cesium.Color.WHITE
          },
          show: false
        });
        this.bimEntities.push(silo);
      });
    }

    /* ----------------------------------------------------------------------
       4. 工程点位发光脉冲矢量底座（GLSL Shader 地面波纹光环，零每帧几何重建）
       ---------------------------------------------------------------------- */
    _buildPoiVectorAnchors() {
      const pulseMat = new Cesium.JiheiPulseRingMaterialProperty({
        color: Cesium.Color.fromCssColorString('#38f2ff'),
        speed: 0.72
      });
      Object.entries(POI_GEO).forEach(([poiId, geo]) => {
        const pos = Cesium.Cartesian3.fromDegrees(geo.lon, geo.lat, 120);
        const pulseCircle = this.viewer.entities.add({
          id: 'poi_ring_' + poiId,
          position: pos,
          ellipse: {
            semiMajorAxis: 1620,
            semiMinorAxis: 1620,
            material: pulseMat,
            outline: false
          }
        });
        pulseCircle._poiId = poiId;

        const coreDot = this.viewer.entities.add({
          id: 'poi_dot_' + poiId,
          position: pos,
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString('#38f2ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        coreDot._poiId = poiId;
        this.poiEntities.push(pulseCircle, coreDot);
      });
    }

    /* ----------------------------------------------------------------------
       5. 60fps 屏幕坐标投影：将高保真玻璃标牌精准锚定在真实三维坐标上
       ---------------------------------------------------------------------- */
    syncHtmlOverlays(config) {
      if (!this.overlayRoot) return;
      this.projectedPins = [];
      this.overlayRoot.innerHTML = '';

      const icons = config.icons || {};
      const addPin = (html, lon, lat, alt, className, attrs) => {
        const el = document.createElement('div');
        el.className = 'cesium-pin-anchor ' + (className || '');
        if (attrs) {
          Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        }
        el.innerHTML = html;
        this.overlayRoot.appendChild(el);
        this.projectedPins.push({
          el,
          cartesian: Cesium.Cartesian3.fromDegrees(lon, lat, alt || 120)
        });
        return el;
      };

      /* 起终点方向标牌（精准锚定起点 BK0+000 与终点北安建华枢纽互通） */
      if (config.showRoute) {
        const pStart = ROUTE_COORDS[0];
        const pEnd = ROUTE_COORDS[ROUTE_COORDS.length - 1];
        addPin(`<button class="dir-badge" data-dir="start" title="明水县北新发四队东南侧（BK0+000）">← 明水方向（BK0+000）</button>`, pStart[0] - 0.085, pStart[1] - 0.025, 180);
        addPin(`<button class="dir-badge" data-dir="end" title="北安市建华枢纽互通">北安方向（建华枢纽）→</button>`, pEnd[0] + 0.045, pEnd[1] + 0.025, 220);
      }

      /* 6 个工区标签（精准错开贴附在斜向矢量走廊左上侧） */
      if (config.showSections) {
        SECTION_RANGES.forEach(sec => {
          const midRatio = (sec.start + sec.end) * 0.5;
          const pt = getPointAtRatio(midRatio);
          const active = config.activeSectionId === sec.id ? 'active' : '';
          addPin(
            `<button class="work-section-tag ${active}" data-map-sec="${sec.id}">${sec.name}</button>`,
            pt[0] - 0.095, pt[1] + 0.015, 220
          );
        });
      }

      /* 工程点位玻璃胶囊标牌（桥梁示例A / 梁场示例A / 拌合站示例A） */
      if (config.showPois && config.poiObjects) {
        Object.values(config.poiObjects).forEach(poi => {
          const geo = POI_GEO[poi.id];
          if (!geo) return;
          const active = config.activePoiId === poi.id ? 'active' : '';
          addPin(
            `<div class="poi-marker ${active}" data-poi="${poi.id}" style="position:relative;transform:translate(-50%,-100%);">
              <div class="poi-pill">${icons[poi.icon] || ''}<span>${poi.name}</span></div>
              <div class="poi-stem"></div>
            </div>`,
            geo.lon, geo.lat, geo.alt
          );
        });
      }

      /* 页面2：当前视点浮动标识 */
      if (config.showViewpoint && config.roamingStationId) {
        const rGeo = ROAM_GEO[config.roamingStationId] || ROAM_GEO.bridgeA;
        addPin(
          `<div class="camera-viewpoint-badge" style="position:relative;transform:translate(-50%,-138%);">
            <div class="camera-viewpoint-pill">${icons.camera || ''}<span>当前视点</span></div>
            <div class="camera-viewpoint-arrow"></div>
          </div>`,
          rGeo.lon, rGeo.lat, rGeo.alt + 160
        );
      }

      this._updateProjectedPositions();
    }

    _syncCanvasSize() {
      if (!this.viewer) return;
      const c = this.viewer.scene.canvas;
      this.canvasWidth = c.clientWidth || window.innerWidth;
      this.canvasHeight = c.clientHeight || window.innerHeight;
    }

    _updateProjectedPositions() {
      if (!this.viewer || !this.renderActive || !this.projectedPins.length) return;
      const scene = this.viewer.scene;
      if (!this.canvasWidth || !this.canvasHeight) this._syncCanvasSize();
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      const toWindow = Cesium.SceneTransforms.worldToWindowCoordinates || Cesium.SceneTransforms.wgs84ToWindowCoordinates;

      for (let i = 0; i < this.projectedPins.length; i++) {
        const item = this.projectedPins[i];
        const pt = toWindow(scene, item.cartesian);
        if (pt && pt.x >= -120 && pt.x <= w + 120 && pt.y >= -80 && pt.y <= h + 80) {
          item.el.style.display = 'block';
          item.el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        } else {
          item.el.style.display = 'none';
        }
      }
    }

    /* 控制 WebGL 渲染休眠：处于全屏 opaque 页面或浏览器隐藏标签页时暂停渲染循环，显著降低 GPU 占用 */
    setRenderActive(visible) {
      this.sceneVisible = !!visible;
      this._applyRenderLoopState();
    }

    _applyRenderLoopState() {
      if (!this.viewer) return;
      const shouldRun = this.sceneVisible && !document.hidden;
      if (this.renderActive === shouldRun && this.viewer.useDefaultRenderLoop === shouldRun) return;
      this.renderActive = shouldRun;
      this.viewer.useDefaultRenderLoop = shouldRun;
      if (shouldRun) {
        this.viewer.resize();
        this._syncCanvasSize();
        this.viewer.scene.requestRender();
        this._updateProjectedPositions();
      }
    }

    _bindSceneEvents() {
      this._syncCanvasSize();
      if (typeof ResizeObserver !== 'undefined') {
        this._resizeObserver = new ResizeObserver(() => this._syncCanvasSize());
        this._resizeObserver.observe(this.viewer.container);
      } else {
        window.addEventListener('resize', () => this._syncCanvasSize());
      }
      document.addEventListener('visibilitychange', () => this._applyRenderLoopState());

      /* 每帧同步投影 HTML 标牌 + 展厅背景轻缓巡航 */
      this.viewer.scene.postRender.addEventListener(() => {
        if (!this.renderActive) return;
        this._updateProjectedPositions();
        if (this.orbitActive) {
          this.viewer.camera.rotateRight(0.00035);
        }
      });

      /* 点击三维实体高亮交互 */
      const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      handler.setInputAction(movement => {
        const picked = this.viewer.scene.pick(movement.position);
        if (Cesium.defined(picked) && picked.id) {
          if (picked.id._poiId && this.onPoiClick) {
            this.onPoiClick(picked.id._poiId);
          } else if (picked.id._secId && this.onSectionClick) {
            this.onSectionClick(picked.id._secId);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /* ----------------------------------------------------------------------
       6. 图层控制与视觉模式同步
       ---------------------------------------------------------------------- */
    applyLayers(opts) {
      if (!this.ready) return;
      this._lastLayerOpts = opts;
      const designMode = !!opts.designMode;
      const useFallback = this.offlineFallbackActive;

      /* 底图切换：设计模型模式或离线降级用本地深蓝数字底图 + 科技格网；正常用天地图影像 */
      this.layers.satellite.show = !useFallback && !designMode && (opts.uav !== false);
      this.layers.darkBase.show = useFallback || designMode || (opts.uav === false);
      this.layers.osmTopo.show = !useFallback && !designMode && !!opts.satellite;
      this.layers.techGrid.show = useFallback || designMode || !!opts.satellite;
      this.layers.labels.show = !useFallback && !designMode;

      if (opts.satellite && !designMode) {
        this.layers.satellite.contrast = 1.24;
        this.layers.satellite.saturation = 1.35;
      } else {
        this.layers.satellite.contrast = 1.14;
        this.layers.satellite.saturation = 1.22;
      }

      /* 矢量工区显隐与选中高亮（精致透底宽度与柔光透明度） */
      Object.entries(this.sectionEntities).forEach(([key, ent]) => {
        ent.show = opts.sections !== false;
        if (!key.startsWith('tick_') && ent.corridor) {
          const isSelected = opts.activeSectionId && ent._secId === opts.activeSectionId;
          const isDimmed = opts.activeSectionId && ent._secId !== opts.activeSectionId;
          const col = isSelected ? '#38f2ff' : '#22d3ee';
          const alpha = isSelected ? 0.38 : isDimmed ? 0.08 : 0.19;
          ent.corridor.material = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(col).withAlpha(alpha));
          ent.corridor.width = isSelected ? 2050 : 1450;
        }
      });

      /* 矢量发光路线显隐 */
      this.routeEntities.forEach(e => { e.show = opts.route !== false; });

      /* 三维 BIM 模型显隐 */
      const showBim = designMode || !!opts.bim;
      this.bimEntities.forEach(e => { e.show = showBim; });

      /* 工程点位底座光环显隐 */
      this.poiEntities.forEach(e => { e.show = opts.pois !== false; });
    }

    /* ----------------------------------------------------------------------
       7. 相机飞行控制（黄金构图：左下明水 BK0+000 -> 右上北安建华枢纽，全线完整入镜）
       ---------------------------------------------------------------------- */
    setOverviewImmediate() {
      if (!this.viewer) return;
      this.orbitActive = false;
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(125.92, 46.74, 62000),
        orientation: {
          heading: Cesium.Math.toRadians(9),
          pitch: Cesium.Math.toRadians(-29),
          roll: 0.0
        }
      });
    }

    flyToOverview(duration) {
      if (!this.ready) return;
      this.orbitActive = false;
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(125.92, 46.74, 62000),
        orientation: {
          heading: Cesium.Math.toRadians(9),
          pitch: Cesium.Math.toRadians(-29),
          roll: 0.0
        },
        duration: duration !== undefined ? duration : 1.4
      });
    }

    flyToSection(secId) {
      if (!this.ready) return;
      this.orbitActive = false;
      const sec = SECTION_RANGES.find(s => s.id === secId);
      if (!sec) return this.flyToOverview(1.2);
      const mid = getPointAtRatio((sec.start + sec.end) * 0.5);
      const target = Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 220);
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 14000), {
        offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(24), Cesium.Math.toRadians(-34), 28000),
        duration: 1.4
      });
    }

    flyToPoi(poiId) {
      if (!this.ready) return;
      this.orbitActive = false;
      const geo = POI_GEO[poiId] || POI_GEO.bridgeA;
      const target = Cesium.Cartesian3.fromDegrees(geo.lon, geo.lat, geo.alt);
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 3000), {
        offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(22), Cesium.Math.toRadians(-30), 11500),
        duration: 1.35
      });
    }

    flyToRoamingStation(stationId, viewMode, speed) {
      if (!this.ready) return;
      this.orbitActive = false;
      const r = ROAM_GEO[stationId] || ROAM_GEO.bridgeA;
      const isAlong = viewMode === 'along';
      const target = Cesium.Cartesian3.fromDegrees(r.lon, r.lat, r.alt);
      const dur = Math.max(0.7, 1.6 / (speed || 1));
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, isAlong ? 900 : 1800), {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(isAlong ? r.headingAlong : r.headingOver),
          Cesium.Math.toRadians(isAlong ? r.pitchAlong : r.pitchOver),
          isAlong ? r.rangeAlong : r.rangeOver
        ),
        duration: dur
      });
    }

    flyToDirection(dir) {
      if (!this.ready) return;
      const pt = dir === 'start' ? ROUTE_COORDS[0] : ROUTE_COORDS[ROUTE_COORDS.length - 1];
      const target = Cesium.Cartesian3.fromDegrees(pt[0], pt[1], 220);
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 8000), {
        offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(20), Cesium.Math.toRadians(-32), 22000),
        duration: 1.4
      });
    }

    setShowcaseBackdropMode(active) {
      this.orbitActive = !!active;
    }

    zoomIn() {
      if (!this.ready) return;
      const h = this.viewer.camera.positionCartographic.height;
      this.viewer.camera.zoomIn(Math.max(400, h * 0.28));
    }

    zoomOut() {
      if (!this.ready) return;
      const h = this.viewer.camera.positionCartographic.height;
      this.viewer.camera.zoomOut(Math.max(400, h * 0.35));
    }

    _showFallbackNotice(containerId, msg) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#061634;color:#93c5fd;font-size:14px;">${msg}</div>`;
    }
  }

  window.JIHEI_CESIUM = new JiheiCesiumEngine();
})();
