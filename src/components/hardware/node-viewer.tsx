"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Layers, MousePointerClick, RotateCw, Scissors, Tags } from "lucide-react";
import { PARTS } from "@/lib/hardware";
import type { SceneOptions } from "./node-scene";

const NodeScene = dynamic(() => import("./node-scene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Loading 3D model…</div>,
});

export function NodeViewer() {
  const [opts, setOpts] = useState<SceneOptions>({ explode: 0, cutaway: false, soil: true, labels: true, autoRotate: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const part = PARTS.find((p) => p.id === (selected ?? hovered));

  const toggle = (k: "cutaway" | "soil" | "labels" | "autoRotate") => setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="card relative h-[70vh] min-h-[480px] overflow-hidden">
        <NodeScene {...opts} selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />

        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg/85 p-2 text-xs backdrop-blur">
          <label className="flex min-w-48 flex-1 items-center gap-2 px-1">
            <span className="whitespace-nowrap text-muted">Exploded view</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opts.explode}
              onChange={(e) => setOpts((o) => ({ ...o, explode: Number(e.target.value) }))}
              className="w-full accent-[var(--ember)]"
            />
          </label>
          <Toggle on={opts.cutaway} onClick={() => toggle("cutaway")} icon={<Scissors size={13} />} label="Cutaway" />
          <Toggle
            on={opts.soil && opts.explode < 0.05}
            disabled={opts.explode >= 0.05}
            onClick={() => toggle("soil")}
            icon={<Layers size={13} />}
            label="Soil section"
          />
          <Toggle on={opts.labels} onClick={() => toggle("labels")} icon={<Tags size={13} />} label="Labels" />
          <Toggle on={opts.autoRotate} onClick={() => toggle("autoRotate")} icon={<RotateCw size={13} />} label="Rotate" />
        </div>
        <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-1.5 text-xs text-muted">
          <MousePointerClick size={13} /> Drag to orbit · scroll to zoom · click a part
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="card min-h-52 p-5">
          {part ? (
            <>
              <div className="eyebrow">Part {part.n}</div>
              <h3 className="mt-1 text-lg font-semibold">{part.name}</h3>
              <p className="mt-0.5 text-xs text-muted">{part.material}</p>
              <p className="mt-3 text-sm leading-relaxed">{part.role}</p>
              <p className="mt-3 rounded-lg bg-panel-2 px-3 py-2 font-mono text-xs text-muted">{part.spec}</p>
            </>
          ) : (
            <>
              <div className="eyebrow">PyroShield G1 Geo-Spike</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Hover or click any component to see what it does. Drag the slider for the exploded view, and turn on <b className="text-text">Cutaway</b> to
                see the electronics core and the thermal rod inside the spike.
              </p>
            </>
          )}
        </div>

        <ol className="card divide-y divide-line overflow-hidden text-sm">
          {PARTS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelected(selected === p.id ? null : p.id)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                  selected === p.id ? "bg-ember/10 text-text" : "text-muted hover:bg-panel-2 hover:text-text"
                }`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${selected === p.id ? "border-ember text-ember" : "border-line"}`}>
                  {p.n}
                </span>
                {p.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, icon, label, disabled }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors disabled:opacity-40 ${
        on ? "border-ember/50 bg-ember/10 text-text" : "border-line text-muted hover:text-text"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
