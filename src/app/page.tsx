import Link from "next/link";
import { Activity, Leaf, Plane, Satellite, ShieldCheck, Thermometer, Wind, Zap } from "lucide-react";

const FLOW = [
  { icon: <Plane size={18} />, title: "Aerial drop", body: "Self-implanting nodes seeded along high-risk corridors in hours" },
  { icon: <Thermometer size={18} />, title: "Subterranean sensing", body: "Root-zone heat profile and CO/VOC soil gases, every 15 min" },
  { icon: <Satellite size={18} />, title: "Satellite alert", body: "Direct-to-LEO uplink before any smoke clears the canopy" },
  { icon: <ShieldCheck size={18} />, title: "Crew dispatched", body: "Smoldering is put out while it's still a shovel job" },
];

const STATS = [
  ["$100B+", "annual global wildfire damage"],
  ["≤ 20%", "of global GHG emissions in severe fire years"],
  ["$13B", "one utility's liability from a single ignition"],
  ["$25", "per hectare per year, all-inclusive"],
];

const COMPARE = [
  ["Optical satellites / drones", "After smoke clears the canopy", "Cloud cover, dense canopy, revisit gaps"],
  ["Lookout towers & IR cameras", "Visible smoke or flame", "Line-of-sight; costly to build in remote terrain"],
  ["PyroShield Geo-Sensors", "Hours earlier, at the source", "Soil-level heat + gas, no line-of-sight needed"],
];

const ASSUMPTIONS = [
  ["Nodes survive extreme weather", "Freeze–thaw, snow-load and 300 °C burn-over chamber tests; 200-node pilot over one BC winter"],
  ["TEG harvest powers satellite uplinks", "Year-round ΔT logging at 12 corridor sites; firmware adapts uplink cadence to stored energy"],
  ["False positives < 1 per 100,000 node-days", "Biogenic gate plus neighbour corroboration; validated against wet-litter decomposition plots"],
  ["Utilities trust automated alerts", "Explainable per-factor scores; shadow-mode pilot alongside existing patrol dispatch"],
  ["Casing biodegrades without microplastics", "ISO 17556 soil-burial testing of the PLA/flax/mycelium body and Mg/Zn alloys"],
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(55% 60% at 80% 25%, rgba(127,208,138,0.16), transparent 70%), radial-gradient(40% 45% at 65% 75%, rgba(255,106,43,0.10), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="eyebrow">Environmental defense · Deep-tech hardware</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Catch wildfires underground, <span className="text-ember">hours before</span> they reach the canopy.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            PyroShield Geo-Sensors are battery-free, biodegradable probes dropped by air along high-risk forest corridors. They detect subterranean
            micro-combustion from the heat and gases it produces at the root zone, and report it over satellite before any smoke is visible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg bg-ember px-5 py-2.5 font-medium text-black hover:brightness-110">
              Open live operations
            </Link>
            <Link href="/hardware" className="rounded-lg border border-line px-5 py-2.5 hover:bg-panel">
              Explore the 3D node
            </Link>
          </div>

          <ol className="mt-16 grid gap-3 md:grid-cols-4">
            {FLOW.map((s, i) => (
              <li key={s.title} className="card relative p-5">
                <div className="flex items-center gap-2 text-ember">
                  {s.icon}
                  <span className="font-mono text-xs">0{i + 1}</span>
                </div>
                <div className="mt-3 font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map(([v, l]) => (
            <div key={l}>
              <dt className="font-mono text-3xl font-semibold">{v}</dt>
              <dd className="mt-1 text-sm text-muted">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-line bg-panel/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <div className="eyebrow">How detection works</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">A combustion signature, not a single threshold</h2>
            <p className="mt-3 text-muted">
              Decomposing organic matter also gives off CO and VOCs. Each node scores its readings against its own learned baseline across independent
              channels, and an alert fires only when heat and combustion chemistry agree.
            </p>
            <ul className="mt-6 space-y-4 text-sm">
              {[
                [<Thermometer key="t" size={16} />, "Root-zone heat & gradient inversion", "Soil at 30 cm normally changes slowly. When it warms faster than the surface, there is a heat source below."],
                [<Wind key="w" size={16} />, "CO rate-of-rise & CO:VOC ratio", "Smoldering produces CO-rich gas; microbial decomposition is VOC-rich and slow."],
                [<Activity key="a" size={16} />, "Neighbour corroboration", "Gas drifting to nearby nodes confirms the source and pinpoints it."],
                [<Leaf key="l" size={16} />, "Biogenic gate", "Gas without heat in wet soil is classed as decomposition, and the alert is suppressed."],
              ].map(([icon, t, b]) => (
                <li key={t as string} className="flex gap-3">
                  <span className="mt-0.5 text-ember">{icon}</span>
                  <span>
                    <b className="font-medium">{t}</b>
                    <span className="block text-muted">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel-2 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Approach</th>
                    <th className="px-4 py-3 font-medium">Detects at</th>
                    <th className="px-4 py-3 font-medium">Limitation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {COMPARE.map(([a, b, c], i) => (
                    <tr key={a} className={i === 2 ? "bg-ember/5" : ""}>
                      <td className={`px-4 py-3 ${i === 2 ? "font-medium text-ember" : ""}`}>{a}</td>
                      <td className="px-4 py-3 text-muted">{b}</td>
                      <td className="px-4 py-3 text-muted">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap size={16} className="text-ember" /> Why now
              </div>
              <p className="mt-2 text-sm text-muted">
                Extreme heatwaves have made overwintering &ldquo;zombie fires&rdquo; and forest-floor smoldering a leading source of major outbreaks.
                Meanwhile, thermoelectric harvesting from soil–air temperature differences now runs outdoor sensors for 10+ years with no battery,
                and direct-to-satellite IoT has removed the need for gateways.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-3">
        <div className="card p-6">
          <div className="eyebrow">Beachhead</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Private forestry managers and utility grid operators in high-risk timberland across <b className="text-text">British Columbia, California and Oregon</b>.
          </p>
        </div>
        <div className="card p-6">
          <div className="eyebrow">Wedge</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Perimeter monitoring along <b className="text-text">electrical transmission corridors</b> through pine forest, to prevent utility-caused
            ignitions where the liability is highest.
          </p>
        </div>
        <div className="card p-6">
          <div className="eyebrow">Business model</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <b className="text-text">$25/ha/year</b> covering hardware, deployment and monitoring, paid by utilities and insurance syndicates. A $500k
            annual contract is small next to a single ignition liability.
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="eyebrow">Risk register</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Killer assumptions & how we test them</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ASSUMPTIONS.map(([a, t], i) => (
              <div key={a} className="card p-5">
                <div className="font-mono text-xs text-ember">#{i + 1}</div>
                <div className="mt-1.5 font-medium">{a}</div>
                <p className="mt-1.5 text-sm text-muted">{t}</p>
              </div>
            ))}
            <div className="card flex flex-col justify-between border-ember/40 p-5">
              <p className="text-sm text-muted">See how a node is dropped, seated and commissioned, and size a corridor deployment.</p>
              <Link href="/install" className="mt-4 self-start rounded-lg bg-ember px-4 py-2 text-sm font-medium text-black hover:brightness-110">
                Installation guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} PyroShield Geo-Sensors</span>
          <span>Operations data shown is a simulated digital twin until field hardware is connected.</span>
        </div>
      </footer>
    </div>
  );
}
