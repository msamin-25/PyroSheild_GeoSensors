"use client";

import { useState } from "react";

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
    <div className="card grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div>
          <div className="eyebrow">Deployment planner</div>
          <p className="mt-1 text-sm text-muted">Size a corridor deployment and its subscription.</p>
        </div>
        <Slider label="Corridor length" unit="km" value={lengthKm} min={5} max={400} step={5} onChange={setLengthKm} />
        <Slider label="Monitored buffer width" unit="m" value={bufferM} min={100} max={900} step={100} onChange={setBufferM} />
        <Slider label="Along-corridor spacing" unit="m" value={spacingM} min={100} max={600} step={50} onChange={setSpacingM} />
        <div className="flex gap-2 text-sm">
          {(["aerial", "ground"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 rounded-lg border px-3 py-2 capitalize ${method === m ? "border-ember/60 bg-ember/10" : "border-line text-muted"}`}
            >
              {m === "aerial" ? "Aerial drop" : "Ground crew"}
            </button>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 self-start">
        <Out label="Area monitored" value={`${ha.toLocaleString()} ha`} />
        <Out label="Sensor rows" value={`${rows} (staggered)`} />
        <Out label="Nodes" value={nodes.toLocaleString()} sub={`+${spares} spares · ${haPerNode.toFixed(2)} ha/node`} />
        {method === "aerial" ? (
          <Out label="Helicopter sorties" value={String(sorties)} sub={`${MAGAZINES_PER_SORTIE} × ${NODES_PER_MAGAZINE}-node magazines each`} />
        ) : (
          <Out label="Crew-days (2-person)" value={String(crewDays)} sub="≈ 120 nodes / crew-day" />
        )}
        <div className="col-span-2 rounded-xl border border-ember/40 bg-ember/10 p-4">
          <dt className="text-xs text-muted">Annual subscription (hardware, deployment, monitoring)</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold">${annual.toLocaleString()}</dd>
          <dd className="text-xs text-muted">at ${PRICE_PER_HA}/ha/yr</dd>
        </div>
        {haPerNode > 3 && (
          <p className="col-span-2 text-xs text-warning">
            Density is below 1 node per 3 ha, so detection latency for fires between nodes will rise. Reduce the spacing or add rows.
          </p>
        )}
      </dl>
    </div>
  );
}

function Slider({ label, unit, value, min, max, step, onChange }: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm">
      <div className="flex justify-between">
        <span className="text-muted">{label}</span>
        <span className="font-mono">
          {value} {unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[var(--ember)]" />
    </label>
  );
}

function Out({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-panel-2 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg">{value}</dd>
      {sub && <dd className="text-[11px] text-muted">{sub}</dd>}
    </div>
  );
}
