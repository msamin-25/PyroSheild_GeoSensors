"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Operations" },
  { href: "/hardware", label: "Hardware" },
  { href: "/install", label: "Installation" },
] as const;

export function SiteNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-ember/15 text-ember">
            <Flame size={16} />
          </span>
          <span className="hidden sm:inline">PyroShield</span>
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                  active ? "bg-panel-2 text-text" : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
