"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Check, Clock, Copy, ExternalLink, Flame, MapPin, Mountain } from "lucide-react";
import type { NodeStatus, Reading } from "@/lib/types";
import { CLASS_LABEL, LEVEL_LABEL, classTone, nodeHex, timeAgo } from "@/lib/ui";
import { Badge } from "../ui/badge";
import { Segmented } from "../ui/segmented";

interface Detail {
  status: NodeStatus;
  series: Reading[];
  neighbors: string[];
}

type Tab = "assessment" | "telemetry" | "device";

const TZ = "America/Vancouver";
const tick = (t: string) => new Date(t).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const full = (t: unknown) =>
  new Date(String(t)).toLocaleString("en-CA", { timeZone: TZ, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

const C = { grid: "rgba(170,230,190,0.07)", axis: "#6e8c78", air: "#6cb8f0", s5: "#e9c46a", s15: "#ff8c42", s30: "#ff4d4d", co: "#ff6b35", voc: "#b89cf0", harvest: "#7ee08f" };
const axis = { stroke: C.axis, fontSize: 10, tickLine: false, axisLine: false } as const;
const tooltipProps = {
  contentStyle: { background: "#10261a", border: "1px solid rgba(170,230,190,0.18)", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px -8px rgba(0,0,0,.6)" },
  labelStyle: { color: "#a8c1b0", marginBottom: 4 },
  labelFormatter: full,
  cursor: { stroke: "rgba(170,230,190,0.25)" },
};

export function NodeDetail({ id, refreshKey, onClose, onSelect }: { id: string; refreshKey: string; onClose: () => void; onSelect: (id: string) => void }) {
  const [data, setData] = useState<{ key: string; detail: Detail } | null>(null);
  const [hours, setHours] = useState(24);
  const [tab, setTab] = useState<Tab>("assessment");

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/nodes/${id}?hours=${hours}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((detail: Detail) => setData({ key: id, detail }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [id, hours, refreshKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const d = data?.key === id ? data.detail : null;
  const a = d?.status.assessment;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-5 pb-0 pt-4">
        <button onClick={onClose} className="-ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-fg-3 hover:text-fg">
          <ArrowLeft size={14} /> All alerts <kbd className="ml-1 rounded border border-border px-1 font-mono text-[10px]">esc</kbd>
        </button>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-mono text-xl font-semibold tracking-tight">{id}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-3">
              {d ? (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {d.status.node.zone} · km {d.status.node.corridorKm}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {timeAgo(d.status.lastSeen)}
                  </span>
                </>
              ) : (
                <span className="skeleton h-3.5 w-48" />
              )}
            </div>
          </div>
          {a && (
            <Badge tone={classTone(a.level, a.classification)} dot pulse={a.level === "critical"}>
              {a.classification === "offline" ? "Offline" : LEVEL_LABEL[a.level]}
            </Badge>
          )}
        </div>
        <nav className="mt-4 flex gap-5 text-sm" role="tablist">
          {(["assessment", "telemetry", "device"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative pb-3 capitalize transition-colors ${tab === t ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}
            >
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-5">
        {!d ? (
          <DetailSkeleton />
        ) : tab === "assessment" ? (
          <AssessmentTab detail={d} />
        ) : tab === "telemetry" ? (
          <TelemetryTab detail={d} hours={hours} setHours={setHours} />
        ) : (
          <DeviceTab detail={d} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-28" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-8" />
      ))}
    </div>
  );
}

function ScoreRing({ score, color, size = 84 }: { score: number; color: string; size?: number }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(170,230,190,0.1)" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s var(--ease-out)", filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </svg>
      <div className="text-center leading-none">
        <div className="font-mono text-2xl font-semibold">{score}</div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-fg-3">risk</div>
      </div>
    </div>
  );
}

function AssessmentTab({ detail }: { detail: Detail }) {
  const { status } = detail;
  const a = status.assessment;
  const color = nodeHex(a.level, a.classification);
  const maxPts = Math.max(1, ...a.factors.map((f) => Math.abs(f.points)));
  const [copied, setCopied] = useState(false);
  const coords = `${status.node.lat.toFixed(5)}, ${status.node.lng.toFixed(5)}`;

  return (
    <div className="anim-fade-up space-y-5">
      <div className="surface-raised p-5">
        <div className="flex items-center gap-5">
          <ScoreRing score={a.score} color={color} />
          <div className="min-w-0">
            <div className="text-[15px] font-semibold" style={{ color }}>
              {CLASS_LABEL[a.classification]}
            </div>
            {a.classification !== "offline" && <div className="mt-0.5 text-xs text-fg-3">{Math.round(a.confidence * 100)}% model confidence</div>}
            <p className="mt-2 text-[13px] leading-relaxed text-fg-2">{a.summary}</p>
          </div>
        </div>

        {a.breakthroughHours && (
          <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-md)] border border-critical/25 bg-critical/10 px-4 py-3">
            <Flame size={18} className="shrink-0 text-critical" />
            <div className="text-[13px]">
              <div className="font-medium text-fg">
                Surface breakthrough in{" "}
                <span className="font-mono text-critical">
                  {a.breakthroughHours[0]}–{a.breakthroughHours[1]} h
                </span>
              </div>
              <div className="text-xs text-fg-3">Heuristic projection from root-zone heating and CO rise rate</div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(coords).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border-strong bg-surface-2 text-xs text-fg-2 hover:bg-surface-3 hover:text-fg"
          >
            {copied ? <Check size={13} className="text-brand" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy coordinates"}
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${status.node.lat},${status.node.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border-strong bg-surface-2 text-xs text-fg-2 hover:bg-surface-3 hover:text-fg"
          >
            <ExternalLink size={13} /> Open in Maps
          </a>
        </div>
      </div>

      {a.factors.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.12em] text-fg-3">
            Score breakdown <span className="font-mono normal-case tracking-normal">Σ {a.score}</span>
          </h3>
          <ul className="space-y-3.5">
            {a.factors.map((f) => (
              <li key={f.key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="text-fg">{f.label}</span>
                  <span className={`font-mono text-xs ${f.points < 0 ? "text-info" : "text-fg"}`}>
                    {f.points > 0 ? "+" : ""}
                    {f.points}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(Math.abs(f.points) / maxPts) * 100}%`, background: f.points < 0 ? "var(--info)" : color, transition: "width .5s var(--ease-out)" }}
                  />
                </div>
                <div className="mt-1 font-mono text-[11px] text-fg-3">{f.value}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {a.classification === "nominal" && (
        <p className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-[13px] text-fg-3">
          All sensing channels are inside this node&apos;s 42-hour baseline envelope.
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, legend, children }: { title: string; legend: [string, string][]; children: React.ReactElement }) {
  return (
    <div className="surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] font-medium">{title}</div>
        <div className="flex flex-wrap gap-3">
          {legend.map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-fg-3">
              <span className="h-0.5 w-2.5 rounded" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TelemetryTab({ detail, hours, setHours }: { detail: Detail; hours: number; setHours: (h: number) => void }) {
  const s = detail.series;
  const m = { top: 4, right: 4, left: -22, bottom: 0 };
  return (
    <div className="anim-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-3">{s.length} samples · 15-min cadence</span>
        <Segmented
          label="Time range"
          value={hours}
          onChange={setHours}
          options={[
            { value: 6, label: "6h" },
            { value: 24, label: "24h" },
            { value: 48, label: "48h" },
          ]}
        />
      </div>

      <ChartCard title="Soil temperature profile" legend={[["Air", C.air], ["5 cm", C.s5], ["15 cm", C.s15], ["30 cm", C.s30]]}>
        <LineChart data={s} margin={m}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="t" tickFormatter={tick} minTickGap={48} {...axis} />
          <YAxis {...axis} unit="°" />
          <Tooltip {...tooltipProps} />
          <Line dataKey="airTempC" name="Air °C" stroke={C.air} dot={false} strokeWidth={1.25} />
          <Line dataKey="soil5C" name="5 cm °C" stroke={C.s5} dot={false} strokeWidth={1.25} />
          <Line dataKey="soil15C" name="15 cm °C" stroke={C.s15} dot={false} strokeWidth={1.5} />
          <Line dataKey="soil30C" name="30 cm °C" stroke={C.s30} dot={false} strokeWidth={2.25} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Combustion gases" legend={[["CO ppm", C.co], ["VOC ppb", C.voc]]}>
        <LineChart data={s} margin={{ ...m, right: -14 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="t" tickFormatter={tick} minTickGap={48} {...axis} />
          <YAxis yAxisId="co" {...axis} />
          <YAxis yAxisId="voc" orientation="right" {...axis} />
          <Tooltip {...tooltipProps} />
          <Line yAxisId="co" dataKey="coPpm" name="CO ppm" stroke={C.co} dot={false} strokeWidth={2} />
          <Line yAxisId="voc" dataKey="vocPpb" name="VOC ppb" stroke={C.voc} dot={false} strokeWidth={1.25} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Thermoelectric harvest" legend={[["µW", C.harvest]]}>
        <AreaChart data={s} margin={m}>
          <defs>
            <linearGradient id="harvestFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.harvest} stopOpacity={0.35} />
              <stop offset="1" stopColor={C.harvest} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="t" tickFormatter={tick} minTickGap={48} {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltipProps} />
          <Area dataKey="harvestUw" name="Harvest µW" stroke={C.harvest} strokeWidth={1.5} fill="url(#harvestFill)" />
        </AreaChart>
      </ChartCard>
    </div>
  );
}

function DeviceTab({ detail, onSelect }: { detail: Detail; onSelect: (id: string) => void }) {
  const { node, latest, lastSeen } = detail.status;
  const rows: [string, string][] = [
    ["Supercapacitor", `${latest.supercapV.toFixed(2)} V`],
    ["Harvest (latest)", `${latest.harvestUw} µW`],
    ["Soil moisture", `${latest.soilMoisturePct.toFixed(0)} % VWC`],
    ["Firmware", node.firmware],
    ["Elevation", `${node.elevationM} m`],
    ["Deployed", new Date(node.deployedAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })],
    ["Last uplink", full(lastSeen)],
    ["Position", `${node.lat.toFixed(5)}, ${node.lng.toFixed(5)}`],
  ];
  const lowEnergy = latest.supercapV < 2.5;
  return (
    <div className="anim-fade-up space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Gauge label="Energy reserve" value={(latest.supercapV - 2.2) / 0.7} text={`${latest.supercapV.toFixed(2)} V`} tone={lowEnergy ? "var(--risk-watch)" : "var(--brand)"} />
        <Gauge label="Soil moisture" value={latest.soilMoisturePct / 45} text={`${latest.soilMoisturePct.toFixed(0)} %`} tone="var(--info)" />
      </div>
      <dl className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 bg-surface px-4 py-2.5 text-[13px]">
            <dt className="text-fg-3">{k}</dt>
            <dd className="text-right font-mono text-xs text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      {detail.neighbors.length > 0 && (
        <section>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-fg-3">
            <Mountain size={12} /> Neighbours within 400 m
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {detail.neighbors.map((n) => (
              <button
                key={n}
                onClick={() => onSelect(n)}
                className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 font-mono text-[11px] text-fg-2 hover:border-border-strong hover:text-fg"
              >
                {n}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Gauge({ label, value, text, tone }: { label: string; value: number; text: string; tone: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="surface p-4">
      <div className="text-xs text-fg-3">{label}</div>
      <div className="mt-1 font-mono text-lg">{text}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full" style={{ width: `${v * 100}%`, background: tone }} />
      </div>
    </div>
  );
}

