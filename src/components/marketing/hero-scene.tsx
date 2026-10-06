import { Flame, Satellite } from "lucide-react";

/** Pine silhouette: stacked tiers narrowing to a point. */
function Pine({ x, base, h, shade }: { x: number; base: number; h: number; shade: string }) {
  const w = h * 0.42;
  const tiers = 4;
  const parts = [];
  for (let i = 0; i < tiers; i++) {
    const top = base - h + (i * h) / (tiers + 1);
    const bottom = top + h / 2.1;
    const tw = (w * (i + 1.4)) / (tiers + 0.4);
    parts.push(<path key={i} d={`M${x} ${top} L${x + tw / 2} ${bottom} L${x - tw / 2} ${bottom} Z`} fill={shade} />);
  }
  return (
    <g>
      <rect x={x - 2} y={base - h * 0.15} width="4" height={h * 0.15} fill="#1c120b" />
      {parts}
    </g>
  );
}

const GROUND = 250;

export function HeroScene() {
  const trees = [
    { x: 40, h: 150, s: "#0f2a1b" },
    { x: 92, h: 196, s: "#133524" },
    { x: 150, h: 170, s: "#0f2a1b" },
    { x: 360, h: 210, s: "#163b28" },
    { x: 418, h: 160, s: "#0f2a1b" },
    { x: 470, h: 188, s: "#133524" },
    { x: 528, h: 140, s: "#0f2a1b" },
  ];
  const particles = [0, 0.5, 1.1, 1.7, 2.3, 2.8];

  return (
    <div className="relative">
      <svg viewBox="0 0 560 540" className="h-auto w-full" role="img" aria-label="Cross-section of a forest: a PyroShield sensor in the soil detects heat and gas from a smoldering root and uplinks to a satellite while no smoke is visible above the canopy.">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#081a11" />
            <stop offset="1" stopColor="#0d2418" />
          </linearGradient>
          <linearGradient id="soilA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c1f14" />
            <stop offset="1" stopColor="#24180f" />
          </linearGradient>
          <linearGradient id="soilB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f150d" />
            <stop offset="1" stopColor="#120c07" />
          </linearGradient>
          <radialGradient id="ember" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffb07a" stopOpacity="1" />
            <stop offset="0.25" stopColor="#ff6b35" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ff6b35" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="spike" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8a7050" />
            <stop offset="0.5" stopColor="#c4a57a" />
            <stop offset="1" stopColor="#8a7050" />
          </linearGradient>
          <clipPath id="frame">
            <rect width="560" height="540" rx="20" />
          </clipPath>
        </defs>

        <g clipPath="url(#frame)">
          <rect width="560" height={GROUND} fill="url(#sky)" />
          {[
            [60, 40], [130, 70], [220, 30], [300, 85], [390, 45], [250, 120], [500, 110], [30, 110],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#cfe9d6" opacity="0.35" />
          ))}

          {/* uplink */}
          <path d={`M272 ${GROUND - 46} Q 380 120 478 62`} fill="none" stroke="#7ee08f" strokeWidth="1.5" strokeDasharray="4 8" className="anim-dash" opacity="0.8" />

          {trees.map((t) => (
            <Pine key={t.x} x={t.x} base={GROUND} h={t.h} shade={t.s} />
          ))}

          {/* soil */}
          <rect y={GROUND} width="560" height="22" fill="#3a2a1a" />
          <rect y={GROUND + 22} width="560" height="118" fill="url(#soilA)" />
          <rect y={GROUND + 140} width="560" height="160" fill="url(#soilB)" />
          <path d={`M0 ${GROUND} H560`} stroke="#4c7a3e" strokeWidth="2" />
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={(i * 137) % 560} cy={GROUND + 30 + ((i * 61) % 250)} r={1 + (i % 3) * 0.6} fill="#000" opacity="0.25" />
          ))}

          {/* roots from the right-hand pine down to the smoldering pocket */}
          <g stroke="#4a3220" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9">
            <path d={`M360 ${GROUND} C 362 300, 350 340, 338 386`} />
            <path d={`M360 ${GROUND + 10} C 390 290, 410 320, 430 350`} strokeWidth="3" />
            <path d={`M345 330 C 320 345, 300 350, 292 372`} strokeWidth="2.5" />
          </g>

          {/* smoldering pocket */}
          <circle cx="338" cy="392" r="70" fill="url(#ember)" className="anim-glow" />
          <circle cx="338" cy="392" r="7" fill="#ffd2a8" />

          {/* gas migrating toward the probe's diffusion port */}
          {particles.map((d, i) => (
            <circle
              key={i}
              cx={318 - i * 9}
              cy={360 - (i % 2) * 8}
              r={2.2 - (i % 3) * 0.4}
              fill="#ffb07a"
              className="anim-rise"
              style={{ animationDelay: `${d}s`, transformBox: "fill-box" }}
            />
          ))}

          {/* depth guides */}
          <g fontFamily="var(--font-geist-mono)" fontSize="10" fill="#cfe9d6" opacity="0.55">
            {[
              [GROUND + 18, "5 cm"],
              [GROUND + 70, "15 cm"],
              [GROUND + 140, "30 cm"],
            ].map(([y, l]) => (
              <g key={l}>
                <line x1="150" x2="238" y1={y} y2={y} stroke="#cfe9d6" strokeDasharray="2 4" opacity="0.6" />
                <text x="114" y={Number(y) + 3}>
                  {l}
                </text>
              </g>
            ))}
          </g>

          {/* probe */}
          <g transform="translate(256 0)">
            <path d={`M-11 ${GROUND} L-6 ${GROUND + 150} L0 ${GROUND + 170} L6 ${GROUND + 150} L11 ${GROUND} Z`} fill="url(#spike)" />
            {[18, 70, 140].map((d) => (
              <rect key={d} x="-10" y={GROUND + d - 2} width="20" height="4" fill="#d8a24a" />
            ))}
            <rect x="-10" y={GROUND + 44} width="20" height="8" fill="#141414" />
            <rect x="-24" y={GROUND - 3} width="48" height="5" rx="2" fill="#7a5c3c" />
            <rect x="-15" y={GROUND - 36} width="30" height="33" rx="3" fill="#8f999c" />
            {[-12, -6, 0, 6, 12].map((x) => (
              <rect key={x} x={x - 1} y={GROUND - 34} width="2" height="29" fill="#b9c3c6" />
            ))}
            <path d={`M-30 ${GROUND - 40} L-14 ${GROUND - 37} L-14 ${GROUND - 31} L-30 ${GROUND - 34} Z`} fill="#c9b48a" />
            <path d={`M30 ${GROUND - 40} L14 ${GROUND - 37} L14 ${GROUND - 31} L30 ${GROUND - 34} Z`} fill="#c9b48a" />
            <path d={`M-16 ${GROUND - 36} Q0 ${GROUND - 64} 16 ${GROUND - 36} Z`} fill="#ebe6d8" />
            <circle cx="16" cy={GROUND - 46} r="3" fill="#7ee08f" className="anim-glow" />
          </g>

          {/* satellite */}
          <g transform="translate(478 62) rotate(-20)">
            <rect x="-26" y="-6" width="18" height="12" fill="#2f5d8a" stroke="#6cb8f0" strokeWidth="0.8" />
            <rect x="8" y="-6" width="18" height="12" fill="#2f5d8a" stroke="#6cb8f0" strokeWidth="0.8" />
            <rect x="-7" y="-8" width="14" height="16" rx="2" fill="#c9d3d6" />
            <line x1="-8" x2="8" y1="0" y2="0" stroke="#c9d3d6" strokeWidth="1.5" />
          </g>
        </g>
        <rect x="0.5" y="0.5" width="559" height="539" rx="19.5" fill="none" stroke="rgba(170,230,190,0.12)" />
      </svg>

      {/* Callouts — HTML so they stay crisp and on-brand at any scale */}
      <div className="surface-raised absolute -left-3 bottom-[5%] w-[min(250px,52%)] p-3.5 sm:-left-8">
        <div className="flex items-center gap-2 text-[11px] font-medium text-critical">
          <span className="grid size-5 place-items-center rounded-full bg-critical/15">
            <Flame size={11} />
          </span>
          SMOLDERING DETECTED
        </div>
        <div className="mt-2 font-mono text-[13px] text-fg">PS-SL-028 · risk 90</div>
        <div className="mt-1 text-[11px] leading-snug text-fg-3">+40.5 °C at 30 cm · CO 56 ppm · 8 neighbours corroborate</div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-warning to-critical" />
        </div>
      </div>

      <div className="surface absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 text-[11px] text-fg-2 sm:bottom-5 sm:right-5">
        <Satellite size={13} className="text-info" />
        Alert uplinked <span className="font-mono text-fg">45 min</span> after onset
      </div>

      <div className="absolute left-5 top-5 rounded-full border border-border bg-overlay px-3 py-1.5 text-[11px] text-fg-3 backdrop-blur">
        Canopy: <span className="text-ok">no smoke visible</span>
      </div>
    </div>
  );
}
