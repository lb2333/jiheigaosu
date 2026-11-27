export interface MixingMaterialItem {
  name: string;
  target: number;
  actual: number;
  unit: string;
}

export interface QualitySectionMetric {
  sectionId: string;
  name: string;
  shortName: string;
  labName: string;
  stationShort: string;
  stationFull: string;
  yardName: string;
  stakeRange: string;
  labBatches: number;
  labPassRate: number;
  mixVol: number;
  mixBatches: number;
  beams: number;
  pavKm: number;
  pavSegments: number;
  issuesCount: number;
  qualityRate: number;
  sortOrder: number;
}

export interface QualityInspectionRecord {
  id: string;
  sectionId: string;
  section: string;
  category: string;
  target: string;
  content: string;
  result: string;
  description: string;
  rectify: string;
  inspectedAt: string;
  measured: string;
  standard: string;
  inspector: string;
  note: string;
  sortOrder: number;
}

export interface QualityLabRecord {
  id: string;
  sectionId: string;
  lab: string;
  category: string;
  sample: string;
  item: string;
  testedAt: string;
  result: string;
  reportState: string;
  retestState: string;
  measured: string;
  limitSpec: string;
  machine: string;
  hash: string;
  sortOrder: number;
}

export interface QualityMixingRecord {
  id: string;
  sectionId: string;
  section: string;
  station: string;
  prodType: string;
  mixCode: string;
  volume: number;
  producedAt: string;
  judge: string;
  alertTitle: string;
  handled: boolean;
  handleNote: string;
  temp: string;
  deviation: string;
  materials: MixingMaterialItem[];
  sortOrder: number;
}

export interface QualityPavementRecord {
  id: string;
  sectionId: string;
  section: string;
  dir: string;
  stake: string;
  layer: string;
  temp: number;
  passes: number;
  compaction: number;
  thickness: number;
  designThick: number;
  judge: string;
  alertTitle: string;
  verified: boolean;
  recordedAt: string;
  sortOrder: number;
}

export interface QualityBeamRecord {
  id: string;
  sectionId: string;
  yard: string;
  beamType: string;
  castDate: string;
  curing: string;
  tension: string;
  grout: string;
  inspect: string;
  pedestal: string;
  alertTitle: string;
  alertState: string;
  alertTime: string;
  statusState: string;
  temp: string;
  humidity: string;
  elongation: string;
  groutPressure: string;
  sortOrder: number;
}

export interface QualityIssueRecord {
  id: string;
  sectionId: string;
  section: string;
  issueType: string;
  title: string;
  description: string;
  unit: string;
  foundAt: string;
  deadline: string;
  status: string;
  daysUsed: number | null;
  measure: string;
  sortOrder: number;
}

export type QualitySubPageId =
  | 'overview'
  | 'lab'
  | 'mixing'
  | 'pavement'
  | 'beamYard'
  | 'issues';
