import type { Metadata } from "next";
import Link from "next/link";
import { NodeViewer } from "@/components/hardware/node-viewer";
import { HARVEST_UW, POWER_BUDGET, SPECS } from "@/lib/hardware";

export const metadata: Metadata = { title: "Hardware" };

const LIFECYCLE = [
  { t: "Day 0", title: "Aerial drop", body: "The node is released at 40–120 m AGL. The samara vanes spin it upright and it drives tip-first into the duff layer." },
  { t: "Day 0 + 10 min", title: "Self-commissioning", body: "The IMU checks tilt (< 25°), the TEG cold-starts the PMIC, and the first satellite pass registers the node's GNSS position." },
  { t: "Years 1–10", title: "Monitoring", body: "Samples every 15 min, uplinks 4×/day, and switches to 1-min sampling with immediate uplink when the signature model trips." },
  { t: "Years 10–14", title: "Biodegradation", body: "The PLA/flax body hydrolyses and the Mg/Zn alloys corrode to soil-native ions. Electronics are < 4 g and recovered on corridor sweeps." },
];

export default function HardwarePage() {
  const load = POWER_BUDGET.reduce((s, p) => s + p.uW, 0);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="max-w-3xl">
        <div className="eyebrow">Hardware · Reference design G1</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">The Geo-Spike sensor node</h1>
        <p className="mt-3 text-muted">
          A 340 g battery-free probe that self-implants 30 cm into forest soil. It measures the root-zone temperature profile and combustion gases, and it
          runs on the temperature difference between air and soil.
        </p>
      </div>

      <div className="mt-8">
        <NodeViewer />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Specifications</h2>
          <dl className="mt-4 divide-y divide-line text-sm">
            {SPECS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-4 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Energy budget</h2>
          <p className="mt-1 text-sm text-muted">
            Average draw against thermoelectric harvest at a 4 K air–soil gradient, typical for spring and fall in the BC Interior.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            {POWER_BUDGET.map((p) => (
              <div key={p.item}>
                <div className="flex justify-between">
                  <span className="text-muted">{p.item}</span>
                  <span className="font-mono">{p.uW} µW</span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-panel-2">
                  <div className="h-1.5 rounded bg-ember" style={{ width: `${(p.uW / HARVEST_UW) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 font-medium">
              <span>Total load vs harvest</span>
              <span className="font-mono">
                {load} / <span className="text-moss">{HARVEST_UW} µW</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Margin is {Math.round((1 - load / HARVEST_UW) * 100)}%. When the supercap falls below 2.5 V, the firmware drops to 2 uplinks per day but
              keeps sampling, and alert uplinks always take priority. Satellite transmission dominates the budget, which is why Killer Assumption #2
              comes first in the field-trial plan.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Lifecycle</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-4">
          {LIFECYCLE.map((s, i) => (
            <li key={s.title} className="card p-5">
              <div className="font-mono text-xs text-ember">
                {String(i + 1).padStart(2, "0")} · {s.t}
              </div>
              <div className="mt-2 font-medium">{s.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/install" className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-black hover:brightness-110">
          Installation guide →
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-panel">
          See live network
        </Link>
      </div>
    </div>
  );
}
