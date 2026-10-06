import Link from "next/link";
import { Logo } from "./ui/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["Operations console", "/dashboard"],
      ["Geo-Spike hardware", "/hardware"],
      ["Deployment guide", "/install"],
      ["Deployment planner", "/install#planner"],
    ],
  },
  {
    title: "Platform",
    links: [
      ["Network API", "/api/network"],
      ["Alerts API", "/api/alerts"],
      ["Detection model", "/#detection"],
      ["Risk register", "/#assumptions"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-fg-3">
            Battery-free soil sensors that detect subterranean smoldering hours before a wildfire reaches the canopy.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-fg-3">{c.title}</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-fg-2 transition-colors hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-5 py-6 text-xs text-fg-3 sm:px-8">
          <span>© 2026 PyroShield Geo-Sensors</span>
          <span>Operations data is a simulated digital twin until field hardware is connected.</span>
        </div>
      </div>
    </footer>
  );
}
