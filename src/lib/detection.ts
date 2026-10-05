/**
 * Early-combustion signature model (v0.3, rule-based).
 *
 * Scores a node's recent telemetry against its own 42-hour baseline. The model is
 * deliberately explainable: every point in the 0–100 score is attributed to a
 * named factor so dispatchers can see *why* an alert fired. Learned weights from
 * field burn trials will replace the hand-tuned constants below.
 */
import type { Assessment, Classification, Reading, RiskFactor, RiskLevel } from "./types";

const SAMPLES_PER_HOUR = 4;
const RECENT_WINDOW_H = 6;

export const THRESHOLDS = { watch: 30, warning: 55, critical: 80 } as const;

export interface DetectionContext {
  online: boolean;
  /** Neighbors within 400 m that also show CO above baseline. */
  corroboratingNeighbors: number;
  /** True when a neighbor within 400 m shows a root-zone heat anomaly. */
  thermalNeighbor: boolean;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function baselineOf(series: Reading[]): Reading[] {
  const cut = series.length - RECENT_WINDOW_H * SAMPLES_PER_HOUR;
  return cut > SAMPLES_PER_HOUR * 6 ? series.slice(0, cut) : series.slice(0, Math.ceil(series.length / 2));
}

/** 30 cm soil temperature above the node's own baseline, °C. */
export function deepAnomaly(series: Reading[]): number {
  if (series.length === 0) return 0;
  const base = median(baselineOf(series).map((r) => r.soil30C));
  return series[series.length - 1].soil30C - base;
}

/** CO above the node's own baseline, ppm. Used for neighbor corroboration. */
export function coExcess(series: Reading[]): number {
  if (series.length === 0) return 0;
  const base = median(baselineOf(series).map((r) => r.coPpm));
  return series[series.length - 1].coPpm - base;
}

export function levelFor(score: number): RiskLevel {
  if (score >= THRESHOLDS.critical) return "critical";
  if (score >= THRESHOLDS.warning) return "warning";
  if (score >= THRESHOLDS.watch) return "watch";
  return "normal";
}

export function assess(series: Reading[], ctx: DetectionContext): Assessment {
  if (!ctx.online || series.length < SAMPLES_PER_HOUR * 4) {
    return {
      score: 0,
      level: "normal",
      classification: "offline",
      confidence: 0,
      factors: [],
      breakthroughHours: null,
      summary: "No recent uplink — fire risk at this location cannot be assessed.",
    };
  }

  const latest = series[series.length - 1];
  const twoHAgo = series[Math.max(0, series.length - 1 - 2 * SAMPLES_PER_HOUR)];
  const base = baselineOf(series);

  const deepAnom = latest.soil30C - median(base.map((r) => r.soil30C));
  const inversion = latest.soil30C - latest.soil5C;
  const coEx = latest.coPpm - median(base.map((r) => r.coPpm));
  const coRate = (latest.coPpm - twoHAgo.coPpm) / 2;
  const deepRate = (latest.soil30C - twoHAgo.soil30C) / 2;
  const ratio = (latest.coPpm / Math.max(latest.vocPpb, 1)) * 1000;
  const moisture = latest.soilMoisturePct;

  const factors: RiskFactor[] = [];
  const add = (key: string, label: string, value: string, points: number) => {
    const p = Math.round(points * 10) / 10;
    if (p !== 0) factors.push({ key, label, value, points: p });
  };

  add("deep-thermal", "Root-zone heat anomaly (30 cm)", `${fmtSigned(deepAnom)} °C vs baseline`, clamp01(deepAnom / 12) * 32);
  add("inversion", "Thermal gradient inversion", `${fmtSigned(inversion)} °C (30 cm − 5 cm)`, clamp01((inversion - 2) / 10) * 14);
  add("co-level", "CO above baseline", `${fmtSigned(coEx)} ppm`, clamp01(coEx / 25) * 18);
  add("co-rate", "CO rate of rise", `${fmtSigned(coRate)} ppm/h`, clamp01(coRate / 4) * 12);
  if (coEx > 2) {
    add("ratio", "Combustion CO:VOC signature", `${ratio.toFixed(0)} ppm/ppm·10³`, clamp01((ratio - 15) / 30) * 10);
  }
  add("neighbors", "Corroborating neighbor nodes", `${ctx.corroboratingNeighbors} within 400 m`, Math.min(ctx.corroboratingNeighbors, 4) * 3);
  if (moisture > 28) {
    add("moisture", "Saturated soil (suppresses smoldering)", `${moisture.toFixed(0)} % VWC`, -Math.min((moisture - 28) * 1.2, 15));
  } else if (moisture < 12) {
    add("moisture", "Desiccated duff layer", `${moisture.toFixed(0)} % VWC`, Math.min((12 - moisture) * 1, 6));
  }

  const thermal = deepAnom >= 3 || inversion >= 3;
  const gasElevated = coEx > 2;
  const plume = gasElevated && !thermal && ctx.thermalNeighbor;
  const biogenic = gasElevated && !thermal && !plume;

  let score = factors.reduce((s, f) => s + f.points, 0);
  if (biogenic && score > 22) {
    add("biogenic-gate", "Biogenic signature gate (no heat source)", "alert suppressed", 22 - score);
    score = 22;
  }
  score = Math.round(Math.max(0, Math.min(100, score)));

  const level = levelFor(score);
  let classification: Classification = "nominal";
  if (score >= THRESHOLDS.critical && deepAnom >= 8) classification = "smoldering";
  else if (score >= THRESHOLDS.watch && thermal) classification = "thermal-anomaly";
  else if (plume) classification = "plume";
  else if (biogenic) classification = "biogenic";

  const channels = [deepAnom >= 3, inversion >= 3, coEx > 2, ratio > 30 && gasElevated, ctx.corroboratingNeighbors > 0].filter(Boolean).length;
  const confidence =
    classification === "nominal"
      ? 0.98
      : classification === "biogenic" || classification === "plume"
        ? 0.9
        : Math.min(0.97, 0.45 + channels * 0.11);

  let breakthroughHours: [number, number] | null = null;
  if (classification === "smoldering" || (classification === "thermal-anomaly" && level !== "watch")) {
    const hrs = Math.max(2, Math.min(18, 22 / (Math.max(deepRate, 0) + coRate * 0.4 + 1.5)));
    breakthroughHours = [Math.round(hrs * 0.7 * 10) / 10, Math.round(hrs * 1.3 * 10) / 10];
  }

  factors.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

  return {
    score,
    level,
    classification,
    confidence: Math.round(confidence * 100) / 100,
    factors,
    breakthroughHours,
    summary: summarize(classification, level),
  };
}

function summarize(c: Classification, level: RiskLevel): string {
  switch (c) {
    case "smoldering":
      return "Subterranean smoldering combustion confirmed by thermal and gas channels. Dispatch ground crew.";
    case "thermal-anomaly":
      return level === "watch"
        ? "Early root-zone heating with combustion gases. Monitoring at elevated uplink cadence."
        : "Developing thermal anomaly with combustion gas signature. Recommend aerial or ground verification.";
    case "plume":
      return "Combustion gases without local heating — drift from an adjacent heat source. Corroborates neighbor alert.";
    case "biogenic":
      return "Elevated CO/VOCs consistent with wet organic decomposition. No heat source — alert suppressed.";
    default:
      return "All channels within baseline envelope.";
  }
}

function fmtSigned(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;
}
