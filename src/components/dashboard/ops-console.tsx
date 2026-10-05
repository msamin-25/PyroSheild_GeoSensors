"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flame, Radio, Trees, Wrench } from "lucide-react";
import type { Alert } from "@/lib/types";
import { BIOGENIC_HEX, LEVEL_HEX, OFFLINE_HEX, timeAgo } from "@/lib/ui";
import { NodeDetail } from "./node-detail";
import type { AlertsResponse, NetworkResponse } from "./types";

const CorridorMap = dynamic(() => import("./corridor-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Loading map…</div>,
});

const POLL_MS = 30_000;
/** Corridor coverage per node: 0.2 km spacing × 300 m buffer ÷ 3 rows = 2 ha. */
const HA_PER_NODE = (0.2 * 0.3 * 100) / 3;
const PRICE_PER_HA = 25;

export function OpsConsole() {
  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const [n, a] = await Promise.all([
        fetch("/api/network").then((r) => r.json() as Promise<NetworkResponse>),
        fetch("/api/alerts").then((r) => r.json() as Promise<AlertsResponse>),
      ]);
      setNet(n);
      setAlerts(a.alerts);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch, then poll
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const kpis = useMemo(() => {
    if (!net) return null;
    const online = net.nodes.filter((n) => n.online).length;
    const fire = alerts.filter((a) => a.kind === "fire");
    const ha = Math.round(net.nodes.length * HA_PER_NODE);
    return {
      online,
      total: net.nodes.length,
      critical: fire.filter((a) => a.level === "critical").length,
      fire: fire.length,
      maintenance: alerts.length - fire.length,
      ha,
      contract: ha * PRICE_PER_HA,
    };
  }, [net, alerts]);

  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-3.5rem)]">
      <div className="border-b border-line px-4 py-3">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Operations · BC Interior</div>
            <h1 className="text-lg font-semibold tracking-tight">Merritt – Kamloops 230 kV Transmission Corridor</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-line px-2.5 py-1 text-muted">Digital-twin telemetry</span>
            <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
              <span className={`size-1.5 rounded-full ${error ? "bg-critical" : "bg-moss animate-pulse"}`} />
              {error ? "Connection lost" : net ? `Updated ${timeAgo(net.generatedAt)}` : "Connecting…"}
            </span>
          </div>
        </div>
        <div className="mx-auto mt-3 grid max-w-[1600px] grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi icon={<Radio size={14} />} label="Nodes reporting" value={kpis ? `${kpis.online} / ${kpis.total}` : "—"} />
          <Kpi
            icon={<Flame size={14} />}
            label="Fire alerts"
            value={kpis ? String(kpis.fire) : "—"}
            accent={kpis?.critical ? "var(--risk-critical)" : undefined}
            sub={kpis?.critical ? `${kpis.critical} critical` : undefined}
          />
          <Kpi icon={<Wrench size={14} />} label="Maintenance" value={kpis ? String(kpis.maintenance) : "—"} />
          <Kpi
            icon={<Trees size={14} />}
            label="Hectares monitored"
            value={kpis ? kpis.ha.toLocaleString() : "—"}
            sub={kpis ? `$${kpis.contract.toLocaleString()}/yr at $${PRICE_PER_HA}/ha` : undefined}
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[1fr_420px]">
        <div className="relative h-[60vh] lg:h-auto">
          {net && <CorridorMap corridor={net.corridor} nodes={net.nodes} selectedId={selectedId} onSelect={setSelectedId} />}
          <Legend />
        </div>
        <aside className="border-t border-line lg:min-h-0 lg:border-l lg:border-t-0">
          {selectedId ? (
            <NodeDetail
              id={selectedId}
              refreshKey={net?.generatedAt ?? ""}
              onClose={() => setSelectedId(null)}
              onSelect={setSelectedId}
            />
          ) : (
            <AlertFeed alerts={alerts} onSelect={setSelectedId} />
          )}
        </aside>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="card px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

function AlertFeed({ alerts, onSelect }: { alerts: Alert[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <div className="eyebrow">Alert queue</div>
        <p className="mt-1 text-xs text-muted">Select an alert or any node on the map to inspect its telemetry and risk breakdown.</p>
      </div>
      <ul className="flex-1 divide-y divide-line overflow-y-auto">
        {alerts.length === 0 && <li className="p-4 text-sm text-muted">No active alerts.</li>}
        {alerts.map((a) => {
          const color = a.kind === "maintenance" ? OFFLINE_HEX : LEVEL_HEX[a.level];
          return (
            <li key={a.id}>
              <button onClick={() => onSelect(a.nodeId)} className="flex w-full gap-3 p-4 text-left hover:bg-panel">
                <span className="mt-0.5 shrink-0" style={{ color }}>
                  {a.kind === "fire" ? <AlertTriangle size={16} /> : <Wrench size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.title}</span>
                    {a.kind === "fire" && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color, background: `${color}22` }}>
                        {a.level}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-muted">
                    {a.nodeId} · {a.zone} · {timeAgo(a.raisedAt)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{a.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Legend() {
  const items: [string, string][] = [
    ["Nominal", LEVEL_HEX.normal],
    ["Watch", LEVEL_HEX.watch],
    ["Warning", LEVEL_HEX.warning],
    ["Critical", LEVEL_HEX.critical],
    ["Biogenic / plume", BIOGENIC_HEX],
    ["Offline", OFFLINE_HEX],
  ];
  return (
    <div className="pointer-events-none absolute bottom-6 left-3 z-[500] rounded-lg border border-line bg-bg/85 px-3 py-2 text-[11px] backdrop-blur">
      {items.map(([label, c]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: c }} />
          {label}
        </div>
      ))}
    </div>
  );
}
