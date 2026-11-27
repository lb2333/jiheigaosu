/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

declare global {
  interface Window {
    Cesium?: any;
    CESIUM_BASE_URL?: string;
    JIHEI_CESIUM?: JiheiCesiumEngine;
    viewer?: any;
  }
}

const CESIUM_ION_TOKEN =
  process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNDcxY2E3Zi04YjcxLTQxMDYtYmVkMi0xZTBmYTMxNDI2ZmQiLCJpZCI6MjEzNjUyLCJpYXQiOjE3MTUxMzU3NTN9.8w7jF6ETAg1bmeWfSLNRO0xVrp5rlYCnDKJt_XD0K8Y';

const TDT_TK = process.env.NEXT_PUBLIC_TIANDITU_TOKEN ?? 'd0ff04fb27c18bfd43ef85d3dcf4dc7f';
const OFFLINE_ERROR_THRESHOLD = 6;

const CONTROL_POINTS: [number, number][] = [
  [125.8202, 47.2916],
  [125.915, 47.362],
  [125.982, 47.452],
  [126.015, 47.552],
  [125.992, 47.652],
  [126.028, 47.748],
  [126.135, 47.838],
  [126.252, 47.926],
  [126.328, 48.028],
  [126.362, 48.135],
  [126.4135, 48.2372],
];

