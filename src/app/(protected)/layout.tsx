import { auth } from "@/lib/auth";
import { getAuthSetupError } from "@/lib/auth/readiness";
import { ensureSchema } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";
import { redirect } from "next/navigation";

async function getSessionOrRedirect() {
  try {
    return await auth();
  } catch (err) {
    console.error("[protected layout] session error:", err);
    redirect("/auth/error?error=Configuration");
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setupError = getAuthSetupError();
  if (setupError) {
    redirect(`/auth/error?error=${setupError}`);
  }

  if (hasDatabaseConfig()) {
    const schema = await ensureSchema();
    if (!schema.ok) {
      redirect("/auth/error?error=DatabaseSetup");
    }
  }

  const session = await getSessionOrRedirect();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
