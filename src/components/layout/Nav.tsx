"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/explorer", label: "Opening Explorer" },
  { href: "/repertoires", label: "Repertoires" },
  { href: "/practice", label: "Practice" },
  { href: "/analysis", label: "Analysis Board" },
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
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-foreground hover:bg-[#222]"
                }`}
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
