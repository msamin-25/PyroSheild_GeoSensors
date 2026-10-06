"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import type { Alert } from "@/lib/types";
import { Badge } from "./ui/badge";
import { ButtonLink } from "./ui/button";
import { Logo } from "./ui/logo";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Operations" },
  { href: "/hardware", label: "Hardware" },
  { href: "/install", label: "Deployment" },
] as const;

function useFireAlerts() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/alerts", { signal: ctrl.signal })
      .then((r) => r.json() as Promise<{ alerts: Alert[] }>)
      .then((d) => setCount(d.alerts.filter((a) => a.kind === "fire").length))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return count;
}

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const fire = useFireAlerts();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  // Close the mobile sheet on navigation.
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" aria-label="PyroShield home" className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative rounded-md px-3 py-2 text-sm transition-colors ${isActive(l.href) ? "text-fg" : "text-fg-3 hover:text-fg"}`}
            >
              {l.label}
              {isActive(l.href) && <span className="absolute inset-x-3 -bottom-[13px] h-px bg-brand" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/dashboard" className="hidden rounded-full sm:block">
            {fire === null ? (
              <Badge>Connecting…</Badge>
            ) : fire > 0 ? (
              <Badge tone="critical" dot pulse>
                {fire} active fire {fire === 1 ? "alert" : "alerts"}
              </Badge>
            ) : (
              <Badge tone="ok" dot>
                All corridors clear
              </Badge>
            )}
          </Link>
          <span className="hidden md:block">
            <ButtonLink href="/dashboard" size="sm">
              Open console <ArrowUpRight size={14} />
            </ButtonLink>
          </span>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-md text-fg-2 hover:bg-surface-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="anim-fade-up border-t border-border bg-bg px-5 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center justify-between border-b border-border py-3.5 text-[15px] ${isActive(l.href) ? "text-fg" : "text-fg-2"}`}
            >
              {l.label}
              {isActive(l.href) && <span className="size-1.5 rounded-full bg-brand" />}
            </Link>
          ))}
          <ButtonLink href="/dashboard" className="mt-4 w-full">
            Open operations console
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
