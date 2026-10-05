import type { NextRequest } from "next/server";
import { getNodeDetail } from "@/lib/network";

/** Full node detail: status, explainable assessment and trailing telemetry (?hours=1–48). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/nodes/[id]">) {
  const { id } = await ctx.params;
  const hours = Math.min(48, Math.max(1, Number(req.nextUrl.searchParams.get("hours")) || 48));
  const detail = getNodeDetail(id, hours);
  if (!detail) return Response.json({ error: `Unknown node ${id}` }, { status: 404 });
  return Response.json(detail);
}
