import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHero } from "@/components/ui/PageHero";

const FEATURES = [
  {
    href: "/practice?step=learn",
    lead: "Learn &",
    italic: "Practice",
    description:
      "Shreya teaches each move first, then you drill the line from memory until it sticks.",
  },
  {
    href: "/explorer",
    lead: "Opening",
    italic: "Explorer",
    description:
      "Browse openings with Lichess statistics and Stockfish analysis. Add lines to your repertoire.",
  },
  {
    href: "/analysis",
    lead: "Analysis",
    italic: "Board",
    description:
      "Stockfish, opening recognition, and coach explanations — synchronized on one board.",
  },
  {
    href: "/repertoires",
    lead: "Track",
    italic: "mastery",
    description:
      "Create, manage, and track mastery across multiple opening repertoires.",
  },
  {
    href: "/scout",
    lead: "Player",
    italic: "Scout",
    description:
      "Deep-dive reports on public players when you need extra prep — alongside your daily training.",
  },
];

export default function HomePage() {
  return (
    <PageContainer className="pb-8">
      <PageHero
        kicker="Chess improvement · est. 2026"
        title="your room to"
        titleItalic="get better."
        description="Learn openings, practice with spaced repetition, explore the database, analyze with Stockfish, and build repertoires — all in one calm workspace."
      />

      <div className="flex flex-wrap justify-center gap-3 -mt-2 mb-12">
        <Link href="/auth/signup" className="cp-cta no-underline">
          Start free →
        </Link>
        <Link href="/explorer" className="cp-ghost no-underline inline-flex items-center">
          Explore openings
        </Link>
      </div>

      <div className="cp-grid-2">
        {FEATURES.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="cp-card no-underline text-[var(--ink)] hover:border-[var(--brand)] transition-colors mb-0"
          >
            <h2 className="cp-h2 text-[22px] mb-2">
              {card.lead} <i>{card.italic}</i>
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
