export type RiskLevel = "normal" | "watch" | "warning" | "critical";

export type Classification =
  | "nominal"
  | "biogenic"
  | "plume"
  | "thermal-anomaly"
  | "smoldering"
  | "offline";

export interface SensorNode {
  id: string;
  zone: string;
  lat: number;
  lng: number;
  elevationM: number;
  /** Distance along the transmission corridor, km. */
  corridorKm: number;
  deployedAt: string;
  firmware: string;
}

/** One 15-minute sample, as uplinked over the satellite network. */
export interface Reading {
  t: string;
  airTempC: number;
  soil5C: number;
  soil15C: number;
  soil30C: number;
  coPpm: number;
  vocPpb: number;
  soilMoisturePct: number;
  harvestUw: number;
  supercapV: number;
}

export interface RiskFactor {
  key: string;
  label: string;
  value: string;
  /** Contribution to the 0–100 score (can be negative). */
  points: number;
}

export interface Assessment {
  score: number;
  level: RiskLevel;
  classification: Classification;
  confidence: number;
  factors: RiskFactor[];
  /** Heuristic projected window until surface flaming, hours. */
  breakthroughHours: [number, number] | null;
  summary: string;
}

export interface NodeStatus {
  node: SensorNode;
  latest: Reading;
  lastSeen: string;
  online: boolean;
  assessment: Assessment;
}

export interface Alert {
  id: string;
  nodeId: string;
  zone: string;
  kind: "fire" | "maintenance";
  level: RiskLevel;
  title: string;
  detail: string;
  raisedAt: string;
}
