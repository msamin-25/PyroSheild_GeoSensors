"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Flame, Layers, Radio, RefreshCw, Search, Trees, WifiOff, Wrench } from "lucide-react";
import type { Alert } from "@/lib/types";
import { BIOGENIC_HEX, LEVEL_HEX, LEVEL_LABEL, OFFLINE_HEX, levelTone, timeAgo } from "@/lib/ui";
import { Badge } from "../ui/badge";
import { Segmented } from "../ui/segmented";
import { NodeDetail } from "./node-detail";
import type { AlertsResponse, BaseLayer, NetworkResponse, NodeFilter, NodeRow } from "./types";

const CorridorMap = dynamic(() => import("./corridor-map"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full !rounded-none" />,
});

const POLL_MS = 30_000;
/** Corridor coverage per node: 0.2 km spacing × 300 m buffer ÷ 3 rows = 2 ha. */
const HA_PER_NODE = (0.2 * 0.3 * 100) / 3;
const PRICE_PER_HA = 25;

type PanelTab = "alerts" | "zones";
type AlertKind = "all" | "fire" | "maintenance";

export function OpsConsole() {
  const [net, setNet] = useState<NetworkResponse | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [layer, setLayer] = useState<BaseLayer>("dark");
  const [filter, setFilter] = useState<NodeFilter>("all");
  const [tab, setTab] = useState<PanelTab>("alerts");
  const [kind, setKind] = useState<AlertKind>("all");
  const [query, setQuery] = useState("");
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch, then poll
    load();
    const poll = setInterval(load, POLL_MS);
    const clock = setInterval(() => setTick((t) => t + 1), 15_000); // keeps "updated Xm ago" honest
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
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
      offline: net.nodes.length - online,
      ha,
      contract: ha * PRICE_PER_HA,
    };
  }, [net, alerts]);

  const zoneCount = useMemo(() => new Set(net?.nodes.map((n) => n.zone)).size, [net]);
  const nodeIds = useMemo(() => new Set(net?.nodes.map((n) => n.id)), [net]);
  const submitSearch = (raw: string) => {
    const id = raw.trim().toUpperCase();
    if (nodeIds.has(id)) {
      setSelectedId(id);
      setQuery("");
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-65px)] lg:min-h-[640px] lg:flex-none">
      {/* Toolbar */}
      <div className="border-b border-border">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-fg-3">
              Corridors <ChevronRight size={12} /> BC Interior
            </div>
            <h1 className="text-title mt-0.5 truncate text-lg">Merritt – Kamloops 230 kV</h1>
          </div>

          <form
            className="relative order-last w-full sm:order-none sm:ml-auto sm:w-72"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
          >
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (nodeIds.has(e.target.value.toUpperCase())) submitSearch(e.target.value);
              }}
              list="node-ids"
              placeholder="Jump to node, e.g. PS-SL-028"
              aria-label="Search nodes"
              className="h-9 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-9 pr-3 font-mono text-[13px] text-fg placeholder:font-sans placeholder:text-fg-3 focus:border-brand/50"
            />
            <datalist id="node-ids">{net?.nodes.map((n) => <option key={n.id} value={n.id} />)}</datalist>
          </form>

          <div className="flex items-center gap-2">
            <Badge tone="info">Digital twin</Badge>
            <button
              onClick={load}
              className="flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11px] text-fg-2 hover:border-border-strong hover:text-fg"
              aria-label="Refresh now"
            >
              <span className={`size-1.5 rounded-full ${error ? "bg-critical" : "bg-ok"}`} />
              {error ? "Offline · retry" : net ? `Live · ${timeAgo(net.generatedAt)}` : "Connecting"}
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 border-t border-border lg:grid-cols-4">
          <Kpi icon={<Radio size={15} />} label="Nodes reporting" value={kpis ? `${kpis.online.toLocaleString()}` : null} suffix={kpis ? `/ ${kpis.total.toLocaleString()}` : ""} sub={kpis ? `${kpis.offline} missed uplinks` : ""} />
          <Kpi
            icon={<Flame size={15} />}
            label="Active fire alerts"
            value={kpis ? String(kpis.fire) : null}
            accent={kpis?.critical ? "critical" : undefined}
            sub={kpis ? (kpis.critical ? `${kpis.critical} critical — dispatch` : "None critical") : ""}
          />
          <Kpi icon={<Wrench size={15} />} label="Maintenance" value={kpis ? String(kpis.maintenance) : null} sub="Offline or low energy" />
          <Kpi
            icon={<Trees size={15} />}
            label="Area protected"
            value={kpis ? kpis.ha.toLocaleString() : null}
            suffix="ha"
            sub={kpis ? `$${kpis.contract.toLocaleString()} / yr contract` : ""}
          />
        </div>
      </div>

      {/* Workspace */}
      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[1fr_420px] lg:grid-rows-[minmax(0,1fr)]">
        <div className="relative h-[62vh] min-h-[420px] lg:h-auto">
          {net && <CorridorMap corridor={net.corridor} nodes={net.nodes} selectedId={selectedId} onSelect={setSelectedId} layer={layer} filter={filter} />}
          {!net && <div className="skeleton absolute inset-0 !rounded-none" />}

          <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-wrap items-start justify-between gap-2">
            <div className="pointer-events-auto rounded-[var(--radius-md)] bg-overlay shadow-md backdrop-blur-md">
              <Segmented
                label="Filter nodes"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: "All nodes" },
                  { value: "risk", label: <><AlertTriangle size={12} /> At risk</> },
                  { value: "offline", label: <><WifiOff size={12} /> Offline</> },
                ]}
              />
            </div>
            <div className="pointer-events-auto rounded-[var(--radius-md)] bg-overlay shadow-md backdrop-blur-md">
              <Segmented
                label="Base map"
                value={layer}
                onChange={setLayer}
                options={[
                  { value: "dark", label: <><Layers size={12} /> Dark</> },
                  { value: "terrain", label: "Terrain" },
                  { value: "satellite", label: "Satellite" },
                ]}
              />
            </div>
          </div>
          <Legend />
        </div>

        <aside className="flex min-h-[520px] flex-col border-t border-border bg-surface/50 lg:min-h-0 lg:overflow-hidden lg:border-l lg:border-t-0">
          {selectedId ? (
            <NodeDetail id={selectedId} refreshKey={net?.generatedAt ?? ""} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border px-5 pt-3">
                <nav className="flex gap-5 text-sm" role="tablist">
                  {(
                    [
                      ["alerts", "Alerts", alerts.length],
                      ["zones", "Zones", zoneCount],
                    ] as const
                  ).map(([t, label, n]) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`relative flex items-center gap-2 pb-3 transition-colors ${tab === t ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}
                    >
                      {label}
                      <span className="rounded-full bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-fg-2">{n}</span>
                      {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
                    </button>
                  ))}
                </nav>
              </div>
              {tab === "alerts" ? (
                <AlertFeed alerts={alerts} kind={kind} setKind={setKind} onSelect={setSelectedId} loading={!net} />
              ) : (
                <Zones nodes={net?.nodes ?? []} alerts={alerts} />
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, suffix, sub, accent }: { icon: React.ReactNode; label: string; value: string | null; suffix?: string; sub?: string; accent?: "critical" }) {
  return (
    <div className="border-border px-5 py-4 even:border-l sm:px-6 [&:nth-child(n+3)]:border-t lg:border-l lg:first:border-l-0 lg:[&:nth-child(n+3)]:border-t-0">
      <div className="flex items-center gap-2 text-xs text-fg-3">
        <span className={accent ? "text-critical" : "text-fg-3"}>{icon}</span>
        {label}
      </div>
      {value === null ? (
        <div className="skeleton mt-2 h-7 w-24" />
      ) : (
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className={`font-mono text-[26px] font-semibold leading-none tracking-tight ${accent ? "text-critical" : "text-fg"}`}>{value}</span>
          {suffix && <span className="font-mono text-sm text-fg-3">{suffix}</span>}
        </div>
      )}
      {sub && <div className={`mt-1.5 text-xs ${accent ? "text-critical/80" : "text-fg-3"}`}>{sub}</div>}
    </div>
  );
}

function AlertFeed({ alerts, kind, setKind, onSelect, loading }: { alerts: Alert[]; kind: AlertKind; setKind: (k: AlertKind) => void; onSelect: (id: string) => void; loading: boolean }) {
  const shown = alerts.filter((a) => kind === "all" || a.kind === kind);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5 py-3">
        <Segmented
          label="Alert type"
          size="xs"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "All" },
            { value: "fire", label: "Fire" },
            { value: "maintenance", label: "Maintenance" },
          ]}
        />
        <span className="text-[11px] text-fg-3">Sorted by severity</span>
      </div>
      <ul className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {loading &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="skeleton h-24" />
          ))}
        {!loading && shown.length === 0 && (
          <li className="grid place-items-center px-6 py-16 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
              <Trees size={18} />
            </span>
            <div className="mt-3 text-sm font-medium">All clear</div>
            <div className="mt-1 text-xs text-fg-3">No {kind === "all" ? "" : kind + " "}alerts on this corridor.</div>
          </li>
        )}
        {shown.map((a) => {
          const fire = a.kind === "fire";
          const color = fire ? LEVEL_HEX[a.level] : OFFLINE_HEX;
          return (
            <li key={a.id}>
              <button
                onClick={() => onSelect(a.nodeId)}
                className="group relative flex w-full gap-3 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface p-4 pl-5 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: color }} />
                <span className="mt-0.5 shrink-0" style={{ color }}>
                  {fire ? <Flame size={16} /> : <Wrench size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium leading-snug">{a.title}</span>
                    {fire ? (
                      <Badge tone={levelTone(a.level)} dot pulse={a.level === "critical"}>
                        {LEVEL_LABEL[a.level]}
                      </Badge>
                    ) : (
                      <Badge tone="offline">Maint.</Badge>
                    )}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-fg-3">
                    {a.nodeId} · {a.zone} · {timeAgo(a.raisedAt)}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-fg-2">{a.detail}</span>
                  <span className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Inspect node <ChevronRight size={12} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Zones({ nodes, alerts }: { nodes: NodeRow[]; alerts: Alert[] }) {
  const zones = useMemo(() => {
    const by = new Map<string, NodeRow[]>();
    for (const n of nodes) by.set(n.zone, [...(by.get(n.zone) ?? []), n]);
    return [...by.entries()].map(([zone, ns]) => {
      const kms = ns.map((n) => n.corridorKm);
      return {
        zone,
        total: ns.length,
        online: ns.filter((n) => n.online).length,
        peak: Math.max(...ns.map((n) => n.score)),
        fire: alerts.filter((a) => a.zone === zone && a.kind === "fire").length,
        maint: alerts.filter((a) => a.zone === zone && a.kind === "maintenance").length,
        km: [Math.min(...kms), Math.max(...kms)] as const,
        dist: {
          normal: ns.filter((n) => n.level === "normal" && n.online && n.classification === "nominal").length,
          flagged: ns.filter((n) => n.level === "normal" && (n.classification === "plume" || n.classification === "biogenic")).length,
          elevated: ns.filter((n) => n.level !== "normal").length,
          offline: ns.filter((n) => !n.online).length,
        },
      };
    });
  }, [nodes, alerts]);

  return (
    <ul className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
      {zones.map((z) => {
        const segs: [number, string][] = [
          [z.dist.normal, LEVEL_HEX.normal],
          [z.dist.flagged, BIOGENIC_HEX],
          [z.dist.elevated, LEVEL_HEX.critical],
          [z.dist.offline, OFFLINE_HEX],
        ];
        return (
          <li key={z.zone} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-medium">{z.zone}</div>
                <div className="mt-0.5 font-mono text-[11px] text-fg-3">
                  km {z.km[0].toFixed(0)}–{z.km[1].toFixed(0)} · {z.total} nodes
                </div>
              </div>
              {z.fire > 0 ? (
                <Badge tone="critical" dot>
                  {z.fire} fire
                </Badge>
              ) : (
                <Badge tone="ok" dot>
                  Clear
                </Badge>
              )}
            </div>
            <div className="mt-4 flex h-1.5 gap-px overflow-hidden rounded-full">
              {segs.map(([n, c], i) => n > 0 && <span key={i} style={{ flex: Math.max(n, z.total * 0.012), background: c }} />)}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Online", z.online === z.total ? "100%" : `${Math.min(99.9, (z.online / z.total) * 100).toFixed(1)}%`],
                ["Peak risk", String(z.peak)],
                ["Maint.", String(z.maint)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[var(--radius-sm)] bg-surface-2 py-2">
                  <dd className="font-mono text-sm">{v}</dd>
                  <dt className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-fg-3">{k}</dt>
                </div>
              ))}
            </dl>
          </li>
        );
      })}
    </ul>
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
    <div className="pointer-events-none absolute bottom-8 left-3 z-[500] rounded-[var(--radius-md)] border border-border-strong bg-overlay px-3 py-2.5 shadow-md backdrop-blur-md">
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-fg-3">Node status</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-fg-2">
        {items.map(([label, c]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
