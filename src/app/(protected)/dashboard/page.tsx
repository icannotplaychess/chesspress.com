import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard — ChessPress" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  let profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.userProfile.create({ data: { userId } });
  }

  const [repertoireCount, gameCount, scoutCount, connected] = await Promise.all([
    prisma.repertoire.count({ where: { userId } }),
    prisma.game.count({ where: { userId } }),
    prisma.scoutAnalysisJob.count({
      where: { userId, status: "complete" },
    }),
    prisma.connectedChessAccount.findMany({ where: { userId } }),
  ]);

  const displayName =
    profile?.displayName ?? session.user.name ?? session.user.email?.split("@")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-[var(--accent-text)]">{displayName}</span>
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Your chess improvement hub — learn, practice, and scout opponents.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Repertoires" value={repertoireCount} />
        <StatCard label="Saved games" value={gameCount} />
        <StatCard label="Scout reports" value={scoutCount} />
        <StatCard
          label="Connected"
          value={connected.length}
          sub={connected.map((c) => c.platform).join(", ") || "None"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          href="/practice?step=learn"
          title="Learn openings"
          description="Shreya teaches your repertoire lines before you practice."
        />
        <ActionCard
          href="/practice?step=practice"
          title="Practice"
          description="Drill lines from memory — repeat until they stick."
        />
        <ActionCard
          href="/scout"
          title="Player Scout"
          description="Analyze your chess or scout an opponent's strengths and weaknesses."
          primary
        />
        <ActionCard
          href="/analysis"
          title="Analysis Board"
          description="Engine analysis, opening recognition, and coach explanations."
        />
        <ActionCard
          href="/repertoires"
          title="Repertoires"
          description="Manage your opening repertoires."
        />
        <ActionCard
          href="/settings"
          title="Settings"
          description="Account, connected platforms, and coach preferences."
        />
      </div>

      {connected.length === 0 && (
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
          <h2 className="font-semibold mb-1">Connect your chess accounts</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Link Chess.com or Lichess to analyze your games and scout opponents.
          </p>
          <Link
            href="/settings"
            className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
          >
            Connect accounts
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      {sub && <div className="text-xs text-[var(--muted)] mt-1 capitalize">{sub}</div>}
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  primary,
}: {
  href: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-5 transition-colors ${
        primary
          ? "border-[var(--accent-bright)] bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30"
          : "border-[var(--panel-border)] bg-[var(--panel)] hover:bg-[var(--card)]"
      }`}
    >
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </Link>
  );
}
