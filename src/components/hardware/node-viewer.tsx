"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Layers, Move3d, RotateCw, Scissors, Tags } from "lucide-react";
import { PARTS } from "@/lib/hardware";
import { Segmented } from "../ui/segmented";
import type { SceneOptions } from "./node-scene";

const NodeScene = dynamic(() => import("./node-scene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <div className="flex items-center gap-2 text-sm text-fg-3">
        <Move3d size={16} className="animate-pulse" /> Loading 3D model…
      </div>
    </div>
  ),
});

const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Above ground", ids: ["radome", "antenna", "fins", "heatsink"] },
  { title: "Power & compute", ids: ["electronics", "supercap", "teg"] },
  { title: "Below ground", ids: ["collar", "rod", "gas", "thermistors", "spike", "tip"] },
];

export function NodeViewer() {
  const [opts, setOpts] = useState<SceneOptions>({ explode: 0, cutaway: false, soil: true, labels: true, autoRotate: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = selected ?? hovered;
  const part = PARTS.find((p) => p.id === focus);
  const idx = PARTS.findIndex((p) => p.id === selected);

  const toggle = (k: "cutaway" | "soil" | "labels" | "autoRotate") => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const step = (d: number) => setSelected(PARTS[(Math.max(idx, 0) + d + PARTS.length) % PARTS.length].id);
  const exploded = opts.explode > 0.5;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="surface relative h-[72vh] min-h-[520px] overflow-hidden !rounded-[var(--radius-xl)]">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-60" />
        <NodeScene {...opts} selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />

        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-3">
          <div className="rounded-full border border-border bg-overlay px-3 py-1.5 text-[11px] text-fg-3 backdrop-blur">
            Drag to orbit · scroll to zoom · click any part
          </div>
          <div className="pointer-events-auto rounded-[var(--radius-md)] bg-overlay shadow-md backdrop-blur-md">
            <Segmented
              label="View"
              value={exploded ? "exploded" : "assembled"}
              onChange={(v) => setOpts((o) => ({ ...o, explode: v === "exploded" ? 1 : 0 }))}
              options={[
                { value: "assembled", label: "Assembled" },
                { value: "exploded", label: "Exploded" },
              ]}
            />
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-[640px] flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-border-strong bg-overlay p-2 shadow-lg backdrop-blur-xl">
          <label className="flex min-w-[180px] flex-1 items-center gap-3 px-2">
            <span className="whitespace-nowrap text-xs text-fg-3">Explode</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opts.explode}
              onChange={(e) => setOpts((o) => ({ ...o, explode: Number(e.target.value) }))}
              className="range w-full cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--brand) ${opts.explode * 100}%, var(--surface-3) ${opts.explode * 100}%)` }}
              aria-label="Explode amount"
            />
          </label>
          <div className="flex gap-1">
            <Toggle on={opts.cutaway} onClick={() => toggle("cutaway")} icon={<Scissors size={14} />} label="Cutaway" />
            <Toggle on={opts.soil && opts.explode < 0.05} disabled={opts.explode >= 0.05} onClick={() => toggle("soil")} icon={<Layers size={14} />} label="Soil" />
            <Toggle on={opts.labels} onClick={() => toggle("labels")} icon={<Tags size={14} />} label="Labels" />
            <Toggle on={opts.autoRotate} onClick={() => toggle("autoRotate")} icon={<RotateCw size={14} />} label="Rotate" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:max-h-[72vh] lg:min-h-[520px]">
        <div className="surface-raised p-6">
          {part ? (
            <div key={part.id} className="anim-fade-up">
              <div className="flex items-center justify-between">
                <span className="grid size-7 place-items-center rounded-full bg-brand font-mono text-xs font-semibold text-on-brand">{part.n}</span>
                {selected && (
                  <div className="flex gap-1">
                    <button onClick={() => step(-1)} className="grid size-7 place-items-center rounded-md text-fg-3 hover:bg-surface-3 hover:text-fg" aria-label="Previous part">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => step(1)} className="grid size-7 place-items-center rounded-md text-fg-3 hover:bg-surface-3 hover:text-fg" aria-label="Next part">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-title mt-4 text-xl">{part.name}</h3>
              <div className="mt-1.5 text-xs text-brand">{part.material}</div>
              <p className="mt-4 text-sm leading-relaxed text-fg-2">{part.role}</p>
              <ul className="mt-5 space-y-1.5 border-t border-border pt-4">
                {part.spec.split(" · ").map((s) => (
                  <li key={s} className="flex items-start gap-2 font-mono text-xs text-fg-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-fg-3" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <div className="eyebrow">Part inspector</div>
              <h3 className="text-title mt-3 text-xl">13 components, 340 grams</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-2">
                Select a part in the model or the list below. Switch to <span className="text-fg">Exploded</span> to see how it goes together, and turn on{" "}
                <span className="text-fg">Cutaway</span> to look inside the core and spike.
              </p>
            </div>
          )}
        </div>

        <div className="surface scrollbar-thin min-h-0 flex-1 overflow-y-auto py-2">
          {GROUPS.map((g) => (
            <div key={g.title} className="py-1">
              <div className="px-5 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-fg-3">{g.title}</div>
              {g.ids.map((id) => {
                const p = PARTS.find((x) => x.id === id)!;
                const on = selected === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelected(on ? null : id)}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 px-5 py-2 text-left text-sm transition-colors ${on ? "bg-brand-soft text-fg" : "text-fg-2 hover:bg-surface-2 hover:text-fg"}`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${on ? "border-brand bg-brand text-on-brand" : "border-border-strong text-fg-3"}`}>{p.n}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                    {on && <ChevronRight size={14} className="text-brand" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
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
      title={label}
      className={`flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium transition-colors disabled:opacity-35 ${
        on ? "bg-brand-soft text-brand" : "text-fg-3 hover:bg-surface-3 hover:text-fg"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
