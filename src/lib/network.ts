import { assess, coExcess, deepAnomaly } from "./detection";
import { currentStep, distanceM, getNode, getNodes, getSeries, lastSeenMs, STEP_MS } from "./sim";
import type { Alert, NodeStatus, Reading, SensorNode } from "./types";

const OFFLINE_AFTER_MS = 2 * 60 * 60 * 1000;
const NEIGHBOR_RADIUS_M = 400;
const LOW_SUPERCAP_V = 2.5;

interface Snapshot {
  step: number;
  statuses: NodeStatus[];
  alerts: Alert[];
}

let cache: Snapshot | null = null;

let neighborIndex: Map<string, string[]> | null = null;
function neighborsOf(id: string): string[] {
  if (!neighborIndex) {
    neighborIndex = new Map();
    const nodes = getNodes();
    for (const a of nodes) {
      neighborIndex.set(
        a.id,
        nodes.filter((b) => b.id !== a.id && distanceM(a.lat, a.lng, b.lat, b.lng) <= NEIGHBOR_RADIUS_M).map((b) => b.id),
      );
    }
  }
  return neighborIndex.get(id) ?? [];
}

function isOnline(node: SensorNode, nowMs: number): boolean {
  return nowMs - lastSeenMs(node, nowMs) < OFFLINE_AFTER_MS;
}

function buildSnapshot(nowMs: number): Snapshot {
  const nodes = getNodes();
  const series = new Map<string, Reading[]>(nodes.map((n) => [n.id, getSeries(n, 48, nowMs)]));
  const online = new Map(nodes.map((n) => [n.id, isOnline(n, nowMs)]));
  const excess = new Map(nodes.map((n) => [n.id, online.get(n.id) ? coExcess(series.get(n.id)!) : 0]));
  const heating = new Map(nodes.map((n) => [n.id, online.get(n.id) ? deepAnomaly(series.get(n.id)!) : 0]));

  const statuses: NodeStatus[] = nodes.map((node) => {
    const s = series.get(node.id)!;
    const near = neighborsOf(node.id);
    const corroboratingNeighbors = near.filter((id) => (excess.get(id) ?? 0) > 2).length;
    const thermalNeighbor = near.some((id) => (heating.get(id) ?? 0) >= 5);
    return {
      node,
      latest: s[s.length - 1],
      lastSeen: new Date(lastSeenMs(node, nowMs)).toISOString(),
      online: online.get(node.id)!,
      assessment: assess(s, { online: online.get(node.id)!, corroboratingNeighbors, thermalNeighbor }),
    };
  });

  return { step: currentStep(nowMs), statuses, alerts: deriveAlerts(statuses, series) };
}

function deriveAlerts(statuses: NodeStatus[], series: Map<string, Reading[]>): Alert[] {
  const alerts: Alert[] = [];
  for (const st of statuses) {
    const { node, assessment: a } = st;
    if (a.level !== "normal") {
      // Alert time = first sample in the window where the latest level was reached.
      alerts.push({
        id: `fire-${node.id}`,
        nodeId: node.id,
        zone: node.zone,
        kind: "fire",
        level: a.level,
        title:
          a.classification === "smoldering"
            ? "Subterranean smoldering detected"
            : a.classification === "thermal-anomaly"
              ? "Root-zone thermal anomaly"
              : "Elevated combustion indicators",
        detail: a.summary,
        raisedAt: onsetOf(series.get(node.id)!) ?? st.latest.t,
      });
    }
    if (!st.online) {
      alerts.push({
        id: `offline-${node.id}`,
        nodeId: node.id,
        zone: node.zone,
        kind: "maintenance",
        level: "watch",
        title: "Node missed satellite uplinks",
        detail: `No packet since ${new Date(st.lastSeen).toUTCString()}. Possible damage, burial, or antenna occlusion.`,
        raisedAt: new Date(new Date(st.lastSeen).getTime() + OFFLINE_AFTER_MS).toISOString(),
      });
    } else if (st.latest.supercapV < LOW_SUPERCAP_V) {
      alerts.push({
        id: `energy-${node.id}`,
        nodeId: node.id,
        zone: node.zone,
        kind: "maintenance",
        level: "watch",
        title: "Low energy reserve",
        detail: `Supercapacitor at ${st.latest.supercapV.toFixed(2)} V; thermoelectric ΔT is low. Uplink cadence reduced to 2/day.`,
        raisedAt: st.latest.t,
      });
    }
  }
  const rank = { critical: 0, warning: 1, watch: 2, normal: 3 };
  return alerts.sort((a, b) => rank[a.level] - rank[b.level] || (a.kind === "fire" ? -1 : 1));
}

/** First sample whose CO left the baseline envelope — a proxy for event onset. */
function onsetOf(s: Reading[]): string | null {
  const base = s.slice(0, 24).map((r) => r.coPpm);
  const mean = base.reduce((a, b) => a + b, 0) / base.length;
  const hit = s.find((r, i) => i >= 24 && r.coPpm > mean + 1.5);
  return hit?.t ?? null;
}

export function getSnapshot(nowMs = Date.now()): Snapshot {
  const step = currentStep(nowMs);
  if (!cache || cache.step !== step) cache = buildSnapshot(step * STEP_MS + (nowMs % STEP_MS));
  return cache;
}

export function getNodeDetail(id: string, hours = 48, nowMs = Date.now()) {
  const node = getNode(id);
  if (!node) return null;
  const status = getSnapshot(nowMs).statuses.find((s) => s.node.id === id)!;
  return {
    status,
    series: getSeries(node, hours, nowMs),
    neighbors: neighborsOf(id),
  };
}
