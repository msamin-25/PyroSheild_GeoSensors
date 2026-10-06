import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BatteryWarning, Calculator, CheckCircle2, CloudSun, FileCheck2, Flame, Hammer, Map as MapIcon, Plane, Radio, Route, ShieldAlert, Smartphone, Wrench } from "lucide-react";
import { DeploymentPlanner } from "@/components/install/deployment-planner";
import { CorridorLayout, InstallChecks } from "@/components/install/diagrams";
import { Toc } from "@/components/install/toc";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = { title: "Deployment" };

const QUICK: { icon: LucideIcon; title: string; sub: string; href: string }[] = [
  { icon: Plane, title: "Aerial", sub: "≈ 190 nodes / sortie", href: "#aerial" },
  { icon: Hammer, title: "Ground", sub: "≈ 120 nodes / crew-day", href: "#ground" },
  { icon: Calculator, title: "Planner", sub: "Size and price a corridor", href: "#planner" },
];

const TOC = [
  { id: "planning", label: "1 · Site planning" },
  { id: "aerial", label: "2a · Aerial drop" },
  { id: "ground", label: "2b · Ground setting" },
  { id: "acceptance", label: "3 · Acceptance" },
  { id: "maintenance", label: "4 · Maintenance" },
  { id: "planner", label: "Deployment planner" },
];

const PLANNING: [LucideIcon, string, string][] = [
  [Route, "Corridor survey", "Import the right-of-way centreline (KML/Shapefile) and mark the 300 m monitored buffer. Flag rock outcrops, water bodies, wetlands and slopes over 35°. Nodes are not placed there."],
  [MapIcon, "Layout", "Use three staggered rows (−100 m, centreline, +100 m) with 200 m spacing along each row, giving 1 node per 2 ha. Keep 15 m clear of tower footings; nodes inside that ring shift 20 m along their row."],
  [CloudSun, "Weather window", "Soil must be unfrozen with no snow cover. For aerial drops, surface wind must be under 25 km/h and the ceiling above 300 m. Avoid deploying within 48 h of heavy rain."],
  [FileCheck2, "Permissions", "Confirm right-of-way access with the utility, notify the land manager and any First Nations whose territory overlaps, and file the flight plan / NOTAM."],
];

const AERIAL = [
  ["Load magazines", "Each cartridge holds 48 nodes, tip-down. Pull each node's transit pin as you load it. This arms wake-on-free-fall but keeps the radio silent.", "≈ 10 min / magazine"],
  ["Upload drop plan", "Export waypoints from the planner to the dispenser controller. It computes release points from ground speed, altitude and the forecast wind drift.", "KML / CSV"],
  ["Fly the line", "Fly at 40–120 m AGL and ≤ 110 km/h ground speed, one row per pass. The dispenser releases one node per waypoint (±8 m CEP).", "≈ 25 km / sortie"],
  ["Confirm landings", "On the next satellite pass, each node reports tilt, penetration depth and GNSS fix. Rejects appear in Operations as maintenance alerts.", "≤ 90 min"],
  ["Back-fill gaps", "A ground crew hand-sets replacements for nodes that landed > 25° off vertical, hit rock, or fell inside an exclusion ring.", "Plan 4–6%"],
] as const;

const GROUND = [
  ["Pick the spot", "Within 5 m of the planned point, choose open forest floor ≥ 1 m from trunks, off game trails, with no standing water or overhanging rock."],
  ["Part the litter", "Brush loose needles aside in a 15 cm circle, but leave the duff intact. The duff is where smoldering starts, and the collar needs to seat in it."],
  ["Pilot hole", "Drive the 25 mm pilot bar 35 cm deep. In stony soil, try again within 2 m rather than forcing it."],
  ["Seat the node", "Press it in, or tap the collar with a rubber mallet (never the radome), until the collar sits flush. Check vertical with the collar bubble."],
  ["Commission", "Tap a phone to the radome to open the field app over NFC. It records GPS, a photo and installer ID, and runs a 40 s self-test."],
  ["Restore the surface", "Pull litter back to the collar edge, leaving the fins and radome exposed. The first uplink is confirmed in the app within 90 min."],
] as const;

const TOOLS = ["25 mm pilot bar", "Rubber mallet", "Phone with field app (NFC)", "GPX of planned points", "Spare nodes, pins in"];

const ACCEPTANCE = [
  ["Online with position", "GNSS within 10 m of plan, visible in Operations"],
  ["Tilt in tolerance", "< 10° hand-set · < 25° aerial"],
  ["Thermistors agree", "All three within 3 °C at install time"],
  ["TEG coupled", "Supercap above 2.5 V within 24 h"],
  ["Detection armed", "After 42 h, once the node's own baseline is learned"],
];

const MAINTENANCE: [LucideIcon, string, string][] = [
  [Radio, "Missed uplinks", "Flagged after 2 silent hours. Usually snow load, burial by slides, or animal damage. Inspect on the next patrol unless neighbours are also silent."],
  [BatteryWarning, "Low energy", "Below 2.5 V the node halves its uplink cadence. If it persists for more than 30 days, move it 10–20 m to a canopy gap with better air–soil ΔT."],
  [Flame, "Post-fire & end of life", "Replace nodes inside a burn scar. After 10 years the body biodegrades in place, and the < 4 g core is collected on corridor sweeps."],
];

