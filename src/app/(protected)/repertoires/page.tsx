import { RepertoireManager } from "@/components/repertoire/RepertoireManager";

export const metadata = {
  title: "Repertoires — ChessPress",
};

export default function RepertoiresPage() {
  return (
    <div className="flex-1 max-w-[1000px] mx-auto w-full px-4 py-6">
      <RepertoireManager />
    </div>
  );
}