function interpolateSpline(pts: [number, number][], samplesPerSeg: number): [number, number][] {
  const out: [number, number][] = [];
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
      const lon =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lat =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([lon, lat]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}

const ROUTE_COORDS = interpolateSpline(CONTROL_POINTS, 18);

const SECTION_RANGES = [
  { id: 'sec1', name: '一工区', start: 0.0, end: 0.16, color: '#22d3ee' },
  { id: 'sec2', name: '二工区', start: 0.16, end: 0.34, color: '#06b6d4' },
  { id: 'sec3', name: '三工区', start: 0.34, end: 0.51, color: '#38bdf8' },
  { id: 'sec4', name: '四工区', start: 0.51, end: 0.68, color: '#22d3ee' },
  { id: 'sec5', name: '五工区', start: 0.68, end: 0.84, color: '#0ea5e9' },
  { id: 'sec6', name: '六工区', start: 0.84, end: 1.0, color: '#38f2ff' },
];

export const POI_GEO: Record<string, { lon: number; lat: number; alt: number }> = {
  bridgeA: { lon: 125.982, lat: 47.452, alt: 235 },
  beamYardA: { lon: 126.115, lat: 47.508, alt: 220 },
  batchPlantA: { lon: 126.135, lat: 47.402, alt: 218 },
};

const ROAM_GEO: Record<
  string,
  {
    lon: number;
    lat: number;
    alt: number;
    headingOver: number;
    headingAlong: number;
    pitchOver: number;
    pitchAlong: number;
    rangeOver: number;
    rangeAlong: number;
  }
> = {
  start: { lon: 125.8202, lat: 47.2916, alt: 215, headingOver: 22, headingAlong: 34, pitchOver: -42, pitchAlong: -12, rangeOver: 18000, rangeAlong: 3600 },
  bridgeA: { lon: 125.982, lat: 47.452, alt: 235, headingOver: 20, headingAlong: 20, pitchOver: -40, pitchAlong: -11, rangeOver: 15000, rangeAlong: 3200 },
  beamYardA: { lon: 126.115, lat: 47.508, alt: 220, headingOver: 16, headingAlong: 18, pitchOver: -42, pitchAlong: -12, rangeOver: 13000, rangeAlong: 3000 },
  batchPlantA: { lon: 126.135, lat: 47.402, alt: 218, headingOver: 22, headingAlong: 24, pitchOver: -42, pitchAlong: -12, rangeOver: 13000, rangeAlong: 3000 },
  end: { lon: 126.4135, lat: 48.2372, alt: 260, headingOver: 16, headingAlong: 20, pitchOver: -40, pitchAlong: -12, rangeOver: 19000, rangeAlong: 4000 },
};

function getPointAtRatio(r: number): [number, number] {
  const idx = Math.max(0, Math.min(ROUTE_COORDS.length - 1, Math.round(r * (ROUTE_COORDS.length - 1))));
  return ROUTE_COORDS[idx];
}

function registerCustomMaterials(Cesium: any) {
  if (!Cesium.Material.JiheiFlowLineType) {
    const FlowType = 'JiheiFlowLine';
    Cesium.Material.JiheiFlowLineType = FlowType;
    Cesium.Material._materialCache.addMaterial(FlowType, {
      fabric: {
        type: FlowType,
        uniforms: {
          color: new Cesium.Color(0.22, 0.95, 1.0, 1.0),
          headColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          speed: 1.6,
          repeat: 10.0,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            float time = czm_frameNumber * 0.012 * speed;
            float pos = fract(st.s * repeat - time);
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
        `,
      },
      translucent: () => true,
    });

    function JiheiFlowLineMaterialProperty(this: any, options: any = {}) {
      this._definitionChanged = new Cesium.Event();
      this._color = options.color || Cesium.Color.fromCssColorString('#38f2ff');
      this._headColor = options.headColor || Cesium.Color.WHITE;
      this._speed = options.speed !== undefined ? options.speed : 1.5;
      this._repeat = options.repeat !== undefined ? options.repeat : 12.0;
    }
    Object.defineProperties(JiheiFlowLineMaterialProperty.prototype, {
      isConstant: { get: () => false },
      definitionChanged: {
        get: function (this: any) {
          return this._definitionChanged;
        },
      },
    });
    JiheiFlowLineMaterialProperty.prototype.getType = () => FlowType;
    JiheiFlowLineMaterialProperty.prototype.getValue = function (_t: any, result: any) {
      const out = result || {};
      out.color = this._color;
      out.headColor = this._headColor;
      out.speed = this._speed;
      out.repeat = this._repeat;
      return out;
    };
    JiheiFlowLineMaterialProperty.prototype.equals = function (other: any) {
      return this === other;
    };
    Cesium.JiheiFlowLineMaterialProperty = JiheiFlowLineMaterialProperty;
  }

  if (!Cesium.Material.JiheiPulseRingType) {
    const PulseType = 'JiheiPulseRing';
    Cesium.Material.JiheiPulseRingType = PulseType;
    Cesium.Material._materialCache.addMaterial(PulseType, {
      fabric: {
        type: PulseType,
        uniforms: {
          color: new Cesium.Color(0.22, 0.95, 1.0, 1.0),
          speed: 0.72,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 centered = materialInput.st - vec2(0.5);
            float dist = length(centered) * 2.0;
            if (dist > 1.0) { discard; }
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
        `,
      },
      translucent: () => true,
    });

    function JiheiPulseRingMaterialProperty(this: any, options: any = {}) {
      this._definitionChanged = new Cesium.Event();
      this._color = options.color || Cesium.Color.fromCssColorString('#38f2ff');
      this._speed = options.speed !== undefined ? options.speed : 0.72;
    }
    Object.defineProperties(JiheiPulseRingMaterialProperty.prototype, {
      isConstant: { get: () => false },
      definitionChanged: {
        get: function (this: any) {
          return this._definitionChanged;
        },
      },
    });
    JiheiPulseRingMaterialProperty.prototype.getType = () => PulseType;
    JiheiPulseRingMaterialProperty.prototype.getValue = function (_t: any, result: any) {
      const out = result || {};
      out.color = this._color;
      out.speed = this._speed;
      return out;
    };
    JiheiPulseRingMaterialProperty.prototype.equals = function (other: any) {
      return this === other;
    };
    Cesium.JiheiPulseRingMaterialProperty = JiheiPulseRingMaterialProperty;
  }
}

function createLocalDarkImageryProvider(Cesium: any) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
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
  }
  return new Cesium.SingleTileImageryProvider({
    url: canvas.toDataURL('image/png'),
    tileWidth: 512,
    tileHeight: 256,
    rectangle: Cesium.Rectangle.MAX_VALUE,
  });
}

export interface CesiumCallbacks {
  onPoiClick?: (poiId: string) => void;
  onSectionClick?: (secId: string) => void;
  onDirectionClick?: (dir: 'start' | 'end') => void;
  onFallbackNotice?: (msg: string) => void;
}

