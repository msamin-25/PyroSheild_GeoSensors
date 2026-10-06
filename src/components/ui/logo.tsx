/** PyroShield mark: a shield whose lower half is soil, with a probe reaching into a heat point. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ps-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4f0ad" />
          <stop offset="1" stopColor="#3fa45a" />
        </linearGradient>
      </defs>
      <path d="M16 2.5 27 6.6v8.2c0 7-4.6 12.2-11 14.7C9.6 27 5 21.8 5 14.8V6.6L16 2.5Z" fill="url(#ps-shield)" />
      <path d="M5.3 16.5h21.4c-.9 5.8-5 10.6-10.7 13-5.7-2.4-9.8-7.2-10.7-13Z" fill="#06120c" opacity=".82" />
      <path d="M16 9v13" stroke="#06120c" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="23.2" r="2.6" fill="#ff6b35" />
      <circle cx="16" cy="23.2" r="4.6" fill="#ff6b35" opacity=".22" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        PyroShield<span className="ml-1.5 font-normal text-fg-3">Geo-Sensors</span>
      </span>
    </span>
  );
}
