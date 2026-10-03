"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", auth: true },
  { href: "/practice", label: "Practice", auth: true },
  { href: "/explorer", label: "Explorer", auth: false },
  { href: "/analysis", label: "Analysis", auth: false },
  { href: "/repertoires", label: "Repertoires", auth: true },
  { href: "/scout", label: "Scout", auth: true },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const visibleItems = NAV_ITEMS.filter((item) => !item.auth || isLoggedIn);

  return (
    <header className="px-5">
      <div className="cp-nav-shell">
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="cp-logo">
          chesspress<i>.</i>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-wrap" aria-label="Main">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`cp-pill no-underline ${isActive ? "on" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {isLoggedIn ? (
            <>
              <Link href="/settings" className="cp-pill no-underline">
                {session?.user?.name ?? "Settings"}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cp-pill"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="cp-pill no-underline">
                Sign in
              </Link>
              <Link href="/auth/signup" className="cp-pill on no-underline">
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
