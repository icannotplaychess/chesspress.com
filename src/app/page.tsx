import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to <span className="text-[var(--accent-text)]">ChessPress</span>
      </h1>
      <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
        Your chess improvement platform with Stockfish analysis, Lichess opening
        data, adaptive training, and Shreya — your personal AI coach.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          href="/analysis"
          title="Analysis Board"
          description="Analyze any position with Stockfish, explore openings from the Lichess database, and get coach explanations."
          primary
        />
        <ActionCard
          href="/analysis"
          title="Import a Game"
          description="Load a PGN on the Analysis Board to review every move with engine classifications."
        />
      </div>
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
      className={`rounded-xl border p-6 transition-colors ${
        primary
          ? "border-[var(--accent-bright)] bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30"
          : "border-[var(--panel-border)] bg-[var(--panel)] hover:bg-[#1a1a1a]"
      }`}
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
    </Link>
  );
}
