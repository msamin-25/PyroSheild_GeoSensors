import type { Alert, Classification, RiskLevel } from "@/lib/types";

export interface NodeRow {
  id: string;
  zone: string;
  lat: number;
  lng: number;
  corridorKm: number;
  online: boolean;
  lastSeen: string;
  score: number;
  level: RiskLevel;
  classification: Classification;
  soil30C: number;
  coPpm: number;
  supercapV: number;
}

export interface NetworkResponse {
  generatedAt: string;
  corridor: [number, number][];
  nodes: NodeRow[];
  alertCount: number;
}

export interface AlertsResponse {
  generatedAt: string;
  alerts: Alert[];
}

export type BaseLayer = "dark" | "terrain" | "satellite";
export type NodeFilter = "all" | "risk" | "offline";

export function matchesFilter(n: NodeRow, f: NodeFilter) {
  if (f === "risk") return n.level !== "normal" || n.classification === "plume" || n.classification === "biogenic";
  if (f === "offline") return !n.online;
  return true;
}
