import { AnalysisBoardClient } from "@/components/analysis/AnalysisBoardClient";

export const metadata = {
  title: "Analysis Board — ChessPress",
};

export default function AnalysisPage() {
  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6 min-h-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Analysis Board</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Engine analysis, opening recognition, and coach explanations — all synchronized.
        </p>
      </div>
      <AnalysisBoardClient />
    </div>
  );
}
