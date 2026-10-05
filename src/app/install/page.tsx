import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Hammer, Plane, ShieldAlert, Smartphone, Wrench } from "lucide-react";
import { DeploymentPlanner } from "@/components/install/deployment-planner";
import { CorridorLayout, InstallChecks } from "@/components/install/diagrams";

export const metadata: Metadata = { title: "Installation" };

const PLANNING = [
  ["Corridor survey", "Import the right-of-way centreline (KML/Shapefile) and mark the 300 m monitored buffer. Flag rock outcrops, water bodies, wetlands and slopes over 35°. Nodes are not placed there."],
  ["Layout", "Use three staggered rows (−100 m, centreline, +100 m) with 200 m along-row spacing, which gives 1 node per 2 ha. Keep 15 m clear of tower footings; nodes inside that ring shift 20 m along their row."],
  ["Weather window", "Soil must be unfrozen with no snow cover. For aerial drops, surface wind must be under 25 km/h and the ceiling above 300 m. Avoid deploying within 48 h of heavy rain, because saturated soil reduces penetration depth."],
  ["Permissions", "Confirm right-of-way access with the utility, notify the land manager and any First Nations whose territory overlaps, and file the flight plan / NOTAM for low-level operations."],
] as const;

const AERIAL = [
  ["Load magazines", "Each cartridge holds 48 nodes, tip-down. Pull the transit pin from each node as it goes in. This arms the IMU wake-on-free-fall but keeps the radio silent."],
  ["Upload drop plan", "Export the waypoint file from the planner to the dispenser controller. It computes release points from ground speed, altitude and the forecast wind drift."],
  ["Fly the line", "Fly at 40–120 m AGL and ≤ 110 km/h ground speed. The dispenser releases one node per waypoint (±8 m CEP). Run one row per pass and keep the sun behind you for spotter visibility."],
  ["Confirm landings", "Each node reports tilt, penetration depth (from the IMU impact profile) and GNSS fix on the next satellite pass, usually within 90 min. Rejects appear in the dashboard as maintenance alerts."],
  ["Back-fill gaps", "A ground crew hand-sets replacements for nodes that landed > 25° off vertical, hit rock, or fell inside an exclusion ring. Plan for 4–6% back-fill."],
] as const;

const GROUND = [
  ["Pick the spot", "Stand within 5 m of the planned point. Choose open forest floor at least 1 m from trunks, off game trails, and with no standing water or overhanging rock."],
  ["Part the litter", "Brush aside loose needles in a 15 cm circle, but leave the duff layer intact. The duff is where root-zone smoldering starts, and the collar needs to seat in it."],
  ["Pilot hole", "Drive the 25 mm pilot bar 35 cm deep (depth mark on the bar). In stony soil, try again within 2 m rather than forcing it."],
  ["Seat the node", "Insert the spike and press, or tap with a rubber mallet on the collar only (never the radome), until the collar sits flush. Check vertical with the bubble on the collar."],
  ["Commission", "Tap a phone to the radome to open the PyroShield field app over NFC. It records GPS, a photo and installer ID, and runs the sensor self-test (≈ 40 s)."],
  ["Restore the surface", "Pull the litter back up to the collar edge, leaving the heat-sink fins and radome exposed. Move on; the first uplink is confirmed in the app within 90 min."],
] as const;

const ACCEPTANCE = [
  "Node shows Online in Operations with a GNSS position within 10 m of plan",
  "Tilt under 10° (hand-set) or 25° (aerial)",
  "All three thermistors read within 3 °C of each other at install time",
  "Supercap above 2.5 V within 24 h (confirms the TEG is coupled)",
  "Detection armed after 42 h, once the node's own baseline is learned",
];

