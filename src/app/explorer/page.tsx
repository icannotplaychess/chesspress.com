import { OpeningExplorerClient } from "@/components/explorer/OpeningExplorerClient";
import { PageContainer } from "@/components/ui/PageContainer";

export const metadata = {
  title: "Opening Explorer — ChessPress",
};

export default function ExplorerPage() {
  return (
    <PageContainer className="py-6">
      <section className="text-center py-6 mb-2">
        <div className="font-mono-label">Opening explorer</div>
        <h1 className="font-serif font-normal text-[clamp(40px,7vw,64px)] leading-[0.95] my-2">
          browse the <i className="text-[var(--brand)]">lines.</i>
        </h1>
        <p className="text-sm text-[var(--mute)] max-w-xl mx-auto">
          Browse openings with Lichess statistics and Stockfish analysis. Add lines directly to your repertoire.
        </p>
      </section>
      <OpeningExplorerClient />
    </PageContainer>
  );
}
