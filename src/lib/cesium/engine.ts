/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  ALL_HIGHWAY_ASSETS,
  getPointAtRatio,
  HIGHWAY_FACILITIES,
  HIGHWAY_MODEL_ASSETS,
  type HighwayAssetItem,
  ROUTE_COORDS,
  sampleRoutePose,
  SECTION_RANGES,
} from './highway-assets';

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

export const POI_GEO: Record<string, { lon: number; lat: number; alt: number }> = {
  bridgeA: { lon: 125.982, lat: 47.452, alt: 235 },
  beamYardA: { lon: 126.115, lat: 47.508, alt: 220 },
  batchPlantA: { lon: 126.135, lat: 47.402, alt: 218 },
};

interface BimStageSpec {
  id: string;
  name: string;
  resolvePose: () => { lon: number; lat: number; headingRad: number };
  focusRange: number;
  focusRadius: number;
  stages: [string, string, string, string];
  overlapAssetId?: string;
}

const BIM_STAGE_CONFIGS: BimStageSpec[] = [
  {
    id: 'bridgeA',
    name: '桥梁示例A',
    resolvePose: () => {
      const p = sampleRoutePose(0.2);
      return { lon: p.lon, lat: p.lat, headingRad: p.headingRad + Math.PI / 2 };
    },
    focusRange: 540,
    focusRadius: 165,
    stages: [
      '/models/bim/bim-bridge-s1.glb',
      '/models/bim/bim-bridge-s2.glb',
      '/models/bim/bim-bridge-s3.glb',
      '/models/bim/bim-bridge-s4.glb',
    ],
    overlapAssetId: 'br_l2',
  },
  {
    id: 'beamYardA',
    name: '梁场示例A',
    resolvePose: () => ({ lon: POI_GEO.beamYardA.lon, lat: POI_GEO.beamYardA.lat, headingRad: 0.35 }),
    focusRange: 360,
    focusRadius: 110,
    stages: [
      '/models/bim/bim-yard-s1.glb',
      '/models/bim/bim-yard-s2.glb',
      '/models/bim/bim-yard-s3.glb',
      '/models/bim/bim-yard-s4.glb',
    ],
  },
  {
    id: 'batchPlantA',
    name: '拌合站示例A',
    resolvePose: () => ({ lon: POI_GEO.batchPlantA.lon, lat: POI_GEO.batchPlantA.lat, headingRad: 0.25 }),
    focusRange: 320,
    focusRadius: 95,
    stages: [
      '/models/bim/bim-plant-s1.glb',
      '/models/bim/bim-plant-s2.glb',
      '/models/bim/bim-plant-s3.glb',
      '/models/bim/bim-plant-s4.glb',
    ],
  },
  {
    id: 'subgrade1',
    name: '一工区K18+400路基',
    resolvePose: () => sampleRoutePose(0.125),
    focusRange: 520,
    focusRadius: 175,
    stages: [
      '/models/bim/bim-subgrade-s1.glb',
      '/models/bim/bim-subgrade-s2.glb',
      '/models/bim/bim-subgrade-s3.glb',
      '/models/bim/bim-subgrade-s4.glb',
    ],
  },
];

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
            float fill = smoothstep(t1 + 0.04, 0.0, dist) * (1.0 - t1) * 0.24;
            float outerRim = smoothstep(0.94, 0.985, dist) * (1.0 - smoothstep(0.985, 1.0, dist)) * 0.42;
            float alpha = clamp((ring1 + ring2 + fill + outerRim) * color.a, 0.0, 0.82);
            material.diffuse = color.rgb;
            material.emission = color.rgb * (0.62 + (ring1 + ring2) * 0.88);
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
  onAssetClick?: (asset: HighwayAssetItem) => void;
  onFallbackNotice?: (msg: string) => void;
}

