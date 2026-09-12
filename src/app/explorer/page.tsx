import { OpeningExplorerClient } from "@/components/explorer/OpeningExplorerClient";

export const metadata = {
  title: "Opening Explorer — ChessPress",
};

export default function ExplorerPage() {
  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Opening Explorer</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Browse openings with Lichess statistics and Stockfish analysis. Add lines to your repertoire.
        </p>
      </div>
      <OpeningExplorerClient />
    </div>
  );
}
