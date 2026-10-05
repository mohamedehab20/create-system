import { logoutAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { LiveRefresh } from "@/components/live";
import { AppChrome } from "@/components/shell";
import { countUnread } from "@/data/store";
import { ROLE_LABEL } from "@/domain/catalog";
import { actorOf, can } from "@/permissions/can";
import { companyStamp } from "@/realtime/stamp";

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const showFinance = can(actor, "view", { type: "finance", companyId: ctx.company.id });
  return (
    <AppChrome
      name={ctx.user.name}
      role={ROLE_LABEL[ctx.membership.role]}
      companyName={ctx.company.name}
      unread={countUnread(ctx.company.id, ctx.user.id)}
      showFinance={showFinance}
      logoutAction={logoutAction}
    >
      <LiveRefresh stamp={companyStamp(ctx.company.id, ctx.user.id)} />
      {children}
    </AppChrome>
  );
}