export class JiheiCesiumEngine {
  viewer: any = null;
  ready = false;
  layers: Record<string, any> = {};
  sectionEntities: Record<string, any> = {};
  routeEntities: any[] = [];
  highwayRoadEntities: any[] = [];
  highwayModelEntities: any[] = [];
  facilityEntities: any[] = [];
  bimEntities: any[] = [];
  poiEntities: any[] = [];
  private poiRingEntities: any[] = [];
  private poiDotEntities: any[] = [];
  private poisLayerVisible = true;
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
  private assetHeights: Map<string, number> = new Map();
  private bimHeights: Map<string, number> = new Map();
  private bimOverlapHiddenIds: string[] = [];
  private activeBimObjectId: string | null = null;
  private bimCameraNeedsTerrainReframe = false;
  private roadSyncUpdaters: Array<(heights: number[]) => void> = [];
  private flowCoreEntity: any = null;

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
          const worldTerrain = Cesium.Terrain.fromWorldTerrain({
            requestVertexNormals: true,
            requestWaterMask: false,
          });
          worldTerrain.errorEvent?.addEventListener(() => {
            if (this.viewer && !(this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider)) {
              this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
              this.assetHeights.clear();
              this.bimHeights.clear();
              BIM_STAGE_CONFIGS.forEach((spec) => {
                const pose = spec.resolvePose();
                const zeroPos = Cesium.Cartesian3.fromDegrees(pose.lon, pose.lat, 0);
                for (let s = 0; s < 4; s++) {
                  const ent = this.viewer?.entities.getById(`bim_${spec.id}_s${s + 1}`);
                  if (ent) ent.position = zeroPos;
                }
              });
            }
          });
          worldTerrain.readyEvent?.addEventListener((provider: any) => {
            this._syncAssetTerrainHeights(Cesium, provider);
          });
          viewerOpts.terrain = worldTerrain;
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
      ctrl.minimumZoomDistance = 80;
      ctrl.maximumZoomDistance = 320000;

      this._buildSectionCorridorVectors(Cesium);
      this._buildGlowingRouteVectors(Cesium);
      this._buildHighway3DRoad(Cesium);
      this._buildHighway3DModels(Cesium);
      this._buildBim3DModels(Cesium);
      if (
        this.viewer.terrainProvider &&
        !(this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) &&
        this.viewer.terrainProvider.availability
      ) {
        this._syncAssetTerrainHeights(Cesium, this.viewer.terrainProvider);
      }
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
      flatElevated.push(p[0], p[1], 1.5);
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
    this.flowCoreEntity = flowCore;

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

  private _buildHighway3DRoad(Cesium: any) {
    this.roadSyncUpdaters = [];
    const n = ROUTE_COORDS.length;
    const zeroHeights = new Array<number>(n).fill(0);

    const offsetPoint = (i: number, offsetMeters: number): [number, number] => {
      const cur = ROUTE_COORDS[i];
      const prev = ROUTE_COORDS[Math.max(0, i - 1)];
      const next = ROUTE_COORDS[Math.min(n - 1, i + 1)];
      const cosLat = Math.cos((cur[1] * Math.PI) / 180);
      const dE = (next[0] - prev[0]) * cosLat;
      const dN = next[1] - prev[1];
      const len = Math.hypot(dE, dN) || 1;
      const nx = -dN / len;
      const ny = dE / len;
      const dLon = (nx * offsetMeters) / (111320 * cosLat);
      const dLat = (ny * offsetMeters) / 110540;
      return [cur[0] + dLon, cur[1] + dLat];
    };

    const buildRibbonHierarchy = (start: number, end: number, halfW: number, heights: number[], zAdd: number) => {
      const flatH: number[] = [];
      for (let i = start; i <= end; i++) {
        const [lon, lat] = offsetPoint(i, -halfW);
        flatH.push(lon, lat, (heights[i] ?? 0) + zAdd);
      }
      for (let i = end; i >= start; i--) {
        const [lon, lat] = offsetPoint(i, halfW);
        flatH.push(lon, lat, (heights[i] ?? 0) + zAdd);
      }
      return new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(flatH));
    };

