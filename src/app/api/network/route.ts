import { getSnapshot } from "@/lib/network";
import { CORRIDOR } from "@/lib/sim";

/** Network-wide status: one compact row per node, plus corridor geometry and alert counts. */
export function GET() {
  const { statuses, alerts } = getSnapshot();
  return Response.json({
    generatedAt: new Date().toISOString(),
    corridor: CORRIDOR,
    nodes: statuses.map((s) => ({
      id: s.node.id,
      zone: s.node.zone,
      lat: s.node.lat,
      lng: s.node.lng,
      corridorKm: s.node.corridorKm,
      online: s.online,
      lastSeen: s.lastSeen,
      score: s.assessment.score,
      level: s.assessment.level,
      classification: s.assessment.classification,
      soil30C: s.latest.soil30C,
      coPpm: s.latest.coPpm,
      supercapV: s.latest.supercapV,
    })),
    alertCount: alerts.length,
  });
}
