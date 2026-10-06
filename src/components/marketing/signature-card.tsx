/** A stylised example of the detection model's output for a smoldering event. */

const W = 520;
const H = 170;
const N = 49; // 12 h at 15-min cadence
const ONSET = 22;

function series(f: (i: number) => number) {
  return Array.from({ length: N }, (_, i) => f(i));
}
const rise = (i: number, tau: number) => (i < ONSET ? 0 : 1 - Math.exp(-(i - ONSET) / tau));

const soil30 = series((i) => 10.6 + 0.15 * Math.sin(i / 3) + 40 * rise(i, 14));
const co = series((i) => 0.4 + 0.08 * Math.cos(i / 2) + 55 * rise(i - 2, 12));

function path(vals: number[], max: number) {
  return vals.map((v, i) => `${i ? "L" : "M"}${((i / (N - 1)) * W).toFixed(1)} ${(H - (v / max) * (H - 10)).toFixed(1)}`).join(" ");
}

const FACTORS = [
  ["Root-zone heat anomaly", 32],
  ["CO above baseline", 18],
  ["Thermal gradient inversion", 14],
  ["Neighbour corroboration", 12],
  ["Combustion CO:VOC ratio", 10],
  ["CO rate of rise", 4],
] as const;

export function SignatureCard() {
  const alertX = ((ONSET + 3) / (N - 1)) * W;
  return (
    <div className="surface-raised overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-critical" />
          <span className="font-mono text-[13px]">PS-SL-028</span>
          <span className="text-xs text-fg-3">Stump Lake · km 26.9</span>
        </div>
        <span className="font-mono text-xs text-fg-3">last 12 h</span>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-4 text-[11px] text-fg-3">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded bg-critical" /> Soil 30 cm (°C)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded bg-fire opacity-60" /> CO (ppm)
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 18}`} className="mt-2 h-auto w-full" aria-hidden>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(170,230,190,0.07)" />
          ))}
          <line x1={alertX} x2={alertX} y1="0" y2={H} stroke="#7ee08f" strokeDasharray="3 4" />
          <rect x={alertX + 6} y="4" width="82" height="20" rx="6" fill="rgba(126,224,143,0.14)" />
          <text x={alertX + 14} y="18" fontSize="11" fill="#7ee08f" fontFamily="var(--font-geist-mono)">
            ALERT T+45m
          </text>
          <path d={path(co, 60)} fill="none" stroke="#ff6b35" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d={path(soil30, 60)} fill="none" stroke="#ff4d4d" strokeWidth="2.2" />
          <text x="0" y={H + 14} fontSize="10" fill="#6e8c78" fontFamily="var(--font-geist-mono)">
            −12 h
          </text>
          <text x={W} y={H + 14} fontSize="10" fill="#6e8c78" textAnchor="end" fontFamily="var(--font-geist-mono)">
            now
          </text>
        </svg>
      </div>

      <div className="grid gap-5 border-t border-border p-5 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
          <div className="text-display font-mono text-5xl text-critical">90</div>
          <div>
            <div className="text-sm font-medium">Smoldering</div>
            <div className="text-xs text-fg-3">97% confidence</div>
          </div>
        </div>
        <ul className="space-y-2">
          {FACTORS.map(([label, pts]) => (
            <li key={label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 text-xs">
              <span className="text-fg-2">{label}</span>
              <span className="font-mono text-fg">+{pts}</span>
              <span className="col-span-2 mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                <span className="block h-full rounded-full bg-gradient-to-r from-warning to-critical" style={{ width: `${(pts / 32) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