export class JiheiCesiumEngine {
  viewer: any = null;
  ready = false;
  layers: Record<string, any> = {};
  sectionEntities: Record<string, any> = {};
  routeEntities: any[] = [];
  bimEntities: any[] = [];
  poiEntities: any[] = [];
  moduleEntities: Map<string, any[]> = new Map();
  projectedPins: Array<{ el: HTMLElement; cartesian: any }> = [];
  overlayRoot: HTMLElement | null = null;
  orbitActive = false;
  sceneVisible = true;
  renderActive = true;
  offlineFallbackActive = false;
  tileErrorCount = 0;
  canvasWidth = 0;
  canvasHeight = 0;
  private resizeObserver: ResizeObserver | null = null;
  private callbacks: CesiumCallbacks = {};

  setCallbacks(callbacks: CesiumCallbacks) {
    this.callbacks = callbacks;
  }

  init(containerEl: HTMLElement, overlayEl: HTMLElement, callbacks?: CesiumCallbacks): boolean {
    if (this.viewer && this.ready) {
      if (callbacks) this.callbacks = callbacks;
      return true;
    }
    this.overlayRoot = overlayEl;
    if (callbacks) this.callbacks = callbacks;

    const Cesium = window.Cesium;
    if (!Cesium) return false;

    try {
      Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
      registerCustomMaterials(Cesium);

      const viewerOpts: Record<string, any> = {
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
          webgl: { alpha: false, antialias: true, preserveDrawingBuffer: false },
        },
      };

      if (Cesium.Terrain && Cesium.Terrain.fromWorldTerrain) {
        try {
          viewerOpts.terrain = Cesium.Terrain.fromWorldTerrain({
            requestVertexNormals: true,
            requestWaterMask: false,
          });
        } catch {
          // fallback to ellipsoid
        }
      }

      this.viewer = new Cesium.Viewer(containerEl, viewerOpts);
      window.viewer = this.viewer;

      if (this.viewer.terrainProvider?.errorEvent) {
        this.viewer.terrainProvider.errorEvent.addEventListener(() => {
          if (!(this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)) {
            this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
          }
        });
      }

      const tdtImg = new Cesium.WebMapTileServiceImageryProvider({
        url: `https://{s}.tianditu.gov.cn/img_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=img&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=${TDT_TK}`,
        layer: 'img',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        credit: new Cesium.Credit('天地图全球影像服务'),
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        maximumLevel: 15,
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: Array.from({ length: 19 }, (_, i) => String(i + 1)),
      });
      this.layers.satellite = this.viewer.imageryLayers.addImageryProvider(tdtImg);
      this.layers.satellite.brightness = 1.16;
      this.layers.satellite.contrast = 1.12;
      this.layers.satellite.saturation = 1.18;
      this.layers.satellite.gamma = 1.02;

      const tdtNote = new Cesium.WebMapTileServiceImageryProvider({
        url: `https://{s}.tianditu.gov.cn/cia_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=cia&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=${TDT_TK}`,
        layer: 'cia',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        credit: new Cesium.Credit('天地图中文注记服务'),
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        maximumLevel: 18,
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: Array.from({ length: 19 }, (_, i) => String(i + 1)),
      });
      this.layers.labels = this.viewer.imageryLayers.addImageryProvider(tdtNote);

      this.layers.darkBase = this.viewer.imageryLayers.addImageryProvider(
        createLocalDarkImageryProvider(Cesium)
      );
      this.layers.darkBase.show = false;

      if (tdtImg.errorEvent) {
        tdtImg.errorEvent.addEventListener(() => {
          this.tileErrorCount += 1;
          if (!this.offlineFallbackActive && this.tileErrorCount >= OFFLINE_ERROR_THRESHOLD) {
            this.offlineFallbackActive = true;
            this.layers.satellite.show = false;
            this.layers.darkBase.show = true;
            this.layers.techGrid.show = true;
            this.callbacks.onFallbackNotice?.('外网影像受限，已自动切换为本地三维数字孪生兜底底图');
          }
        });
      }

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
          tileMatrixLabels: Array.from({ length: 14 }, (_, i) => String(i + 1)),
        })
      );
      this.layers.osmTopo.show = false;
      this.layers.osmTopo.alpha = 0.36;

      this.layers.techGrid = this.viewer.imageryLayers.addImageryProvider(
        new Cesium.GridImageryProvider({
          cells: 6,
          color: Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.32),
          glowColor: Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.18),
          glowWidth: 2,
          backgroundColor: Cesium.Color.TRANSPARENT,
        })
      );
      this.layers.techGrid.show = false;
      this.viewer.imageryLayers.raiseToTop(this.layers.labels);

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
      if (scene.postProcessStages.bloom) scene.postProcessStages.bloom.enabled = false;

      const ctrl = scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 450;
      ctrl.maximumZoomDistance = 320000;

      this._buildSectionCorridorVectors(Cesium);
      this._buildGlowingRouteVectors(Cesium);
      this._buildBim3DModels(Cesium);
      this._buildPoiVectorAnchors(Cesium);
      this._bindSceneEvents(Cesium);

      this.ready = true;
      this.setOverviewImmediate();
      return true;
    } catch (err) {
      console.error('[JiheiCesiumEngine] Init failed:', err);
      return false;
    }
  }

  trackModuleEntity(moduleId: string, entityOptions: any) {
    if (!this.viewer) return null;
    const ent = this.viewer.entities.add(entityOptions);
    const list = this.moduleEntities.get(moduleId) ?? [];
    list.push(ent);
    this.moduleEntities.set(moduleId, list);
    return ent;
  }

  clearModuleEntities(moduleId: string) {
    if (!this.viewer) return;
    const list = this.moduleEntities.get(moduleId);
    if (!list) return;
    for (const ent of list) {
      try {
        this.viewer.entities.remove(ent);
      } catch {
        // ignore
      }
    }
    this.moduleEntities.delete(moduleId);
  }

  private _buildSectionCorridorVectors(Cesium: any) {
    const total = ROUTE_COORDS.length - 1;
    SECTION_RANGES.forEach((sec, idx) => {
      const iStart = Math.floor(sec.start * total);
      const iEnd = Math.min(total, Math.ceil(sec.end * total));
      const slice = ROUTE_COORDS.slice(iStart, iEnd + 1);
      const flat: number[] = [];
      slice.forEach((p) => flat.push(p[0], p[1]));

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
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });
      entity._secId = sec.id;
      this.sectionEntities[sec.id] = entity;

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
              dashLength: 8,
            }),
          },
        });
        this.sectionEntities['tick_' + sec.id] = tick;
      }
    });
  }

  private _buildGlowingRouteVectors(Cesium: any) {
    const flat: number[] = [];
    const flatElevated: number[] = [];
    ROUTE_COORDS.forEach((p) => {
      flat.push(p[0], p[1]);
      flatElevated.push(p[0], p[1], 300);
    });
    const positions = Cesium.Cartesian3.fromDegreesArray(flat);
    const elevatedPositions = Cesium.Cartesian3.fromDegreesArrayHeights(flatElevated);

    const glowOuter = this.viewer.entities.add({
      polyline: {
        positions,
        width: 9,
        clampToGround: true,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.22,
          taperPower: 1.0,
          color: Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.58),
        }),
      },
    });

    const flowCore = this.viewer.entities.add({
      polyline: {
        positions: elevatedPositions,
        width: 3.2,
        clampToGround: false,
        material: new Cesium.JiheiFlowLineMaterialProperty({
          color: Cesium.Color.fromCssColorString('#38e8ff').withAlpha(0.88),
          headColor: Cesium.Color.fromCssColorString('#e0faff'),
          speed: 1.15,
          repeat: 12.0,
        }),
      },
    });

    const leftFlat: number[] = [];
    const rightFlat: number[] = [];
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
        material: Cesium.Color.fromCssColorString('#67e8f9').withAlpha(0.46),
      },
    });
    const rightEdge = this.viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(rightFlat),
        width: 1.3,
        clampToGround: true,
        material: Cesium.Color.fromCssColorString('#67e8f9').withAlpha(0.46),
      },
    });

    [0.14, 0.38, 0.62, 0.85].forEach((ratio) => {
      const i = Math.floor(ratio * (ROUTE_COORDS.length - 4));
      const p1 = ROUTE_COORDS[i];
      const p2 = ROUTE_COORDS[i + 3];
      const arrow = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([p1[0], p1[1], p2[0], p2[1]]),
          width: 8,
          clampToGround: true,
          material: new Cesium.PolylineArrowMaterialProperty(
            Cesium.Color.fromCssColorString('#cffafe').withAlpha(0.72)
          ),
        },
      });
      this.routeEntities.push(arrow);
    });

    this.routeEntities.push(glowOuter, flowCore, leftEdge, rightEdge);
  }

  private _buildBim3DModels(Cesium: any) {
    const cyanFill = Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.45);
    const cyanWire = Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.95);
    const goldFill = Cesium.Color.fromCssColorString('#facc15').withAlpha(0.85);

    const b = POI_GEO.bridgeA;
    this.bimEntities.push(
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 380),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 380),
          new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(28), 0, 0)
        ),
        box: { dimensions: new Cesium.Cartesian3(380, 2600, 65), material: cyanFill, outline: true, outlineColor: cyanWire },
        show: false,
      })
    );
    for (let k = -2; k <= 2; k++) {
      this.bimEntities.push(
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(b.lon + k * 0.0024, b.lat + k * 0.0042, 240),
          cylinder: {
            length: 280,
            topRadius: 55,
            bottomRadius: 72,
            material: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.55),
            outline: true,
            outlineColor: cyanWire,
          },
          show: false,
        })
      );
    }

    const y = POI_GEO.beamYardA;
    this.bimEntities.push(
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(y.lon, y.lat, 260),
        box: {
          dimensions: new Cesium.Cartesian3(1400, 900, 45),
          material: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.35),
          outline: true,
          outlineColor: cyanWire,
        },
        show: false,
      }),
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(y.lon, y.lat, 420),
        box: { dimensions: new Cesium.Cartesian3(950, 120, 110), material: goldFill, outline: true, outlineColor: Cesium.Color.WHITE },
        show: false,
      })
    );

    const p = POI_GEO.batchPlantA;
    [-0.0022, 0, 0.0022].forEach((dx) => {
      this.bimEntities.push(
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(p.lon + dx, p.lat, 340),
          cylinder: {
            length: 340,
            topRadius: 95,
            bottomRadius: 95,
            material: Cesium.Color.fromCssColorString('#7dd3fc').withAlpha(0.68),
            outline: true,
            outlineColor: Cesium.Color.WHITE,
          },
          show: false,
        })
      );
    });
  }

  private _buildPoiVectorAnchors(Cesium: any) {
    const pulseMat = new Cesium.JiheiPulseRingMaterialProperty({
      color: Cesium.Color.fromCssColorString('#38f2ff'),
      speed: 0.72,
    });
    Object.entries(POI_GEO).forEach(([poiId, geo]) => {
      const pos = Cesium.Cartesian3.fromDegrees(geo.lon, geo.lat, 120);
      const pulseCircle = this.viewer.entities.add({
        id: 'poi_ring_' + poiId,
        position: pos,
        ellipse: { semiMajorAxis: 1620, semiMinorAxis: 1620, material: pulseMat, outline: false },
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
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      coreDot._poiId = poiId;
      this.poiEntities.push(pulseCircle, coreDot);
    });
  }

  syncHtmlOverlays(config: {
    showRoute?: boolean;
    showSections?: boolean;
    showPois?: boolean;
    activeSectionId?: string | null;
    activePoiId?: string;
    poiObjects?: Record<string, { id: string; name: string; icon: string }>;
    icons?: Record<string, string>;
    showViewpoint?: boolean;
    roamingStationId?: string;
  }) {
    const Cesium = window.Cesium;
    if (!this.overlayRoot || !Cesium) return;
    this.projectedPins = [];
    this.overlayRoot.innerHTML = '';

    const icons = config.icons || {};
    const addPin = (html: string, lon: number, lat: number, alt = 120) => {
      const el = document.createElement('div');
      el.className = 'cesium-pin-anchor';
      el.innerHTML = html;
      this.overlayRoot!.appendChild(el);
      this.projectedPins.push({
        el,
        cartesian: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
      });
    };

    if (config.showRoute) {
      const pStart = ROUTE_COORDS[0];
      const pEnd = ROUTE_COORDS[ROUTE_COORDS.length - 1];
      addPin(
        `<button class="dir-badge" data-dir="start" title="明水县北新发四队东南侧（BK0+000）">← 明水方向（BK0+000）</button>`,
        pStart[0] - 0.085,
        pStart[1] - 0.025,
        180
      );
      addPin(
        `<button class="dir-badge" data-dir="end" title="北安市建华枢纽互通">北安方向（建华枢纽）→</button>`,
        pEnd[0] + 0.045,
        pEnd[1] + 0.025,
        220
      );
    }

    if (config.showSections) {
      SECTION_RANGES.forEach((sec) => {
        const pt = getPointAtRatio((sec.start + sec.end) * 0.5);
        const active = config.activeSectionId === sec.id ? 'active' : '';
        addPin(
          `<button class="work-section-tag ${active}" data-map-sec="${sec.id}">${sec.name}</button>`,
          pt[0] - 0.095,
          pt[1] + 0.015,
          220
        );
      });
    }

    if (config.showPois && config.poiObjects) {
      Object.values(config.poiObjects).forEach((poi) => {
        const geo = POI_GEO[poi.id];
        if (!geo) return;
        const active = config.activePoiId === poi.id ? 'active' : '';
        addPin(
          `<div class="poi-marker ${active}" data-poi="${poi.id}" style="position:relative;transform:translate(-50%,-100%);">
            <div class="poi-pill">${icons[poi.icon] || ''}<span>${poi.name}</span></div>
            <div class="poi-stem"></div>
          </div>`,
          geo.lon,
          geo.lat,
          geo.alt
        );
      });
    }

    if (config.showViewpoint && config.roamingStationId) {
      const rGeo = ROAM_GEO[config.roamingStationId] || ROAM_GEO.bridgeA;
      addPin(
        `<div class="camera-viewpoint-badge" style="position:relative;transform:translate(-50%,-138%);">
          <div class="camera-viewpoint-pill">${icons.camera || ''}<span>当前视点</span></div>
          <div class="camera-viewpoint-arrow"></div>
        </div>`,
        rGeo.lon,
        rGeo.lat,
        rGeo.alt + 160
      );
    }

    this._updateProjectedPositions();
  }

  private _syncCanvasSize() {
    if (!this.viewer) return;
    const c = this.viewer.scene.canvas;
    this.canvasWidth = c.clientWidth || window.innerWidth;
    this.canvasHeight = c.clientHeight || window.innerHeight;
  }

  private _updateProjectedPositions() {
    const Cesium = window.Cesium;
    if (!this.viewer || !this.renderActive || !this.projectedPins.length || !Cesium) return;
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

  setRenderActive(visible: boolean) {
    this.sceneVisible = !!visible;
    this._applyRenderLoopState();
  }

  private _applyRenderLoopState() {
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

  private _bindSceneEvents(Cesium: any) {
    this._syncCanvasSize();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this._syncCanvasSize());
      this.resizeObserver.observe(this.viewer.container);
    }
    document.addEventListener('visibilitychange', () => this._applyRenderLoopState());

    this.viewer.scene.postRender.addEventListener(() => {
      if (!this.renderActive) return;
      this._updateProjectedPositions();
      if (this.orbitActive) {
        this.viewer.camera.rotateRight(0.00035);
      }
    });

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const picked = this.viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id) {
        if (picked.id._poiId) this.callbacks.onPoiClick?.(picked.id._poiId);
        else if (picked.id._secId) this.callbacks.onSectionClick?.(picked.id._secId);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    if (this.overlayRoot) {
      this.overlayRoot.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const poiEl = target.closest<HTMLElement>('[data-poi]');
        if (poiEl?.dataset.poi) {
          this.callbacks.onPoiClick?.(poiEl.dataset.poi);
          return;
        }
        const secEl = target.closest<HTMLElement>('[data-map-sec]');
        if (secEl?.dataset.mapSec) {
          this.callbacks.onSectionClick?.(secEl.dataset.mapSec);
          return;
        }
        const dirEl = target.closest<HTMLElement>('[data-dir]');
        if (dirEl?.dataset.dir) {
          this.flyToDirection(dirEl.dataset.dir as 'start' | 'end');
          this.callbacks.onDirectionClick?.(dirEl.dataset.dir as 'start' | 'end');
        }
      });
    }
  }

  applyLayers(opts: {
    satellite?: boolean;
    uav?: boolean;
    bim?: boolean;
    pois?: boolean;
    sections?: boolean;
    route?: boolean;
    designMode?: boolean;
    activeSectionId?: string | null;
  }) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    const designMode = !!opts.designMode;
    const useFallback = this.offlineFallbackActive;

    this.layers.satellite.show = !useFallback && !designMode && opts.uav !== false;
    this.layers.darkBase.show = useFallback || designMode || opts.uav === false;
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

    Object.entries(this.sectionEntities).forEach(([key, ent]) => {
      ent.show = opts.sections !== false;
      if (!key.startsWith('tick_') && ent.corridor) {
        const isSelected = opts.activeSectionId && ent._secId === opts.activeSectionId;
        const isDimmed = opts.activeSectionId && ent._secId !== opts.activeSectionId;
        const col = isSelected ? '#38f2ff' : '#22d3ee';
        const alpha = isSelected ? 0.38 : isDimmed ? 0.08 : 0.19;
        ent.corridor.material = new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(col).withAlpha(alpha)
        );
        ent.corridor.width = isSelected ? 2050 : 1450;
      }
    });

    this.routeEntities.forEach((e) => { e.show = opts.route !== false; });
    const showBim = designMode || !!opts.bim;
    this.bimEntities.forEach((e) => { e.show = showBim; });
    this.poiEntities.forEach((e) => { e.show = opts.pois !== false; });
  }

  setOverviewImmediate() {
    const Cesium = window.Cesium;
    if (!this.viewer || !Cesium) return;
    this.orbitActive = false;
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(125.92, 46.74, 62000),
      orientation: { heading: Cesium.Math.toRadians(9), pitch: Cesium.Math.toRadians(-29), roll: 0.0 },
    });
  }

  flyToOverview(duration = 1.4) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    this.orbitActive = false;
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(125.92, 46.74, 62000),
      orientation: { heading: Cesium.Math.toRadians(9), pitch: Cesium.Math.toRadians(-29), roll: 0.0 },
      duration,
    });
  }

  flyToSection(secId: string) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    this.orbitActive = false;
    const sec = SECTION_RANGES.find((s) => s.id === secId);
    if (!sec) return this.flyToOverview(1.2);
    const mid = getPointAtRatio((sec.start + sec.end) * 0.5);
    const target = Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 220);
    this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 14000), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(24), Cesium.Math.toRadians(-34), 28000),
      duration: 1.4,
    });
  }

  flyToPoi(poiId: string) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    this.orbitActive = false;
    const geo = POI_GEO[poiId] || POI_GEO.bridgeA;
    const target = Cesium.Cartesian3.fromDegrees(geo.lon, geo.lat, geo.alt);
    this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 3000), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(22), Cesium.Math.toRadians(-30), 11500),
      duration: 1.35,
    });
  }

  flyToRoamingStation(stationId: string, viewMode: string, speed = 1.0) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
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
      duration: dur,
    });
  }

  flyToDirection(dir: 'start' | 'end') {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    const pt = dir === 'start' ? ROUTE_COORDS[0] : ROUTE_COORDS[ROUTE_COORDS.length - 1];
    const target = Cesium.Cartesian3.fromDegrees(pt[0], pt[1], 220);
    this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 8000), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(20), Cesium.Math.toRadians(-32), 22000),
      duration: 1.4,
    });
  }

  setShowcaseBackdropMode(active: boolean) {
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
}

export function getGlobalCesiumEngine(): JiheiCesiumEngine {
  if (typeof window === 'undefined') {
    return new JiheiCesiumEngine();
  }
  if (!window.JIHEI_CESIUM) {
    window.JIHEI_CESIUM = new JiheiCesiumEngine();
  }
  return window.JIHEI_CESIUM;
}
