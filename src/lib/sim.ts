/**
 * Digital-twin simulator for a PyroShield deployment along a 230 kV transmission
 * corridor between Merritt and Kamloops, BC.
 *
 * Every value is a pure function of (node, timestamp), so any server instance
 * returns identical data for the same moment and the network "moves" in real
 * time without persistent state. Real field packets enter via /api/ingest.
 */
import type { Reading, SensorNode } from "./types";

export const STEP_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const UTC_OFFSET_H = -7; // Pacific Daylight Time

/** Approximate centerline of the corridor (lat, lng). */
export const CORRIDOR: [number, number][] = [
  [50.111, -120.786],
  [50.135, -120.62],
  [50.163, -120.515],
  [50.27, -120.42],
  [50.37, -120.35],
  [50.52, -120.35],
  [50.62, -120.34],
  [50.665, -120.333],
];

const ZONES = [
  { code: "NV", name: "Nicola Valley", untilKm: 25 },
  { code: "SL", name: "Stump Lake", untilKm: 50 },
  { code: "KR", name: "Knutsford Ridge", untilKm: Infinity },
];

const NODE_SPACING_KM = 0.2;
/** Three rows across a 300 m buffer: one node per ~2 ha. */
const ROW_OFFSETS_M = [-100, 0, 100];

// ---------- deterministic noise ----------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Uniform [0,1) from two integers. */
function rand(a: number, b: number): number {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  x ^= x >>> 15;
  x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12;
  x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

/** Approximately normal noise, mean 0, sd ~1. */
function gauss(a: number, b: number): number {
  return (rand(a, b) + rand(a, b + 7919) + rand(a, b + 15485) - 1.5) * 2;
}

// ---------- geometry ----------

export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildNodes(): SensorNode[] {
  const nodes: SensorNode[] = [];
  const counters: Record<string, number> = {};
  let kmStart = 0;
  let nextKm = 0.1;

  for (let s = 0; s < CORRIDOR.length - 1; s++) {
    const [aLat, aLng] = CORRIDOR[s];
    const [bLat, bLng] = CORRIDOR[s + 1];
    const segKm = distanceM(aLat, aLng, bLat, bLng) / 1000;
    // Local metric frame for perpendicular offsets.
    const mPerDegLat = 111320;
    const mPerDegLng = 111320 * Math.cos((aLat * Math.PI) / 180);
    const dx = (bLng - aLng) * mPerDegLng;
    const dy = (bLat - aLat) * mPerDegLat;
    const len = Math.hypot(dx, dy);
    const px = -dy / len;
    const py = dx / len;

    while (nextKm <= kmStart + segKm) {
      const f = (nextKm - kmStart) / segKm;
      const lat = aLat + (bLat - aLat) * f;
      const lng = aLng + (bLng - aLng) * f;
      const zone = ZONES.find((z) => nextKm < z.untilKm)!;
      const step = Math.round(nextKm / NODE_SPACING_KM);

      for (const [row, rowOffset] of ROW_OFFSETS_M.entries()) {
        counters[zone.code] = (counters[zone.code] ?? 0) + 1;
        const id = `PS-${zone.code}-${String(counters[zone.code]).padStart(3, "0")}`;
        const seed = hash(id);
        const jitter = (rand(seed, 1) - 0.5) * 40;
        const off = rowOffset + jitter * 0.5;
        // Stagger rows by a third of a spacing so coverage overlaps.
        const along = (row / ROW_OFFSETS_M.length) * NODE_SPACING_KM * 1000;
        const ox = px * off + (dx / len) * along;
        const oy = py * off + (dy / len) * along;
        const km = nextKm + along / 1000;
        nodes.push({
          id,
          zone: zone.name,
          lat: lat + oy / mPerDegLat,
          lng: lng + ox / mPerDegLng,
          elevationM: Math.round(700 + 380 * Math.sin(km / 9) + 120 * Math.sin(km / 2.3) + jitter),
          corridorKm: Math.round(km * 100) / 100,
          deployedAt: new Date(Date.UTC(2026, 5, 2 + (step % 14))).toISOString(),
          firmware: rand(seed, 2) > 0.15 ? "1.4.2" : "1.3.9",
        });
      }
      nextKm += NODE_SPACING_KM;
    }
    kmStart += segKm;
  }
  return nodes;
}

let nodeCache: SensorNode[] | null = null;
export function getNodes(): SensorNode[] {
  if (!nodeCache) nodeCache = buildNodes();
  return nodeCache;
}

export function getNode(id: string): SensorNode | undefined {
  return getNodes().find((n) => n.id === id);
}

// ---------- scenarios ----------

interface Scenario {
  nodeId: string;
  kind: "smolder" | "early-thermal" | "decomposition" | "offline" | "low-energy";
  /** For offline nodes: hours since last packet. */
  silentHours?: number;
}

const SCENARIOS: Scenario[] = [
  { nodeId: "PS-SL-028", kind: "smolder" },
  { nodeId: "PS-KR-041", kind: "early-thermal" },
  { nodeId: "PS-NV-024", kind: "decomposition" },
  { nodeId: "PS-NV-077", kind: "offline", silentHours: 9 },
  { nodeId: "PS-KR-090", kind: "offline", silentHours: 31 },
  { nodeId: "PS-SL-063", kind: "low-energy" },
];

export function scenarioFor(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.nodeId === id);
}

