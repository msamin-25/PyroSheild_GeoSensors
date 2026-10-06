/** Static SVG diagrams for the installation guide. Colors come from CSS variables so they follow the theme. */

export function CorridorLayout() {
  const towers = [60, 300, 540];
  const rows = [
    { y: 50, dx: 0 },
    { y: 110, dx: 40 },
    { y: 170, dx: 80 },
  ];
  return (
    <svg viewBox="0 0 720 230" className="h-auto w-full" role="img" aria-label="Plan view of a three-row staggered sensor layout along a transmission line">
      <rect x="0" y="20" width="720" height="180" rx="8" fill="var(--brand)" opacity="0.06" />
      <line x1="0" y1="20" x2="720" y2="20" stroke="var(--border-strong)" strokeDasharray="4 4" />
      <line x1="0" y1="200" x2="720" y2="200" stroke="var(--border-strong)" strokeDasharray="4 4" />
      <line x1="0" y1="110" x2="720" y2="110" stroke="var(--fire)" strokeWidth="2" opacity="0.8" />
      {towers.map((x) => (
        <g key={x}>
          <rect x={x - 7} y={103} width="14" height="14" fill="none" stroke="var(--fire)" strokeWidth="2" />
          <circle cx={x} cy={110} r="22" fill="none" stroke="var(--risk-critical)" strokeDasharray="3 3" opacity="0.7" />
        </g>
      ))}
      {rows.map((r) =>
        Array.from({ length: 6 }, (_, i) => {
          const x = 20 + r.dx + i * 120;
          if (x > 710) return null;
          const nearTower = towers.some((t) => Math.hypot(t - x, 110 - r.y) < 24);
          return (
            <circle
              key={`${r.y}-${i}`}
              cx={nearTower ? x + 30 : x}
              cy={r.y}
              r="5"
              fill={nearTower ? "none" : "var(--brand)"}
              stroke={nearTower ? "var(--risk-critical)" : "none"}
            />
          );
        }),
      )}
      <g fontSize="11" fill="var(--fg-3)" fontFamily="var(--font-geist-mono)">
        <text x="8" y="14">300 m monitored buffer</text>
        <text x="8" y="222">Schematic, not to scale · dashed ring = 15 m tower exclusion · hollow = shifted 20 m along-row</text>
        <text x="575" y="14">← 200 m spacing →</text>
        <text x="676" y="106" fill="var(--fire)">230 kV</text>
      </g>
    </svg>
  );
}

export function InstallChecks() {
  const cases = [
    { ok: true, title: "Correct", note: "Vertical ± 10°, collar flush with the duff, open sky above", tilt: 0, lift: 0 },
    { ok: false, title: "Tilted > 25°", note: "Thermistor depths skew and the antenna loses sky view", tilt: 30, lift: 0 },
    { ok: false, title: "Collar raised", note: "Air gap lets rain run down the bore and decouples the TEG", tilt: 0, lift: 14 },
    { ok: false, title: "Against a trunk", note: "Within 1 m of roots and stemflow: biased moisture and heat", tilt: 0, lift: 0, trunk: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cases.map((c) => (
        <figure key={c.title} className="surface p-3">
          <svg viewBox="0 0 120 150" className="h-auto w-full" aria-hidden>
            <rect x="0" y="62" width="120" height="88" fill="#4a3524" />
            <rect x="0" y="56" width="120" height="8" fill="#3b2a1a" />
            {c.trunk && <rect x="76" y="0" width="22" height="64" fill="#5b4330" />}
            <g transform={`translate(${c.trunk ? 62 : 60} ${58 - c.lift}) rotate(${c.tilt})`}>
              <path d="M-7 0 L-5 72 L0 84 L5 72 L7 0 Z" fill="#a88b62" />
              <rect x="-15" y="-3" width="30" height="4" rx="1" fill="#7a5c3c" />
              <rect x="-10" y="-22" width="20" height="19" fill="#9aa3a6" />
              <path d="M-11 -22 Q0 -36 11 -22 Z" fill="#e9e4d6" />
            </g>
          </svg>
          <figcaption className="mt-2 text-sm">
            <span className={c.ok ? "text-brand" : "text-critical"}>{c.ok ? "✓" : "✕"}</span> <b>{c.title}</b>
            <p className="mt-0.5 text-xs leading-relaxed text-fg-3">{c.note}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
