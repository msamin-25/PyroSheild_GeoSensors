import type { ReactNode } from "react";
import type { Tone } from "@/lib/ui";

const TONES: Record<Tone, string> = {
  neutral: "text-fg-2 bg-surface-2 border-border",
  brand: "text-brand bg-brand-soft border-brand/20",
  ok: "text-ok bg-ok/10 border-ok/20",
  watch: "text-watch bg-watch/10 border-watch/25",
  warning: "text-warning bg-warning/10 border-warning/25",
  critical: "text-critical bg-critical/12 border-critical/30",
  info: "text-info bg-info/10 border-info/25",
  offline: "text-fg-2 bg-offline/15 border-offline/30",
  biogenic: "text-biogenic bg-biogenic/10 border-biogenic/25",
};

export function Badge({ tone = "neutral", dot, pulse, children, className = "" }: { tone?: Tone; dot?: boolean; pulse?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium leading-none ${TONES[tone]} ${className}`}>
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
