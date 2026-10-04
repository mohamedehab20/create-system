import { redirect } from "next/navigation";
import { getSessionUser, preferredCompanyId } from "./auth";
import { loadCompanyContext } from "./queries";
import type { CompanyContext, User } from "./types";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireCompany(): Promise<CompanyContext & { user: User }> {
  const user = await requireUser();
  const ctx = loadCompanyContext(user.id, await preferredCompanyId());
  if (!ctx) redirect("/onboarding");
  return { user, ...ctx };
}
