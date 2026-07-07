"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/analysis", label: "Analysis Board" },
  { href: "/analysis", label: "Opening Explorer", disabled: true },
  { href: "/analysis", label: "Repertoires", disabled: true },
  { href: "/analysis", label: "Practice", disabled: true },
  { href: "/analysis", label: "Game Review", disabled: true },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--panel-border)] bg-[var(--panel)]">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--accent-text)]">
            ChessPress
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href && !item.disabled;
            return (
              <Link
                key={item.label}
                href={item.disabled ? "#" : item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  item.disabled
                    ? "text-[var(--muted)]/50 cursor-not-allowed"
                    : isActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:text-foreground hover:bg-[#222]"
                }`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
