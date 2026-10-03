import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/ui/PageContainer";

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
    <PageContainer className="py-8 space-y-10">
      <section>
        <div className="font-mono-label">Dashboard</div>
        <h1 className="cp-h2 text-[clamp(32px,5vw,48px)] mt-2">
          Welcome back, <i>{displayName}</i>
        </h1>
        <p className="text-sm text-[var(--mute)] mt-2 max-w-xl">
          Your chess improvement hub — learn lines, practice, explore openings, analyze
          games, and manage repertoires.
        </p>
      </section>

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

      <div className="cp-grid-2">
        <ActionCard
          href="/practice?step=learn"
          lead="Learn"
          italic="openings"
          description="Shreya teaches your repertoire lines before you practice."
        />
        <ActionCard
          href="/practice?step=practice"
          lead="Practice"
          italic="drills"
          description="Repeat lines from memory until they stick."
        />
        <ActionCard
          href="/explorer"
          lead="Explore"
          italic="lines"
          description="Lichess stats and Stockfish on the opening explorer."
        />
        <ActionCard
          href="/analysis"
          lead="Analysis"
          italic="board"
          description="Engine analysis, database moves, and coach notes."
        />
        <ActionCard
          href="/repertoires"
          lead="Your"
          italic="repertoires"
          description="Manage openings and track mastery bars."
        />
        <ActionCard
          href="/scout"
          lead="Player"
          italic="scout"
          description="Optional opponent prep when you have a target in mind."
        />
        <ActionCard
          href="/settings"
          lead="Account"
          italic="settings"
          description="Profile, connected platforms, and coach preferences."
        />
      </div>

      {connected.length === 0 && (
        <div className="cp-card mb-0">
          <h2 className="cp-h2 text-[20px]">Connect your chess accounts</h2>
          <p className="text-sm text-[var(--mute)] mb-4">
            Link Chess.com or Lichess to sync progress and analyze your own games.
          </p>
          <Link href="/settings" className="cp-btn no-underline inline-block">
            Connect accounts
          </Link>
        </div>
      )}
    </PageContainer>
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
    <div className="cp-card mb-0">
      <div className="cp-stat-value">{value}</div>
      <div className="font-mono-label mt-1">{label}</div>
      {sub && (
        <div className="text-xs text-[var(--mute)] mt-1 capitalize">{sub}</div>
      )}
    </div>
  );
}

function ActionCard({
  href,
  lead,
  italic,
  description,
}: {
  href: string;
  lead: string;
  italic: string;
  description: string;
}) {
  return (
    <Link href={href} className="cp-card no-underline text-[var(--ink)] hover:border-[var(--brand)] transition-colors mb-0">
      <h2 className="cp-h2 text-[20px] mb-1">
        {lead} <i>{italic}</i>
      </h2>
      <p className="text-sm text-[var(--mute)] m-0">{description}</p>
    </Link>
  );
}
