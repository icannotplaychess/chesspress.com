import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";

const FEATURES = [
  {
    href: "/scout",
    title: "Player Scout",
    description:
      "Analyze your chess or scout any public player on Chess.com or Lichess.",
  },
  {
    href: "/practice?step=learn",
    title: "Learn & Practice",
    description:
      "Shreya teaches each move first, then you drill the line from memory until it sticks.",
  },
  {
    href: "/explorer",
    title: "Explore Openings",
    description:
      "Browse openings with Lichess statistics and Stockfish analysis. Add lines to your repertoire.",
  },
  {
    href: "/repertoires",
    title: "Repertoires",
    description:
      "Create, manage, and track mastery across multiple opening repertoires.",
  },
  {
    href: "/analysis",
    title: "Analysis Board",
    description:
      "Analyze any position with Stockfish, explore the database, and get coach explanations.",
  },
];

export default function HomePage() {
  return (
    <PageContainer className="pb-8">
      <section className="text-center py-14 md:py-16">
        <div className="font-mono-label">Chess improvement · est. 2026</div>
        <h1 className="font-serif font-normal text-[clamp(46px,9vw,92px)] leading-[0.95] my-4">
          know your opponent,
          <i className="block text-[var(--brand)]">get in the room.</i>
        </h1>
        <Link href="/scout" className="cp-cta">
          Scout a player →
        </Link>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/auth/signup" className="cp-btn no-underline inline-block">
            Create free account
          </Link>
          <Link href="/auth/signin" className="cp-ghost no-underline inline-flex items-center">
            Sign in
          </Link>
        </div>
      </section>

      <div className="cp-grid-2">
        {FEATURES.map((card, i) => (
          <Link key={card.href} href={card.href} className="cp-card no-underline text-[var(--ink)] hover:border-[var(--brand)] transition-colors">
            <h2 className="cp-h2 text-[22px] mb-2">
              {i === 0 ? (
                <>
                  Player <i>Scout</i>
                </>
              ) : (
                card.title
              )}
            </h2>
            <p className="text-sm text-[var(--mute)] leading-relaxed m-0">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