/**
 * Event onsets drift on a repeating cycle so the demo always shows an event in
 * progress, while every reading remains a pure function of its timestamp.
 */
function smolderStartMs(nowMs: number): number {
  const cycle = 6 * HOUR_MS;
  return Math.floor(nowMs / cycle) * cycle - 3 * HOUR_MS;
}
function decompositionStartMs(nowMs: number): number {
  const cycle = 12 * HOUR_MS;
  return Math.floor(nowMs / cycle) * cycle - 6 * HOUR_MS;
}
function earlyThermalStartMs(nowMs: number): number {
  const cycle = 3 * HOUR_MS;
  return Math.floor(nowMs / cycle) * cycle - 1.25 * HOUR_MS;
}

const rise = (e: number, tau: number) => (e <= 0 ? 0 : 1 - Math.exp(-e / tau));

// ---------- telemetry ----------

function baseReading(node: SensorNode, step: number): Reading {
  const seed = hash(node.id);
  const tMs = step * STEP_MS;
  const localH = (((tMs / HOUR_MS + UTC_OFFSET_H) % 24) + 24) % 24;
  const day = (h: number) => Math.sin((2 * Math.PI * (localH - h)) / 24);
  const lapse = -(node.elevationM - 700) * 0.0065;
  const microsite = (rand(seed, 3) - 0.5) * 2;

  const airTempC = 17 + lapse + microsite + 9 * day(9) + 0.6 * gauss(seed, step);
  const soil5C = 13.5 + lapse * 0.6 + microsite * 0.5 + 3.5 * day(12) + 0.2 * gauss(seed, step + 1e6);
  const soil15C = 12 + lapse * 0.5 + 1.4 * day(15) + 0.1 * gauss(seed, step + 2e6);
  const soil30C = 10.6 + lapse * 0.4 + 0.35 * day(19) + 0.05 * gauss(seed, step + 3e6);
  const coPpm = Math.max(0.05, 0.35 + 0.08 * gauss(seed, step + 4e6));
  const vocPpb = Math.max(5, 42 + 9 * rand(seed, 4) + 4 * gauss(seed, step + 5e6));
  const soilMoisturePct = 17 + 4 * rand(seed, 5) - 0.6 * day(14);

  return {
    t: new Date(tMs).toISOString(),
    airTempC,
    soil5C,
    soil15C,
    soil30C,
    coPpm,
    vocPpb,
    soilMoisturePct,
    harvestUw: 0,
    supercapV: 0,
  };
}

const smolderNeighbors = new Map<string, number>();
function plumeFactor(node: SensorNode): number {
  if (!smolderNeighbors.has(node.id)) {
    const src = getNode("PS-SL-028")!;
    const d = distanceM(node.lat, node.lng, src.lat, src.lng);
    smolderNeighbors.set(node.id, node.id !== src.id && d < 700 ? Math.exp(-d / 260) : 0);
  }
  return smolderNeighbors.get(node.id)!;
}

