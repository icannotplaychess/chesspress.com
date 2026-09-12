"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", auth: true },
  { href: "/explorer", label: "Explorer", auth: false },
  { href: "/repertoires", label: "Repertoires", auth: true },
  { href: "/practice", label: "Practice", auth: true },
  { href: "/scout", label: "Player Scout", auth: true },
  { href: "/analysis", label: "Analysis", auth: false },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const visibleItems = NAV_ITEMS.filter((item) => !item.auth || isLoggedIn);

  return (
    <header className="border-b border-[var(--panel-border)] bg-[var(--panel)]">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--accent-text)]">
            ChessPress
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/settings"
                className="text-sm text-[var(--muted)] hover:text-foreground px-2"
              >
                {session?.user?.name ?? "Settings"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-[var(--muted)] hover:text-foreground px-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm text-[var(--muted)] hover:text-foreground px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm rounded-md bg-[var(--accent-bright)] px-3 py-1.5 text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
