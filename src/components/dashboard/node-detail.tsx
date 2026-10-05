"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Battery, Droplets, MapPin, Satellite, X } from "lucide-react";
import type { NodeStatus, Reading } from "@/lib/types";
import { CLASS_LABEL, LEVEL_COLOR, nodeHex, timeAgo } from "@/lib/ui";

interface Detail {
  status: NodeStatus;
  series: Reading[];
  neighbors: string[];
}

const TZ = "America/Vancouver";
const tick = (t: string) => new Date(t).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const full = (t: unknown) =>
  new Date(String(t)).toLocaleString("en-CA", { timeZone: TZ, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

const axis = { stroke: "#5f8a6c", fontSize: 11, tickLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "#153223", border: "1px solid #234a33", borderRadius: 8, fontSize: 12 },
  labelFormatter: full,
};

export function NodeDetail({ id, refreshKey, onClose, onSelect }: { id: string; refreshKey: string; onClose: () => void; onSelect: (id: string) => void }) {
  const [data, setData] = useState<{ id: string; detail: Detail } | null>(null);
  const [hours, setHours] = useState(24);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/nodes/${id}?hours=${hours}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((detail: Detail) => setData({ id, detail }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [id, hours, refreshKey]);

  const d = data?.id === id ? data.detail : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line p-4">
        <div>
          <div className="eyebrow">Sensor node</div>
          <h2 className="mt-1 font-mono text-lg font-semibold">{id}</h2>
          {d && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1"><MapPin size={12} />{d.status.node.zone} · km {d.status.node.corridorKm}</span>
              <span className="flex items-center gap-1"><Satellite size={12} />{timeAgo(d.status.lastSeen)}</span>
              <span>{d.status.node.elevationM} m · fw {d.status.node.firmware}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-panel-2 hover:text-text" aria-label="Close node detail">
          <X size={18} />
        </button>
      </div>

      {!d ? (
        <div className="grid flex-1 place-items-center text-sm text-muted">Loading telemetry…</div>
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <Assessment detail={d} />

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Telemetry</h3>
            <div className="flex rounded-md border border-line p-0.5 text-xs">
              {[6, 24, 48].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`rounded px-2 py-0.5 ${hours === h ? "bg-panel-2 text-text" : "text-muted"}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <ChartCard title="Soil & air temperature (°C)">
            <LineChart data={d.series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1a3a27" vertical={false} />
              <XAxis dataKey="t" tickFormatter={tick} minTickGap={40} {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="airTempC" name="Air" stroke="#5aa9e6" dot={false} strokeWidth={1.5} />
              <Line dataKey="soil5C" name="5 cm" stroke="#e8c547" dot={false} strokeWidth={1.5} />
              <Line dataKey="soil15C" name="15 cm" stroke="#ff8a2b" dot={false} strokeWidth={1.5} />
              <Line dataKey="soil30C" name="30 cm" stroke="#ff3d3d" dot={false} strokeWidth={2} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Combustion gases">
            <LineChart data={d.series} margin={{ top: 4, right: -10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1a3a27" vertical={false} />
              <XAxis dataKey="t" tickFormatter={tick} minTickGap={40} {...axis} />
              <YAxis yAxisId="co" {...axis} />
              <YAxis yAxisId="voc" orientation="right" {...axis} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="co" dataKey="coPpm" name="CO (ppm)" stroke="#ff6a2b" dot={false} strokeWidth={2} />
              <Line yAxisId="voc" dataKey="vocPpb" name="VOC (ppb)" stroke="#b48ce8" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Thermoelectric harvest (µW)">
            <AreaChart data={d.series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1a3a27" vertical={false} />
              <XAxis dataKey="t" tickFormatter={tick} minTickGap={40} {...axis} />
              <YAxis {...axis} />
              <Tooltip {...tooltipStyle} />
              <Area dataKey="harvestUw" name="Harvest µW" stroke="#74c27a" fill="#74c27a" fillOpacity={0.15} />
            </AreaChart>
          </ChartCard>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat icon={<Battery size={14} />} label="Supercap" value={`${d.status.latest.supercapV.toFixed(2)} V`} />
            <Stat icon={<Droplets size={14} />} label="Soil moisture" value={`${d.status.latest.soilMoisturePct.toFixed(0)} % VWC`} />
          </div>

          {d.neighbors.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Neighbors within 400 m</h3>
              <div className="flex flex-wrap gap-1.5">
                {d.neighbors.map((n) => (
                  <button key={n} onClick={() => onSelect(n)} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-muted hover:text-text">
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Assessment({ detail }: { detail: Detail }) {
  const a = detail.status.assessment;
  const color = nodeHex(a.level, a.classification);
  const maxPts = Math.max(1, ...a.factors.map((f) => Math.abs(f.points)));
  return (
    <div className="card p-4" style={{ borderColor: a.level === "normal" ? undefined : color }}>
      <div className="flex items-center gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#234a33" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${a.score * 0.974} 100`} strokeLinecap="round" />
          </svg>
          <span className="font-mono text-lg font-semibold">{a.score}</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color }}>
            {CLASS_LABEL[a.classification]}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Level <span style={{ color: LEVEL_COLOR[a.level] }}>{a.level}</span>
            {a.classification !== "offline" && <> · confidence {(a.confidence * 100).toFixed(0)}%</>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{a.summary}</p>
        </div>
      </div>

      {a.breakthroughHours && (
        <div className="mt-3 rounded-lg bg-critical/10 px-3 py-2 text-xs text-critical">
          Projected surface breakthrough in <b>{a.breakthroughHours[0]}–{a.breakthroughHours[1]} h</b> (heuristic estimate)
        </div>
      )}

      {a.factors.length > 0 && (
        <ul className="mt-4 space-y-2">
          {a.factors.map((f) => (
            <li key={f.key} className="text-xs">
              <div className="flex justify-between gap-2">
                <span>{f.label}</span>
                <span className={`font-mono ${f.points < 0 ? "text-sky" : "text-text"}`}>
                  {f.points > 0 ? "+" : ""}
                  {f.points}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <div className="h-1 flex-1 rounded bg-panel-2">
                  <div
                    className="h-1 rounded"
                    style={{ width: `${(Math.abs(f.points) / maxPts) * 100}%`, background: f.points < 0 ? "var(--sky)" : color }}
                  />
                </div>
                <span className="w-36 truncate text-right text-muted">{f.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="card p-3">
      <div className="mb-2 text-xs text-muted">{title}</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center justify-between px-3 py-2">
      <span className="flex items-center gap-1.5 text-muted">{icon}{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
