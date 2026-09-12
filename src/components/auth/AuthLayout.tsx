import Link from "next/link";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-[var(--accent-text)]">
            ChessPress
          </Link>
          <h1 className="mt-6 text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
