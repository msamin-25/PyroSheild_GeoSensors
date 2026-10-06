import { ArrowRight, BatteryCharging, CheckCircle2, Leaf, Plane, Radio, Satellite, ShieldCheck, Thermometer, Wind, Zap } from "lucide-react";
import { DetectionTimeline } from "@/components/marketing/detection-timeline";
import { HeroScene } from "@/components/marketing/hero-scene";
import { SignatureCard } from "@/components/marketing/signature-card";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";

const TRUST = [
  { icon: BatteryCharging, label: "Battery-free" },
  { icon: Leaf, label: "Biodegrades after 10 years" },
  { icon: Satellite, label: "Direct-to-satellite" },
];

const STATS = [
  ["$100B+", "Annual global wildfire damage"],
  ["Up to 20%", "Of global GHG emissions in severe fire years"],
  ["$13B", "One utility's liability from a single ignition"],
  ["$25", "Per hectare per year, everything included"],
];

const STEPS = [
  {
    icon: Plane,
    title: "Seeded from the air",
    body: "Helicopters release nodes along the corridor. Samara vanes spin each one upright and it drives itself 30 cm into the forest floor.",
    meta: "≈ 190 nodes per sortie",
  },
  {
    icon: Thermometer,
    title: "Listens at the roots",
    body: "Thermistors at 5, 15 and 30 cm plus CO and VOC sensors sample every 15 minutes, powered only by the air–soil temperature difference.",
    meta: "No battery · 10-year life",
  },
  {
    icon: Satellite,
    title: "Alerts before smoke",
    body: "When heat and combustion chemistry agree, the node uplinks straight to a low-orbit satellite and the dispatcher sees it in the console.",
    meta: "No gateways or towers",
  },
];

const CHANNELS = [
  { icon: Thermometer, title: "Root-zone heat & inversion", body: "Soil at 30 cm normally barely moves. If it warms faster than the surface, the heat is coming from below." },
  { icon: Wind, title: "CO rise & CO:VOC ratio", body: "Smoldering gas is CO-rich and rises fast. Decomposition gas is VOC-rich and slow." },
  { icon: Radio, title: "Neighbour corroboration", body: "Gas drifting to nearby nodes confirms the source and pinpoints where it is." },
  { icon: Leaf, title: "Biogenic gate", body: "Gas with no heat in wet soil is classed as decomposition, so the alert is suppressed." },
];

const COMPARE = [
  { name: "Optical satellites & drones", when: "After smoke clears the canopy", limit: "Cloud cover, dense canopy, revisit gaps", us: false },
  { name: "Lookout towers & IR cameras", when: "Visible smoke or flame", limit: "Line-of-sight; costly to build in remote terrain", us: false },
  { name: "PyroShield Geo-Sensors", when: "Hours earlier, at the source", limit: "Soil-level heat + gas, no line-of-sight needed", us: true },
];

const ASSUMPTIONS = [
  ["Nodes survive extreme weather", "Freeze–thaw, snow-load and 300 °C burn-over chamber tests, then a 200-node pilot over one BC winter."],
  ["TEG harvest powers satellite uplinks", "Year-round ΔT logging at 12 corridor sites; firmware adapts uplink cadence to stored energy."],
  ["False positives < 1 per 100,000 node-days", "Biogenic gate plus neighbour corroboration, validated against wet-litter decomposition plots."],
  ["Utilities trust automated alerts", "Explainable per-factor scores and a shadow-mode pilot alongside existing patrol dispatch."],
  ["Casing biodegrades without microplastics", "ISO 17556 soil-burial testing of the PLA/flax/mycelium body and the Mg/Zn alloys."],
];