export default function InstallPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-14 pt-14 sm:pt-20">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Field guide</Badge>
            <Badge>Rev 1.2</Badge>
          </div>
          <h1 className="text-display mt-5 max-w-3xl text-5xl sm:text-6xl">Deploying PyroShield.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-2">
            One node, two ways in. <span className="text-fg">Aerial drop</span> seeds remote corridor in hours, and <span className="text-fg">ground setting</span>{" "}
            handles accessible sections, back-fills and replacements. Both self-commission over satellite, with no gateways to build.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {QUICK.map(({ icon: Icon, title, sub, href }) => (
              <a key={title} href={href} className="surface group flex items-center gap-4 p-4 transition-colors hover:border-border-strong">
                <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-brand-soft text-brand">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-fg-3">{sub}</span>
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[200px_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc items={TOC} />
          </div>
        </aside>

        <div className="min-w-0 space-y-24">
          <Section id="planning" icon={ShieldAlert} step="01" title="Site planning" lead="Lay out the corridor before anything leaves the hangar.">
            <div className="surface p-4 sm:p-6">
              <CorridorLayout />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {PLANNING.map(([Icon, t, b]) => (
                <div key={t} className="surface p-6">
                  <Icon size={18} className="text-brand" />
                  <div className="mt-3 font-medium">{t}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{b}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="aerial" icon={Plane} step="02a" title="Aerial drop" lead="Seed remote corridor at about 25 km per sortie.">
            <ol className="space-y-3">
              {AERIAL.map(([t, b, meta], i) => (
                <li key={t} className="surface grid gap-3 p-5 sm:grid-cols-[40px_1fr_auto] sm:items-start sm:gap-5">
                  <span className="grid size-8 place-items-center rounded-full border border-brand/40 font-mono text-xs text-brand">{i + 1}</span>
                  <div>
                    <div className="font-medium">{t}</div>
                    <p className="mt-1 text-sm leading-relaxed text-fg-2">{b}</p>
                  </div>
                  <span className="justify-self-start rounded-full bg-surface-3 px-2.5 py-1 font-mono text-[11px] text-fg-2 sm:justify-self-end">{meta}</span>
                </li>
              ))}
            </ol>
            <Callout tone="warning" title="Line safety">
              Drop runs over energised lines stay at least 30 m lateral from the conductors. The dispenser inhibits release inside the conductor-clearance
              polygon from the drop plan. Never fly drop runs directly along the line.
            </Callout>
          </Section>

          <Section id="ground" icon={Hammer} step="02b" title="Ground setting" lead="For accessible sections, back-fills and replacements.">
            <div className="surface mb-4 p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-fg-3">Kit list</div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg-2">
                    <CheckCircle2 size={12} className="text-brand" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {GROUND.map(([t, b], i) => (
                <li key={t} className="surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-surface-3 font-mono text-[11px] text-fg-2">{i + 1}</span>
                    <span className="font-medium">{t}</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-2">{b}</p>
                </li>
              ))}
            </ol>
            <h3 className="mb-4 mt-10 text-sm font-medium">Seating check</h3>
            <InstallChecks />
            <p className="mt-4 text-sm text-fg-3">
              For a 3D cross-section with depth markers, open the{" "}
              <Link href="/hardware" className="text-brand underline-offset-4 hover:underline">
                hardware model
              </Link>{" "}
              with Soil turned on.
            </p>
          </Section>

          <Section id="acceptance" icon={CheckCircle2} step="03" title="Commissioning & acceptance" lead="A node counts as live only when all five checks pass.">
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
              {ACCEPTANCE.map(([t, d]) => (
                <div key={t} className="flex items-start gap-4 border-b border-border bg-surface px-5 py-4 last:border-b-0">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" />
                  <div className="grid flex-1 gap-1 sm:grid-cols-[200px_1fr] sm:gap-6">
                    <span className="text-sm font-medium">{t}</span>
                    <span className="text-sm text-fg-2">{d}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-fg-3">
              <Smartphone size={15} /> The field app and{" "}
              <Link href="/dashboard" className="text-brand hover:underline">
                Operations
              </Link>{" "}
              share one node registry, so commissioned nodes appear on the map immediately.
            </p>
          </Section>

          <Section id="maintenance" icon={Wrench} step="04" title="Maintenance & end of life" lead="Designed for no routine visits. These are the exceptions.">
            <div className="grid gap-4 md:grid-cols-3">
              {MAINTENANCE.map(([Icon, t, b]) => (
                <div key={t} className="surface p-6">
                  <Icon size={18} className="text-fg-2" />
                  <div className="mt-3 font-medium">{t}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{b}</p>
                </div>
              ))}
            </div>
          </Section>

          <section id="planner" className="scroll-mt-24">
            <DeploymentPlanner />
          </section>
        </div>
      </Container>

      <SiteFooter />
    </>
  );
}

function Section({ id, icon: Icon, step, title, lead, children }: { id: string; icon: LucideIcon; step: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8 flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border bg-surface-2 text-brand">
          <Icon size={20} />
        </span>
        <div>
          <div className="font-mono text-xs text-fg-3">{step}</div>
          <h2 className="text-title mt-0.5 text-2xl sm:text-3xl">{title}</h2>
          <p className="mt-1.5 text-fg-2">{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Callout({ tone, title, children }: { tone: "warning"; title: string; children: React.ReactNode }) {
  return (
    <div className={`mt-5 flex gap-3 rounded-[var(--radius-lg)] border p-5 text-sm leading-relaxed ${tone === "warning" ? "border-warning/30 bg-warning/[0.07]" : ""}`}>
      <ShieldAlert size={18} className="mt-0.5 shrink-0 text-warning" />
      <div>
        <div className="font-medium text-warning">{title}</div>
        <p className="mt-1 text-fg-2">{children}</p>
      </div>
    </div>
  );
}
