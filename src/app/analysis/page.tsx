import { AnalysisBoardClient } from "@/components/analysis/AnalysisBoardClient";
import { PageContainer } from "@/components/ui/PageContainer";

export const metadata = {
  title: "Analysis Board — ChessPress",
};

export default function AnalysisPage() {
  return (
    <PageContainer className="py-6 min-h-0 flex-1 flex flex-col">
      <section className="mb-6">
        <div className="font-mono-label">Analysis board</div>
        <h1 className="cp-h2 text-[clamp(32px,5vw,48px)]">
          study the <i>position.</i>
        </h1>
        <p className="text-sm text-[var(--mute)] mt-2">
          Engine analysis, opening recognition, and coach explanations — all synchronized.
        </p>
      </section>
      <AnalysisBoardClient />
    </PageContainer>
  );
}
