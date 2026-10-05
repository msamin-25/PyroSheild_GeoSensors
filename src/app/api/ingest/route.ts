import { assess } from "@/lib/detection";
import { getNode } from "@/lib/sim";
import type { Reading } from "@/lib/types";

/**
 * Satellite ground-station webhook. Accepts a decoded uplink packet and returns
 * the node's assessment. Stateless for now: the packet is scored, not stored.
 *
 * Body: { nodeId: string, readings: Reading[] }  (oldest first, ≥16 samples at 15-min cadence)
 */
const FIELDS: (keyof Reading)[] = [
  "airTempC", "soil5C", "soil15C", "soil30C", "coPpm", "vocPpb", "soilMoisturePct", "harvestUw", "supercapV",
];

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const { nodeId, readings } = (body ?? {}) as { nodeId?: unknown; readings?: unknown };

  if (typeof nodeId !== "string" || !getNode(nodeId)) {
    return Response.json({ error: "Unknown or missing nodeId" }, { status: 422 });
  }
  if (!Array.isArray(readings) || readings.length < 16 || readings.length > 192) {
    return Response.json({ error: "readings must be an array of 16–192 samples" }, { status: 422 });
  }
  for (const [i, r] of readings.entries()) {
    const bad =
      typeof r?.t !== "string" || Number.isNaN(Date.parse(r.t)) ||
      FIELDS.find((f) => typeof r[f] !== "number" || !Number.isFinite(r[f]));
    if (bad) return Response.json({ error: `readings[${i}] invalid${typeof bad === "string" ? `: ${bad}` : ""}` }, { status: 422 });
  }

  const assessment = assess(readings as Reading[], { online: true, corroboratingNeighbors: 0, thermalNeighbor: false });
  return Response.json({ nodeId, received: readings.length, assessment });
}
