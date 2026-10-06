import type { Classification, RiskLevel } from "./types";

export const LEVEL_COLOR: Record<RiskLevel, string> = {
  normal: "var(--risk-normal)",
  watch: "var(--risk-watch)",
  warning: "var(--risk-warning)",
  critical: "var(--risk-critical)",
};

/** Hex values for canvas/SVG contexts that can't resolve CSS variables. Keep in sync with globals.css. */
export const LEVEL_HEX: Record<RiskLevel, string> = {
  normal: "#6fcf7f",
  watch: "#e9c46a",
  warning: "#ff8c42",
  critical: "#ff4d4d",
};
export const OFFLINE_HEX = "#6b7c72";
export const BIOGENIC_HEX = "#4fbfae";

export const CLASS_LABEL: Record<Classification, string> = {
  nominal: "Nominal",
  biogenic: "Biogenic · suppressed",
  plume: "Downwind plume",
  "thermal-anomaly": "Thermal anomaly",
  smoldering: "Smoldering combustion",
  offline: "Offline",
};

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  normal: "Normal",
  watch: "Watch",
  warning: "Warning",
  critical: "Critical",
};

export type Tone = "neutral" | "brand" | "ok" | "watch" | "warning" | "critical" | "info" | "offline" | "biogenic";

export function levelTone(level: RiskLevel): Tone {
  return level === "normal" ? "ok" : level;
}

export function classTone(level: RiskLevel, c: Classification): Tone {
  if (c === "offline") return "offline";
  if ((c === "biogenic" || c === "plume") && level === "normal") return "biogenic";
  return levelTone(level);
}

export function nodeHex(level: RiskLevel, classification: Classification): string {
  if (classification === "offline") return OFFLINE_HEX;
  if ((classification === "biogenic" || classification === "plume") && level === "normal") return BIOGENIC_HEX;
  return LEVEL_HEX[level];
}

export function timeAgo(iso: string, now = Date.now()): string {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m ago` : `${Math.floor(h / 24)}d ago`;
}
