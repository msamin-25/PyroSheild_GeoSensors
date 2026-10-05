import { getSnapshot } from "@/lib/network";

export function GET() {
  return Response.json({ generatedAt: new Date().toISOString(), alerts: getSnapshot().alerts });
}
