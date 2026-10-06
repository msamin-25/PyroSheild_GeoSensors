import type { Metadata } from "next";
import { ArrowRight, BatteryCharging, Clock, Ruler, Weight } from "lucide-react";
import { NodeViewer } from "@/components/hardware/node-viewer";
import { SiteFooter } from "@/components/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import { HARVEST_UW, POWER_BUDGET, SPECS } from "@/lib/hardware";

export const metadata: Metadata = { title: "Hardware" };

const KEY = [
  { icon: Weight, value: "340 g", label: "Mass" },
  { icon: Ruler, value: "510 mm", label: "360 mm below grade" },
  { icon: Clock, value: "10 yr", label: "Service life" },
  { icon: BatteryCharging, value: "0", label: "Batteries" },
];

const LIFECYCLE = [
  { t: "Day 0", title: "Aerial drop", body: "Released at 40–120 m AGL, the node spins upright on its samara vanes and drives tip-first into the duff." },
  { t: "+10 min", title: "Self-commissioning", body: "The IMU checks tilt, the TEG cold-starts the electronics, and the first satellite pass registers its GNSS position." },
  { t: "Years 1–10", title: "Monitoring", body: "Samples every 15 min and uplinks 4× a day. In alert mode it samples every minute and uplinks immediately." },
  { t: "Years 10–14", title: "Biodegradation", body: "The body hydrolyses and the Mg/Zn alloys corrode to soil-native ions. The < 4 g core is collected on corridor sweeps." },
];

const MATERIALS = [
  { name: "PLA · flax · mycelium", where: "Spike body, vanes, collar", fate: "Hydrolyses to CO₂, water and biomass", years: "10–14 yr" },
  { name: "WE43 magnesium alloy", where: "Air-side heat sink", fate: "Corrodes to Mg²⁺, a common soil nutrient", years: "8–12 yr" },
  { name: "Zinc–iron alloy", where: "Thermal rod, penetrator tip", fate: "Corrodes to Zn/Fe oxides", years: "12–20 yr" },
  { name: "Cellulose PCB", where: "Electronics core (< 4 g)", fate: "Recovered on sweeps; substrate is compostable", years: "Recovered" },
];

const BUDGET_COLORS = ["#4f8a5e", "#6cb8f0", "#b89cf0", "#e9c46a", "#ff8c42"];

export default function HardwarePage() {
  const load = POWER_BUDGET.reduce((s, p) => s + p.uW, 0);
  return (
    <>
      <section className="border-b border-border">
        <Container className="grid gap-10 pb-10 pt-14 sm:pt-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="eyebrow">Hardware · Reference design G1</div>
            <h1 className="text-display mt-4 text-5xl sm:text-6xl">The Geo-Spike.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-2">
              A battery-free probe that plants itself 30 cm into the forest floor, reads the root-zone heat profile and combustion gases, and runs on
              the temperature difference between air and soil.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border">
            {KEY.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-surface px-5 py-4">
                <Icon size={15} className="text-brand" />
                <dd className="text-title mt-2 font-mono text-2xl">{value}</dd>
                <dt className="mt-0.5 text-xs text-fg-3">{label}</dt>
              </div>
            ))}
          </dl>
        </Container>
        <Container className="pb-16">
          <NodeViewer />
        </Container>
      </section>

      <section className="py-24">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="surface p-7 sm:p-8">
            <h2 className="text-title text-xl">Specifications</h2>
            <dl className="mt-6 divide-y divide-border">
              {SPECS.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <dt className="text-sm text-fg-3">{k}</dt>
                  <dd className="text-sm text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface flex flex-col p-7 sm:p-8">
            <h2 className="text-title text-xl">Energy budget</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-3">
              Average draw against thermoelectric harvest at a 4 K air–soil gradient, typical for spring and fall in the BC Interior.
            </p>

            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-fg-2">Load</span>
                <span className="font-mono text-sm">
                  {load} <span className="text-fg-3">/ {HARVEST_UW} µW harvested</span>
                </span>
              </div>
              <div className="relative mt-3 flex h-3 overflow-hidden rounded-full bg-surface-3">
                {POWER_BUDGET.map((p, i) => (
                  <span key={p.item} title={`${p.item}: ${p.uW} µW`} style={{ width: `${(p.uW / HARVEST_UW) * 100}%`, background: BUDGET_COLORS[i] }} className="border-r border-bg/60 last:border-r-0" />
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <span className="text-xs text-brand">{Math.round((1 - load / HARVEST_UW) * 100)}% margin</span>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5">
              {POWER_BUDGET.map((p, i) => (
                <li key={p.item} className="flex items-center gap-3 text-sm">
                  <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: BUDGET_COLORS[i] }} />
                  <span className="flex-1 text-fg-2">{p.item}</span>
                  <span className="font-mono text-xs text-fg">{p.uW} µW</span>
                </li>
              ))}
            </ul>

            <p className="mt-auto border-t border-border pt-5 text-xs leading-relaxed text-fg-3">
              Satellite transmission dominates the budget. Below 2.5 V the firmware drops to 2 uplinks a day but keeps sampling, and alert uplinks always
              take priority. That is why Killer Assumption #2 comes first in field trials.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-surface/40 py-24">
        <Container>
          <SectionHeading eyebrow="Lifecycle" title="From drop to dissolve." />
          <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
            <div className="absolute left-0 right-0 top-[11px] hidden h-px bg-gradient-to-r from-brand via-brand/40 to-border md:block" />
            {LIFECYCLE.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 grid size-6 place-items-center rounded-full border border-brand/50 bg-bg font-mono text-[10px] text-brand">{i + 1}</span>
                <div className="mt-5 font-mono text-xs text-fg-3">{s.t}</div>
                <div className="mt-1 text-[15px] font-medium">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-fg-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Materials"
            title="Designed to disappear."
            description="Every structural material was chosen to break down into things already in forest soil. Only the 4-gram electronics core is recovered."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MATERIALS.map((m) => (
              <div key={m.name} className="surface flex flex-col p-6">
                <div className="text-[15px] font-medium">{m.name}</div>
                <div className="mt-1 text-xs text-fg-3">{m.where}</div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-fg-2">{m.fate}</p>
                <div className="mt-5 flex justify-between border-t border-border pt-3 text-xs">
                  <span className="text-fg-3">{m.years === "Recovered" ? "End of life" : "Design target"}</span>
                  <span className="font-mono text-brand">{m.years}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius-xl)] border border-border-strong bg-gradient-to-r from-surface-3 to-surface px-8 py-8">
            <div>
              <div className="text-title text-xl">Ready to put it in the ground?</div>
              <div className="mt-1 text-sm text-fg-3">Plan a corridor, see the drop procedure and the acceptance checklist.</div>
            </div>
            <ButtonLink href="/install">
              Deployment guide <ArrowRight size={16} />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
