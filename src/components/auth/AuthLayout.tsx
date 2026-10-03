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
          <Link href="/" className="cp-logo inline-block text-[30px] !text-[var(--ink)]">
            chesspress<i>.</i>
          </Link>
          <h1 className="mt-6 cp-h2 text-[24px]">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
        <div className="cp-card mb-0 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