export default function Home() {
  return (
    <>
      {/* ─────────── Hero ─────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="hairline-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 50% at 78% 40%, rgba(255,107,53,0.10), transparent 70%), radial-gradient(60% 50% at 20% 0%, rgba(126,224,143,0.10), transparent 70%)" }}
        />
        <Container className="relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="anim-fade-up">
            <Badge tone="brand" dot>
              Pre-smoke wildfire detection
            </Badge>
            <h1 className="text-display mt-6 text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">
              Catch wildfires underground, <span className="bg-gradient-to-r from-fire to-[#ffb07a] bg-clip-text text-transparent">hours before</span> they
              reach the canopy.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-2">
              PyroShield Geo-Sensors are battery-free, biodegradable probes seeded from the air along high-risk forest. They catch smoldering at the root zone
              from its heat and combustion gases, and report it over satellite before any smoke is visible.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" size="lg">
                Explore the live console <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/hardware" variant="secondary" size="lg">
                See the hardware in 3D
              </ButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-fg-3">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon size={15} className="text-brand" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="anim-fade-up mx-auto w-full max-w-[560px] [animation-delay:120ms]">
            <HeroScene />
          </div>
        </Container>
      </section>

      {/* ─────────── Stats ─────────── */}
      <section className="border-b border-border bg-surface/40">
        <Container>
          <dl className="grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
            {STATS.map(([v, l]) => (
              <div key={l} className="px-1 py-8 md:px-8 md:first:pl-0">
                <dt className="text-title font-mono text-3xl text-fg sm:text-4xl">{v}</dt>
                <dd className="mt-2 text-sm text-fg-3">{l}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ─────────── The window ─────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="The detection gap"
            title="Satellites see smoke. We see the fire that comes before it."
            description="Optical systems can only react once smoke clears the canopy, and by then the fire is often uncontrollable. Root-zone smoldering can burn for hours first. That window is where PyroShield works."
          />
          <div className="mt-14">
            <DetectionTimeline />
          </div>
        </Container>
      </section>

      {/* ─────────── How it works ─────────── */}
      <section className="border-y border-border bg-surface/40 py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow="How it works" title="Seed it, forget it, get the call." />
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body, meta }, i) => (
              <li key={title} className="surface group relative flex flex-col p-7 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-[var(--radius-md)] border border-border bg-surface-2 text-brand">
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-xs text-fg-3">0{i + 1}</span>
                </div>
                <h3 className="text-title mt-6 text-lg">{title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-fg-2">{body}</p>
                <div className="mt-6 border-t border-border pt-4 text-xs text-fg-3">{meta}</div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─────────── Detection ─────────── */}
      <section id="detection" className="scroll-mt-20 py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Detection model"
              title="A combustion signature, not a single threshold."
              description="Decaying leaves also release CO and VOCs. Every node scores itself against its own learned baseline across independent channels, and only alerts when heat and combustion chemistry agree."
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {CHANNELS.map(({ icon: Icon, title, body }) => (
                <li key={title}>
                  <Icon size={18} className="text-brand" />
                  <div className="mt-3 text-[15px] font-medium">{title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-fg-3">{body}</p>
                </li>
              ))}
            </ul>
          </div>
          <SignatureCard />
        </Container>
      </section>

      {/* ─────────── Comparison ─────────── */}
      <section className="border-y border-border bg-surface/40 py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow="Alternatives" title="Every other system needs line‑of‑sight." align="center" />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {COMPARE.map((c) => (
              <div
                key={c.name}
                className={`relative rounded-[var(--radius-lg)] border p-7 ${c.us ? "border-brand/40 bg-gradient-to-b from-brand/[0.09] to-transparent shadow-[0_0_0_1px_rgba(126,224,143,0.15),0_20px_60px_-20px_rgba(126,224,143,0.25)]" : "border-border bg-surface"}`}
              >
                {c.us && (
                  <Badge tone="brand" className="absolute -top-3 left-7">
                    PyroShield
                  </Badge>
                )}
                <div className={`text-[15px] font-medium ${c.us ? "text-fg" : "text-fg-2"}`}>{c.name}</div>
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-fg-3">Detects at</dt>
                    <dd className={`mt-1 ${c.us ? "font-medium text-brand" : "text-fg-2"}`}>{c.when}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-fg-3">Constraint</dt>
                    <dd className="mt-1 text-fg-2">{c.limit}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────── Business ─────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Go-to-market"
            title="Start where one spark costs billions."
            description="We begin with electric transmission corridors through pine forest in British Columbia, California and Oregon, where utility-caused ignitions carry the highest liability."
          />
          <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
            <div className="surface p-7">
              <div className="eyebrow">Beachhead</div>
              <p className="mt-4 text-[15px] leading-relaxed text-fg-2">
                Private forestry managers and utility grid operators running high-risk timberland in <span className="text-fg">BC, California and Oregon</span>.
              </p>
            </div>
            <div className="surface p-7">
              <div className="eyebrow">Wedge</div>
              <p className="mt-4 text-[15px] leading-relaxed text-fg-2">
                Perimeter monitoring along <span className="text-fg">electrical transmission corridors</span>, to prevent ignitions where liability is highest.
              </p>
            </div>
            <div className="surface-raised relative overflow-hidden p-7">
              <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-brand/10 blur-3xl" />
              <div className="eyebrow">Pricing</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-display font-mono text-5xl">$25</span>
                <span className="text-fg-3">/ hectare / year</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-fg-2">
                {["Hardware, aerial deployment and replacements", "24/7 monitoring console and alert routing", "Paid by utilities and insurance syndicates"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-fg-3">
                A $500k annual contract covers 20,000 ha, a rounding error next to a single $13B ignition liability.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────── Assumptions ─────────── */}
      <section id="assumptions" className="scroll-mt-20 border-t border-border bg-surface/40 py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Risk register"
            title="The five assumptions that could kill this, and how we test each one."
          />
          <div className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-border">
            {ASSUMPTIONS.map(([a, t], i) => (
              <div key={a} className="grid gap-2 border-b border-border bg-surface px-6 py-5 last:border-b-0 md:grid-cols-[56px_1fr_1.4fr_auto] md:items-center md:gap-6">
                <span className="font-mono text-sm text-fg-3">0{i + 1}</span>
                <span className="text-[15px] font-medium">{a}</span>
                <span className="text-sm leading-relaxed text-fg-2">{t}</span>
                <Badge tone="watch" className="justify-self-start">
                  Validation planned
                </Badge>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border-strong bg-gradient-to-br from-surface-3 via-surface-2 to-surface px-8 py-14 sm:px-14">
            <div className="hairline-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <ShieldCheck size={28} className="text-brand" />
                <h2 className="text-title mt-5 text-3xl sm:text-4xl">See a smoldering fire get caught in real time.</h2>
                <p className="mt-4 max-w-lg text-fg-2">
                  The operations console runs a live digital twin of 1,185 nodes on the Merritt–Kamloops corridor, with a simulated fire smoldering under it right now.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <ButtonLink href="/dashboard" size="lg">
                  Open the console <ArrowRight size={16} />
                </ButtonLink>
                <ButtonLink href="/install#planner" variant="secondary" size="lg">
                  <Zap size={16} /> Size a deployment
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