    const buildLinePositions = (offsetMeters: number, heights: number[], zAdd: number) => {
      const flatH: number[] = [];
      for (let i = 0; i < n; i++) {
        const [lon, lat] = offsetMeters === 0 ? ROUTE_COORDS[i] : offsetPoint(i, offsetMeters);
        flatH.push(lon, lat, (heights[i] ?? 0) + zAdd);
      }
      return Cesium.Cartesian3.fromDegreesArrayHeights(flatH);
    };

    const closeDisplay = new Cesium.DistanceDisplayCondition(0, 35000);
    const dashDisplay = new Cesium.DistanceDisplayCondition(0, 26000);

    const chunkStep = 15;
    for (let start = 0; start < n - 1; start += chunkStep) {
      const end = Math.min(n - 1, start + chunkStep);
      const isFirst = start === 0;
      const asphaltEnt = this.viewer.entities.add({
        ...(isFirst ? { id: 'hw_road_asphalt' } : {}),
        name: 'G1211 双向四车道主线（26m路基）',
        polygon: {
          hierarchy: buildRibbonHierarchy(start, end, 13.0, zeroHeights, 0.25),
          perPositionHeight: true,
          material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString('#1e2530').withAlpha(0.95)),
          outline: false,
        },
      });
      this.highwayRoadEntities.push(asphaltEnt);

