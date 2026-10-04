import { getSessionUser, preferredCompanyId } from "@/lib/auth";
import { latestStamp, loadCompanyContext } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ stamp: "" });
  const ctx = loadCompanyContext(user.id, await preferredCompanyId());
  if (!ctx) return Response.json({ stamp: "" });
  return Response.json({ stamp: latestStamp(ctx.company.id, user.id) });
}
