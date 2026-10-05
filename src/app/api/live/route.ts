import { getSessionUser, preferredCompanyId } from "@/auth/session";
import { loadCompanyContext } from "@/data/store";
import { companyStamp } from "@/realtime/stamp";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ stamp: "" });
  const ctx = loadCompanyContext(user.id, await preferredCompanyId());
  if (!ctx) return Response.json({ stamp: "" });
  return Response.json({ stamp: companyStamp(ctx.company.id, user.id) });
}