      const medianEnt = this.viewer.entities.add({
        polygon: {
          hierarchy: buildRibbonHierarchy(start, end, 0.9, zeroHeights, 0.38),
          perPositionHeight: true,
          material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString('#2d6a4f').withAlpha(0.96)),
          outline: false,
          distanceDisplayCondition: closeDisplay,
        },
      });
      this.highwayRoadEntities.push(medianEnt);

      this.roadSyncUpdaters.push((heights: number[]) => {
        asphaltEnt.polygon.hierarchy = buildRibbonHierarchy(start, end, 13.0, heights, 0.25);
        medianEnt.polygon.hierarchy = buildRibbonHierarchy(start, end, 0.9, heights, 0.38);
      });
    }

    [-11.2, -1.5, 1.5, 11.2].forEach((off) => {
      const lineEnt = this.viewer.entities.add({
        polyline: {
          positions: buildLinePositions(off, zeroHeights, 0.48),
          width: 1.5,
          clampToGround: false,
          material: Cesium.Color.WHITE.withAlpha(0.92),
          distanceDisplayCondition: closeDisplay,
        },
      });
      this.highwayRoadEntities.push(lineEnt);
      this.roadSyncUpdaters.push((heights: number[]) => {
        lineEnt.polyline.positions = buildLinePositions(off, heights, 0.48);
      });
    });

    [-6.3, 6.3].forEach((off) => {
      const dashEnt = this.viewer.entities.add({
        polyline: {
          positions: buildLinePositions(off, zeroHeights, 0.48),
          width: 1.4,
          clampToGround: false,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.WHITE.withAlpha(0.85),
            dashLength: 14,
          }),
          distanceDisplayCondition: dashDisplay,
        },
      });
      this.highwayRoadEntities.push(dashEnt);
      this.roadSyncUpdaters.push((heights: number[]) => {
        dashEnt.polyline.positions = buildLinePositions(off, heights, 0.48);
      });
    });
  }

  private _buildHighway3DModels(Cesium: any) {
    HIGHWAY_MODEL_ASSETS.forEach((asset) => {
      if (!asset.modelUrl) return;
      const { lon, lat, headingRad } = sampleRoutePose(asset.ratio);
      const isBridge =
        asset.category === 'bridge_large' ||
        asset.category === 'bridge_medium' ||
        asset.category === 'bridge_small';
      const modelHeading = isBridge ? headingRad + Math.PI / 2 : headingRad;
      const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        pos,
        new Cesium.HeadingPitchRoll(modelHeading, 0, 0)
      );

      const isIc = asset.category === 'interchange';
      const isLg = asset.category === 'bridge_large';
      const isMd = asset.category === 'bridge_medium';
      const maxModelDist = isIc ? 140000 : isLg ? 110000 : 75000;
      const maxLabelDist = isIc ? 140000 : isLg ? 80000 : 28000;

      const modelEnt = this.viewer.entities.add({
        id: 'hw_model_' + asset.id,
        name: asset.name,
        position: pos,
        orientation,
        model: {
          uri: asset.modelUrl,
          scale: asset.scale ?? 1.0,
          heightReference: Cesium.HeightReference.NONE,
          minimumPixelSize: isIc ? 22 : isLg ? 16 : 12,
          maximumScale: isIc ? 3.5 : 3.0,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, maxModelDist),
        },
      });
      modelEnt._highwayAsset = asset;
      this.highwayModelEntities.push(modelEnt);

      const pointColor = isIc
        ? '#facc15'
        : isLg
          ? '#38f2ff'
          : isMd
            ? '#60a5fa'
            : '#93c5fd';

      const markerEnt = this.viewer.entities.add({
        id: 'hw_marker_' + asset.id,
        name: asset.name,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 22),
        point: {
          pixelSize: isIc ? 9 : isLg ? 7 : 5.5,
          color: Cesium.Color.fromCssColorString(pointColor),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1.5,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, maxModelDist),
        },
        label: {
          text: asset.name,
          font: '600 12px "Microsoft YaHei", sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#081c40').withAlpha(0.78),
          backgroundPadding: new Cesium.Cartesian2(6, 4),
          pixelOffset: new Cesium.Cartesian2(0, -16),
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, maxLabelDist),
        },
      });
      markerEnt._highwayAsset = asset;
      this.highwayModelEntities.push(markerEnt);
    });

    HIGHWAY_FACILITIES.forEach((fac) => {
      const { lon, lat } = sampleRoutePose(fac.ratio);
      const isSvc = fac.category === 'service_area';
      const facEnt = this.viewer.entities.add({
        id: 'hw_fac_' + fac.id,
        name: fac.name,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 12),
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString(isSvc ? '#34d399' : '#fb923c'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 90000),
        },
        label: {
          text: fac.name,
          font: '600 12px "Microsoft YaHei", sans-serif',
          fillColor: Cesium.Color.fromCssColorString(isSvc ? '#a7f3d0' : '#fed7aa'),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#081c40').withAlpha(0.78),
          backgroundPadding: new Cesium.Cartesian2(6, 4),
          pixelOffset: new Cesium.Cartesian2(0, -16),
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 90000),
        },
      });
      facEnt._highwayAsset = fac;
      this.facilityEntities.push(facEnt);
    });
  }

  private _applySampledAssetPose(Cesium: any, asset: HighwayAssetItem, lon: number, lat: number, h: number) {
    this.assetHeights.set(asset.id, h);
    const modelEnt = this.viewer?.entities.getById('hw_model_' + asset.id);
    if (modelEnt) {
      modelEnt.position = Cesium.Cartesian3.fromDegrees(lon, lat, h);
    }
    const markerEnt = this.viewer?.entities.getById('hw_marker_' + asset.id);
    if (markerEnt) {
      markerEnt.position = Cesium.Cartesian3.fromDegrees(lon, lat, h + 22);
    }
    const facEnt = this.viewer?.entities.getById('hw_fac_' + asset.id);
    if (facEnt) {
      facEnt.position = Cesium.Cartesian3.fromDegrees(lon, lat, h + 12);
    }
  }

  private _syncAssetTerrainHeights(Cesium: any, provider?: any) {
    if (!this.viewer) return;
    const tp = provider || this.viewer.terrainProvider;
    if (!tp || tp instanceof Cesium.EllipsoidTerrainProvider || !tp.availability) {
      return;
    }

    const poses = ALL_HIGHWAY_ASSETS.map((asset) => ({
      asset,
      pose: sampleRoutePose(asset.ratio),
    }));
    const poiEntries = Object.entries(POI_GEO);

    const assetCartos = poses.map(({ pose }) => Cesium.Cartographic.fromDegrees(pose.lon, pose.lat));
    const routeCartos = ROUTE_COORDS.map((p) => Cesium.Cartographic.fromDegrees(p[0], p[1]));
    const poiCartos = poiEntries.map(([, g]) => Cesium.Cartographic.fromDegrees(g.lon, g.lat));
    const bimPoses = BIM_STAGE_CONFIGS.map((spec) => ({ spec, pose: spec.resolvePose() }));
    const bimCartos = bimPoses.map(({ pose }) => Cesium.Cartographic.fromDegrees(pose.lon, pose.lat));

    Promise.resolve(Cesium.sampleTerrainMostDetailed(tp, [...assetCartos, ...routeCartos, ...poiCartos, ...bimCartos]))
      .then((updated: any[]) => {
        if (!this.viewer || !Array.isArray(updated)) return;
        const aCount = assetCartos.length;
        const rCount = routeCartos.length;
        const pCount = poiCartos.length;

        for (let i = 0; i < aCount; i++) {
          const h = updated[i]?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000) {
            const { asset, pose } = poses[i];
            this._applySampledAssetPose(Cesium, asset, pose.lon, pose.lat, h);
          }
        }

        const routeHeights: number[] = [];
        let lastValid = 220;
        for (let i = 0; i < rCount; i++) {
          const h = updated[aCount + i]?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000) {
            lastValid = h;
            routeHeights.push(h);
          } else {
            routeHeights.push(lastValid);
          }
        }
        this.roadSyncUpdaters.forEach((fn) => fn(routeHeights));

        if (this.flowCoreEntity?.polyline) {
          const flowFlat: number[] = [];
          for (let i = 0; i < rCount; i++) {
            flowFlat.push(ROUTE_COORDS[i][0], ROUTE_COORDS[i][1], routeHeights[i] + 1.5);
          }
          this.flowCoreEntity.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights(flowFlat);
        }

        for (let i = 0; i < poiEntries.length; i++) {
          const [poiId, g] = poiEntries[i];
          const h = updated[aCount + rCount + i]?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000) {
            const pos = Cesium.Cartesian3.fromDegrees(g.lon, g.lat, h + 1.0);
            const ring = this.viewer.entities.getById('poi_ring_' + poiId);
            const dot = this.viewer.entities.getById('poi_dot_' + poiId);
            if (ring) {
              ring.position = pos;
            }
            if (dot) dot.position = pos;
          }
        }

        for (let i = 0; i < bimPoses.length; i++) {
          const h = updated[aCount + rCount + pCount + i]?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000) {
            const { spec, pose } = bimPoses[i];
            this._applySampledBimHeight(Cesium, spec.id, pose.lon, pose.lat, h);
          }
        }
      })
      .catch(() => {
        // ignore offline terrain sampling errors
      });
  }

  private _applySampledBimHeight(Cesium: any, objectId: string, lon: number, lat: number, h: number) {
    this.bimHeights.set(objectId, h);
    for (let s = 0; s < 4; s++) {
      const ent = this.viewer?.entities.getById(`bim_${objectId}_s${s + 1}`);
      if (ent) {
        ent.position = Cesium.Cartesian3.fromDegrees(lon, lat, h);
      }
    }
    const progressEnts = this.moduleEntities.get('progress') || [];
    progressEnts.forEach((ent) => {
      if (ent && ent._bimObjectId === objectId) {
        ent.position = Cesium.Cartesian3.fromDegrees(lon, lat, h + 24);
      }
    });
    if (this.activeBimObjectId === objectId && this.bimCameraNeedsTerrainReframe) {
      this.bimCameraNeedsTerrainReframe = false;
      this.flyToBimObject(objectId, 0.7);
    }
  }

  private _buildBim3DModels(Cesium: any) {
    BIM_STAGE_CONFIGS.forEach((spec) => {
      const { lon, lat, headingRad } = spec.resolvePose();
      const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        pos,
        new Cesium.HeadingPitchRoll(headingRad, 0, 0)
      );

      spec.stages.forEach((uri, stageIdx) => {
        const ent = this.viewer.entities.add({
          id: `bim_${spec.id}_s${stageIdx + 1}`,
          name: `${spec.name} · 工序${stageIdx + 1}`,
          position: pos,
          orientation,
          model: {
            uri,
            scale: 1.0,
            heightReference: Cesium.HeightReference.NONE,
            color: Cesium.Color.WHITE,
            colorBlendMode: Cesium.ColorBlendMode.MIX,
            colorBlendAmount: 0.0,
            minimumPixelSize: 16,
            maximumScale: 3.0,
          },
          show: false,
        });
        ent._bimObjectId = spec.id;
        ent._bimStageIdx = stageIdx;
        ent._lastStageState = 'neutral';
        this.bimEntities.push(ent);
      });
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
        ellipse: {
          semiMajorAxis: 1620,
          semiMinorAxis: 1620,
          material: pulseMat,
          outline: false,
        },
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
      this.poiRingEntities.push(pulseCircle);
      this.poiDotEntities.push(coreDot);
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
      this._updatePoiZoomVisibility();
    });

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const picked = this.viewer.scene.pick(movement.position);
      const pickedEnt = picked?.id || picked?.primitive?.id;
      if (Cesium.defined(picked) && pickedEnt) {
        if (pickedEnt._highwayAsset) {
          this.flyToHighwayAsset(pickedEnt._highwayAsset.id);
          this.callbacks.onAssetClick?.(pickedEnt._highwayAsset);
        } else if (pickedEnt._poiId) {
          this.callbacks.onPoiClick?.(pickedEnt._poiId);
        } else if (pickedEnt._secId) {
          this.callbacks.onSectionClick?.(pickedEnt._secId);
        }
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
    models?: boolean;
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
    const showModels = opts.models !== false;
    this.highwayRoadEntities.forEach((e) => { e.show = showModels; });
    this.highwayModelEntities.forEach((e) => {
      e.show = showModels && !this.bimOverlapHiddenIds.includes(e.id);
    });
    const showBim = designMode || !!opts.bim;
    this.bimEntities.forEach((e) => { e.show = showBim; });
    this.poisLayerVisible = opts.pois !== false;
    this._updatePoiZoomVisibility();
    this.facilityEntities.forEach((e) => { e.show = opts.pois !== false; });
  }

  private _updatePoiZoomVisibility() {
    if (!this.viewer) return;
    const camH = this.viewer.camera?.positionCartographic?.height ?? 62000;
    const showRings = this.poisLayerVisible && camH >= 8000;
    const showDots = this.poisLayerVisible && camH >= 2000;
    for (let i = 0; i < this.poiRingEntities.length; i++) {
      const ent = this.poiRingEntities[i];
      if (ent.show !== showRings) ent.show = showRings;
    }
    for (let i = 0; i < this.poiDotEntities.length; i++) {
      const ent = this.poiDotEntities[i];
      if (ent.show !== showDots) ent.show = showDots;
    }
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

  getBimObjectPose(objectId: string): { lon: number; lat: number; alt: number; headingRad: number } {
    const spec = BIM_STAGE_CONFIGS.find((s) => s.id === objectId) ?? BIM_STAGE_CONFIGS[0];
    const pose = spec.resolvePose();
    const h = this.bimHeights.get(spec.id) ?? 0;
    return { lon: pose.lon, lat: pose.lat, alt: h, headingRad: pose.headingRad };
  }

  updateBimSimulation(activeObjectId: string, stageStates: Array<'done' | 'doing' | 'todo'>) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    this.activeBimObjectId = activeObjectId;

    const spec = BIM_STAGE_CONFIGS.find((s) => s.id === activeObjectId);
    const nextHidden: string[] = [];
    if (spec?.overlapAssetId) {
      nextHidden.push(`hw_model_${spec.overlapAssetId}`, `hw_marker_${spec.overlapAssetId}`);
    }
    if (
      nextHidden.length !== this.bimOverlapHiddenIds.length ||
      nextHidden.some((id, idx) => this.bimOverlapHiddenIds[idx] !== id)
    ) {
      this.bimOverlapHiddenIds = nextHidden;
      this.highwayModelEntities.forEach((e) => {
        if (e.id?.startsWith('hw_model_') || e.id?.startsWith('hw_marker_')) {
          e.show = !this.bimOverlapHiddenIds.includes(e.id);
        }
      });
    }

    // Use opaque alpha=1.0 for done/doing so Cesium renders solid stages with full depth write (no X-ray bleed-through)
    const doneColor = Cesium.Color.fromCssColorString('#1e90ff');
    const doingColor = Cesium.Color.fromCssColorString('#f59e0b');
    const todoColor = Cesium.Color.fromCssColorString('#94a3b8').withAlpha(0.30);

    this.bimEntities.forEach((ent) => {
      if (!ent?.model) return;
      if (ent._bimObjectId !== activeObjectId) {
        if (ent._lastStageState !== 'neutral') {
          ent._lastStageState = 'neutral';
          ent.model.color = Cesium.Color.WHITE;
          ent.model.colorBlendAmount = 0.0;
        }
        return;
      }

      const stageIdx = typeof ent._bimStageIdx === 'number' ? ent._bimStageIdx : 0;
      const st = stageStates[stageIdx] ?? 'todo';
      if (ent._lastStageState === st) return;
      ent._lastStageState = st;
      ent.model.colorBlendMode = Cesium.ColorBlendMode.MIX;
      if (st === 'done') {
        ent.model.color = doneColor;
        ent.model.colorBlendAmount = 0.58;
      } else if (st === 'doing') {
        ent.model.color = doingColor;
        ent.model.colorBlendAmount = 0.78;
      } else {
        ent.model.color = todoColor;
        ent.model.colorBlendAmount = 0.85;
      }
    });
  }

  resetBimSimulation() {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    this.activeBimObjectId = null;
    this.bimCameraNeedsTerrainReframe = false;
    this.bimOverlapHiddenIds = [];
    this.bimEntities.forEach((ent) => {
      if (ent?.model && ent._lastStageState !== 'neutral') {
        ent._lastStageState = 'neutral';
        ent.model.color = Cesium.Color.WHITE;
        ent.model.colorBlendAmount = 0.0;
      }
    });
    this.highwayModelEntities.forEach((e) => {
      e.show = true;
    });
  }

  flyToBimObject(objectId: string, duration = 1.25) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    const spec = BIM_STAGE_CONFIGS.find((s) => s.id === objectId) ?? BIM_STAGE_CONFIGS[0];
    this.orbitActive = false;
    const { lon, lat, headingRad } = spec.resolvePose();

    const doFly = (alt: number) => {
      if (!this.viewer) return;
      const target = Cesium.Cartesian3.fromDegrees(lon, lat, alt + 8);
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, spec.focusRadius), {
        offset: new Cesium.HeadingPitchRange(headingRad + Math.PI / 4, Cesium.Math.toRadians(-30), spec.focusRange),
        duration,
      });
    };

    const sampled = this.bimHeights.get(spec.id);
    if (typeof sampled === 'number' && Number.isFinite(sampled)) {
      this.bimCameraNeedsTerrainReframe = false;
      doFly(sampled);
      return;
    }

    const tp = this.viewer.terrainProvider;

    if (!tp || tp instanceof Cesium.EllipsoidTerrainProvider) {
      this.bimCameraNeedsTerrainReframe = false;
      doFly(0);
      return;
    }

    if (!tp.availability) {
      this.bimCameraNeedsTerrainReframe = true;
      doFly(0);
      return;
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      this.bimCameraNeedsTerrainReframe = true;
      doFly(0);
    }, 1000);

    Promise.resolve(Cesium.sampleTerrainMostDetailed(tp, [Cesium.Cartographic.fromDegrees(lon, lat)]))
      .then((res: any[]) => {
        const h = res?.[0]?.height;
        const valid = typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000;
        if (!settled) {
          settled = true;
          window.clearTimeout(fallbackTimer);
          if (valid) {
            this.bimCameraNeedsTerrainReframe = false;
            this._applySampledBimHeight(Cesium, spec.id, lon, lat, h);
            doFly(h);
          } else {
            this.bimCameraNeedsTerrainReframe = true;
            doFly(0);
          }
        } else if (valid) {
          this._applySampledBimHeight(Cesium, spec.id, lon, lat, h);
        }
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        this.bimCameraNeedsTerrainReframe = true;
        doFly(0);
      });
  }

  flyToHighwayAsset(assetId: string) {
    const Cesium = window.Cesium;
    if (!this.ready || !Cesium) return;
    const asset = ALL_HIGHWAY_ASSETS.find((a) => a.id === assetId);
    if (!asset) return;
    this.orbitActive = false;
    const { lon, lat, headingRad } = sampleRoutePose(asset.ratio);

    const doFly = (alt: number) => {
      if (!this.viewer) return;
      const target = Cesium.Cartesian3.fromDegrees(lon, lat, alt + 10);
      const radius =
        asset.category === 'interchange'
          ? 220
          : asset.category === 'bridge_large'
            ? 160
            : asset.category === 'bridge_medium'
              ? 80
              : 45;
      const range =
        asset.category === 'interchange'
          ? 720
          : asset.category === 'bridge_large'
            ? 520
            : asset.category === 'bridge_medium'
              ? 360
              : asset.category === 'bridge_small'
                ? 240
                : 480;
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, radius), {
        offset: new Cesium.HeadingPitchRange(headingRad + Math.PI / 4, Cesium.Math.toRadians(-32), range),
        duration: 1.3,
      });
    };

    const sampled = this.assetHeights.get(asset.id);
    if (typeof sampled === 'number' && Number.isFinite(sampled)) {
      doFly(sampled);
      return;
    }

    const rawH = this.viewer.scene.globe?.getHeight(Cesium.Cartographic.fromDegrees(lon, lat));
    const saneRawH = typeof rawH === 'number' && Number.isFinite(rawH) && rawH >= -100 && rawH <= 5000 ? rawH : undefined;
    const tp = this.viewer.terrainProvider;

    if (!tp || tp instanceof Cesium.EllipsoidTerrainProvider || !tp.availability) {
      doFly(saneRawH ?? 0);
      return;
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      doFly(saneRawH ?? 0);
    }, 1000);

    Promise.resolve(Cesium.sampleTerrainMostDetailed(tp, [Cesium.Cartographic.fromDegrees(lon, lat)]))
      .then((res: any[]) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        const h = res?.[0]?.height;
        if (typeof h === 'number' && Number.isFinite(h) && h >= -100 && h <= 5000) {
          this._applySampledAssetPose(Cesium, asset, lon, lat, h);
          doFly(h);
        } else {
          doFly(saneRawH ?? 0);
        }
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        doFly(saneRawH ?? 0);
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
    this.orbitActive = false;
    if (active && this.ready && this.viewer) {
      this.viewer.camera.cancelFlight?.();
      this.flyToOverview(1.0);
    }
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
