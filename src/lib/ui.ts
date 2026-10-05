import type { Classification, RiskLevel } from "./types";

export const LEVEL_COLOR: Record<RiskLevel, string> = {
  normal: "var(--risk-normal)",
  watch: "var(--risk-watch)",
  warning: "var(--risk-warning)",
  critical: "var(--risk-critical)",
};

/** Hex values for canvas/SVG contexts that can't resolve CSS variables. */
export const LEVEL_HEX: Record<RiskLevel, string> = {
  normal: "#74c27a",
  watch: "#e8c547",
  warning: "#ff8a2b",
  critical: "#ff3d3d",
};
export const OFFLINE_HEX = "#6b7280";
export const BIOGENIC_HEX = "#4fb6a8";

export const CLASS_LABEL: Record<Classification, string> = {
  nominal: "Nominal",
  biogenic: "Biogenic (suppressed)",
  plume: "Downwind plume",
  "thermal-anomaly": "Thermal anomaly",
  smoldering: "Smoldering combustion",
  offline: "Offline",
};

export function nodeHex(level: RiskLevel, classification: Classification): string {
  if (classification === "offline") return OFFLINE_HEX;
  if ((classification === "biogenic" || classification === "plume") && level === "normal") return BIOGENIC_HEX;
  return LEVEL_HEX[level];
}

export function timeAgo(iso: string, now = Date.now()): string {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} h ${m % 60} min ago` : `${Math.floor(h / 24)} d ago`;
}