function readingAt(node: SensorNode, step: number, nowMs: number): Reading {
  const r = baseReading(node, step);
  const tMs = step * STEP_MS;
  const sc = scenarioFor(node.id);
  const seed = hash(node.id);

  if (sc?.kind === "smolder") {
    const e = (tMs - smolderStartMs(nowMs)) / HOUR_MS;
    r.soil30C += 46 * rise(e, 4);
    r.soil15C += 27 * rise(e - 0.5, 4.5);
    r.soil5C += 9 * rise(e - 1.2, 5);
    r.coPpm += 62 * rise(e, 3.5) * (1 + 0.04 * gauss(seed, step + 6e6));
    r.vocPpb += 1050 * rise(e, 4) * (1 + 0.05 * gauss(seed, step + 7e6));
    r.soilMoisturePct -= 6 * rise(e, 5);
  } else if (sc?.kind === "early-thermal") {
    const e = (tMs - earlyThermalStartMs(nowMs)) / HOUR_MS;
    r.soil30C += 20 * rise(e, 3);
    r.soil15C += 6 * rise(e - 0.5, 3.5);
    r.coPpm += 14 * rise(e, 2.5);
    r.vocPpb += 170 * rise(e, 3);
    r.soilMoisturePct -= 2 * rise(e, 4);
  } else if (sc?.kind === "decomposition") {
    // Post-rain litter decomposition: biogenic CO/VOCs, mild metabolic warming, no thermal runaway.
    const e = (tMs - decompositionStartMs(nowMs)) / HOUR_MS;
    const k = rise(e, 3) * (0.85 + 0.15 * Math.sin(tMs / (5 * HOUR_MS)));
    r.coPpm += 4.6 * k;
    r.vocPpb += 360 * k;
    r.soil5C += 1.4 * k;
    r.soil15C += 1.6 * k;
    r.soil30C += 1.1 * k;
    r.soilMoisturePct += 17 * rise(e + 1, 1.5);
  }

  const plume = plumeFactor(node);
  if (plume > 0) {
    const e = (tMs - smolderStartMs(nowMs)) / HOUR_MS;
    r.coPpm += 9 * plume * rise(e - 0.75, 4);
    r.vocPpb += 140 * plume * rise(e - 0.75, 4);
  }

  // Thermoelectric harvest scales with the square of the air–soil ΔT.
  const gain = sc?.kind === "low-energy" ? 0.12 : 0.8 + 0.4 * rand(seed, 6);
  const dT = Math.abs(r.airTempC - r.soil15C);
  r.harvestUw = Math.max(0, 9 * gain * dT * dT + 3 * gauss(seed, step + 8e6));
  const reserve = sc?.kind === "low-energy" ? 0.15 : 0.55 + 0.25 * rand(seed, 7);
  r.supercapV = 2.3 + 0.55 * reserve + 0.15 * Math.tanh(r.harvestUw / 220);

  return round(r);
}

function round(r: Reading): Reading {
  const f = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
  return {
    t: r.t,
    airTempC: f(r.airTempC),
    soil5C: f(r.soil5C),
    soil15C: f(r.soil15C),
    soil30C: f(r.soil30C),
    coPpm: f(r.coPpm),
    vocPpb: f(r.vocPpb, 0),
    soilMoisturePct: f(r.soilMoisturePct, 1),
    harvestUw: f(r.harvestUw, 0),
    supercapV: f(r.supercapV, 3),
  };
}

export function currentStep(nowMs = Date.now()): number {
  return Math.floor(nowMs / STEP_MS);
}

/** Last time a node's packet reached the ground station. */
export function lastSeenMs(node: SensorNode, nowMs = Date.now()): number {
  const sc = scenarioFor(node.id);
  const now = currentStep(nowMs) * STEP_MS;
  return sc?.kind === "offline" ? now - (sc.silentHours ?? 0) * HOUR_MS : now;
}

/** Telemetry for the trailing window, oldest first. */
export function getSeries(node: SensorNode, hours = 48, nowMs = Date.now()): Reading[] {
  const end = Math.floor(lastSeenMs(node, nowMs) / STEP_MS);
  const nowStep = currentStep(nowMs);
  const start = nowStep - (hours * HOUR_MS) / STEP_MS + 1;
  const out: Reading[] = [];
  for (let s = start; s <= end; s++) out.push(readingAt(node, s, nowMs));
  return out;
}
