const SPAN_H = 12;

const EVENTS = [
  { h: 0, label: "Root-zone ignition", sub: "Lightning strike, line fault or holdover heat", tone: "fire" },
  { h: 0.75, label: "PyroShield alert", sub: "Heat + CO signature at 30 cm, uplinked to the dispatcher", tone: "brand" },
  { h: 6, label: "Smoke clears canopy", sub: "First visible sign above the trees", tone: "muted" },
  { h: 9, label: "Satellite / camera detection", sub: "After revisit, cloud and line-of-sight delays", tone: "muted" },
  { h: 12, label: "Crown fire", sub: "Uncontrollable spread", tone: "critical" },
] as const;

const fmt = (h: number) => (h === 0 ? "0" : h < 1 ? `${Math.round(h * 60)} min` : `${h} h`);

const DOT: Record<(typeof EVENTS)[number]["tone"], string> = {
  fire: "bg-fire ring-fire/25",
  brand: "bg-brand ring-brand/30",
  muted: "bg-fg-3 ring-fg-3/20",
  critical: "bg-critical ring-critical/25",
};

export function DetectionTimeline() {
  const pct = (h: number) => `${(h / SPAN_H) * 100}%`;
  return (
    <div className="surface p-6 sm:p-10">
      {/* Desktop: horizontal track */}
      <div className="relative hidden h-[220px] md:block">
        <div className="absolute inset-x-0 top-[104px] h-px bg-border-strong" />
        <div
          className="absolute top-[96px] h-4 rounded-full bg-gradient-to-r from-brand/45 via-brand/20 to-transparent"
          style={{ left: pct(0.75), width: `calc(${pct(9 - 0.75)})` }}
        />
        <div className="absolute top-[124px] text-xs font-medium text-brand" style={{ left: `calc(${pct(0.75)} + 8px)` }}>
          ≈ 8 hours of extra response time
        </div>

        {EVENTS.map((e, i) => {
          const above = i % 2 === 0;
          const edge = e.h === 0 ? "translate-x-0" : e.h === SPAN_H ? "-translate-x-full text-right" : "-translate-x-1/2 text-center";
          return (
            <div key={e.label}>
              <span
                className={`absolute top-[104px] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ${DOT[e.tone]}`}
                style={{ left: pct(e.h) }}
              />
              <div className={`absolute w-44 ${edge} ${above ? "top-0" : "top-[150px]"}`} style={{ left: pct(e.h) }}>
                <div className="font-mono text-[11px] text-fg-3">T+{fmt(e.h)}</div>
                <div className={`mt-1 text-sm font-medium ${e.tone === "brand" ? "text-brand" : e.tone === "critical" ? "text-critical" : "text-fg"}`}>{e.label}</div>
                <div className="mt-0.5 text-xs leading-snug text-fg-3">{e.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <ol className="space-y-6 border-l border-border-strong pl-6 md:hidden">
        {EVENTS.map((e) => (
          <li key={e.label} className="relative">
            <span className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ${DOT[e.tone]}`} />
            <div className="font-mono text-[11px] text-fg-3">T+{fmt(e.h)}</div>
            <div className={`text-sm font-medium ${e.tone === "brand" ? "text-brand" : "text-fg"}`}>{e.label}</div>
            <div className="text-xs text-fg-3">{e.sub}</div>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-border pt-4 text-xs text-fg-3">
        Illustrative timeline for a root-zone smoldering ignition in dry pine duff. Actual intervals depend on fuel moisture and wind.
      </p>
    </div>
  );
}