export default function InstallPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="max-w-3xl">
        <div className="eyebrow">Field guide · Rev 1.2</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Installing PyroShield nodes</h1>
        <p className="mt-3 text-muted">
          There are two ways to deploy, and both use the same node. <b className="text-text">Aerial drop</b> covers remote corridor in hours. <b className="text-text">Ground setting</b> is
          for accessible sections, back-fills and replacements. Both end in self-commissioning over satellite, with no gateway infrastructure.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          {[
            ["#planning", "1 · Plan"],
            ["#aerial", "2a · Aerial drop"],
            ["#ground", "2b · Ground set"],
            ["#acceptance", "3 · Accept"],
            ["#maintenance", "4 · Maintain"],
            ["#planner", "Planner"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-line px-3 py-1 text-muted hover:text-text">
              {label}
            </a>
          ))}
        </div>
      </div>

      <Section id="planning" icon={<ShieldAlert size={18} />} title="1 · Site planning">
        <div className="card p-4">
          <CorridorLayout />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PLANNING.map(([t, b]) => (
            <div key={t} className="card p-5">
              <div className="font-medium">{t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="aerial" icon={<Plane size={18} />} title="2a · Aerial drop">
        <Steps items={AERIAL} />
        <Callout>
          Safety: drop runs over energised lines stay at least 30 m lateral from the conductors. The dispenser inhibits release inside the
          conductor-clearance polygon from the drop plan. Never fly drop runs directly along the line.
        </Callout>
      </Section>

      <Section id="ground" icon={<Hammer size={18} />} title="2b · Ground setting">
        <div className="mb-5 flex flex-wrap gap-2 text-xs text-muted">
          {["25 mm pilot bar with depth mark", "Rubber mallet", "Phone with PyroShield field app (NFC)", "Planned-point GPX on handheld GPS", "Spare nodes (transit pins in)"].map((t) => (
            <span key={t} className="rounded-full bg-panel-2 px-3 py-1">
              {t}
            </span>
          ))}
        </div>
        <Steps items={GROUND} />
        <h3 className="mb-3 mt-8 text-sm font-medium">Seating check</h3>
        <InstallChecks />
        <p className="mt-3 text-xs text-muted">
          For the full 3D cross-section with depth markers, open the{" "}
          <Link href="/hardware" className="text-ember underline-offset-2 hover:underline">
            hardware model
          </Link>{" "}
          and turn on Soil section.
        </p>
      </Section>

      <Section id="acceptance" icon={<CheckCircle2 size={18} />} title="3 · Commissioning & acceptance">
        <div className="card p-5">
          <ul className="space-y-2.5 text-sm">
            {ACCEPTANCE.map((a) => (
              <li key={a} className="flex gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-moss" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Smartphone size={14} /> The field app and the{" "}
            <Link href="/dashboard" className="text-ember hover:underline">
              Operations
            </Link>{" "}
            view read the same node registry, so a commissioned node appears on the map immediately.
          </p>
        </div>
      </Section>

      <Section id="maintenance" icon={<Wrench size={18} />} title="4 · Maintenance & end of life">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Missed uplinks", "After 2 missed hours the node is flagged offline. Causes are usually snow load on the radome, burial by slides, or animal damage. Inspect it on the next corridor patrol; no urgent truck roll is needed unless neighbours are also silent."],
            ["Low energy", "Below 2.5 V the node halves its uplink cadence. Shaded north slopes with little air–soil ΔT are the usual cause. If it persists for more than 30 days, relocate the node 10–20 m to a canopy gap."],
            ["Post-fire & decommissioning", "Nodes within a burn scar are replaced (the sensors tolerate 300 °C for 10 min, but the TEG may delaminate). After 10 years the body biodegrades in place, and the < 4 g electronics core is collected during corridor sweeps."],
          ].map(([t, b]) => (
            <div key={t} className="card p-5">
              <div className="font-medium">{t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <section id="planner" className="mt-14 scroll-mt-20">
        <DeploymentPlanner />
      </section>
    </div>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-20">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
        <span className="text-ember">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Steps({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ol className="relative space-y-4 border-l border-line pl-6">
      {items.map(([t, b], i) => (
        <li key={t} className="relative">
          <span className="absolute -left-[37px] grid size-6 place-items-center rounded-full border border-line bg-bg font-mono text-xs text-ember">{i + 1}</span>
          <div className="font-medium">{t}</div>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{b}</p>
        </li>
      ))}
    </ol>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm leading-relaxed">{children}</div>;
}
