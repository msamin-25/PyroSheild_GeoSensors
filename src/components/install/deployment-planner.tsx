"use client";

import { useState } from "react";
import { AlertTriangle, Plane, Users } from "lucide-react";
import { Segmented } from "../ui/segmented";

const PRICE_PER_HA = 25;
const NODES_PER_MAGAZINE = 48;
const MAGAZINES_PER_SORTIE = 4;

export function DeploymentPlanner() {
  const [lengthKm, setLengthKm] = useState(80);
  const [bufferM, setBufferM] = useState(300);
  const [spacingM, setSpacingM] = useState(200);
  const [method, setMethod] = useState<"aerial" | "ground">("aerial");

  const rows = Math.max(1, Math.round(bufferM / 100));
  const positions = Math.floor((lengthKm * 1000) / spacingM) + 1;
  const nodes = positions * rows;
  const spares = Math.ceil(nodes * (method === "aerial" ? 0.06 : 0.02));
  const ha = Math.round((lengthKm * 1000 * bufferM) / 10_000);
  const haPerNode = ha / nodes;
  const sorties = Math.ceil((nodes + spares) / (NODES_PER_MAGAZINE * MAGAZINES_PER_SORTIE));
  const crewDays = Math.ceil((nodes + spares) / 120);
  const annual = ha * PRICE_PER_HA;

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border-strong bg-surface shadow-lg">
      <div className="grid lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-7 p-7 sm:p-9">
          <div>
            <div className="eyebrow">Deployment planner</div>
            <h2 className="text-title mt-3 text-2xl">Size a corridor in seconds.</h2>
            <p className="mt-2 text-sm text-fg-3">Drag the sliders. Node count, logistics and the subscription update live.</p>
          </div>
          <Slider label="Corridor length" unit="km" value={lengthKm} min={5} max={400} step={5} onChange={setLengthKm} />
          <Slider label="Monitored buffer width" unit="m" value={bufferM} min={100} max={900} step={100} onChange={setBufferM} />
          <Slider label="Along-corridor spacing" unit="m" value={spacingM} min={100} max={600} step={50} onChange={setSpacingM} />
          <div>
            <div className="mb-2 text-sm text-fg-2">Deployment method</div>
            <Segmented
              label="Deployment method"
              value={method}
              onChange={setMethod}
              options={[
                { value: "aerial", label: <><Plane size={13} /> Aerial drop</> },
                { value: "ground", label: <><Users size={13} /> Ground crew</> },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border bg-surface-2/60 p-7 sm:p-9 lg:border-l lg:border-t-0">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-brand/30 bg-gradient-to-br from-brand/15 to-transparent p-6">
            <div className="text-xs text-fg-2">Annual subscription</div>
            <div className="text-display mt-2 font-mono text-5xl">${annual.toLocaleString()}</div>
            <div className="mt-2 text-xs text-fg-3">
              {ha.toLocaleString()} ha × ${PRICE_PER_HA}/ha/yr · hardware, deployment and monitoring included
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <Out label="Nodes" value={nodes.toLocaleString()} sub={`+${spares} spares`} />
            <Out label="Coverage" value={`${haPerNode.toFixed(1)} ha`} sub="per node" />
            <Out label="Sensor rows" value={String(rows)} sub="staggered" />
            {method === "aerial" ? (
              <Out label="Helicopter sorties" value={String(sorties)} sub={`${MAGAZINES_PER_SORTIE} × ${NODES_PER_MAGAZINE}-node magazines`} />
            ) : (
              <Out label="Crew-days" value={String(crewDays)} sub="2-person, ≈ 120 nodes/day" />
            )}
          </dl>
          {haPerNode > 3 && (
            <p className="flex gap-2 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-warning">
              <AlertTriangle size={14} className="mt-px shrink-0" />
              Coverage is below 1 node per 3 ha, so detection latency for fires between nodes will rise. Tighten the spacing or add rows.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Slider({ label, unit, value, min, max, step, onChange }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-fg-2">{label}</span>
        <span className="font-mono text-sm text-fg">
          {value} <span className="text-fg-3">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-3 w-full cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--brand) ${pct}%, var(--surface-3) ${pct}%)` }}
      />
    </label>
  );
}

function Out({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
      <dt className="text-xs text-fg-3">{label}</dt>
      <dd className="mt-1 font-mono text-xl">{value}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-fg-3">{sub}</dd>}
    </div>
  );
}
