import { RepertoireManager } from "@/components/repertoire/RepertoireManager";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHero } from "@/components/ui/PageHero";

export const metadata = {
  title: "Repertoires — ChessPress",
};

export default function RepertoiresPage() {
  return (
    <PageContainer className="py-6">
      <PageHero
        kicker="Repertoires"
        title="track your"
        titleItalic="mastery."
        description="Build opening repertoires, import PGN lines, and watch mastery bars grow as you learn and practice."
        align="center"
      />
      <RepertoireManager />
    </PageContainer>
  );
}
