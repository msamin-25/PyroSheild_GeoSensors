"use client";

import type { ReactNode } from "react";

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  size = "sm",
  label,
  className = "",
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  size?: "xs" | "sm";
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-[var(--radius-md)] border border-border bg-bg/60 p-0.5 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 rounded-[7px] font-medium transition-colors ${size === "xs" ? "h-6 px-2 text-[11px]" : "h-7 px-3 text-xs"} ${
              on ? "bg-surface-3 text-fg shadow-sm" : "text-fg-3 hover:text-fg-2"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
