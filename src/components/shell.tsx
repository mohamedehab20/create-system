import { logoutAction } from "@/lib/actions";
import { countUnread, latestStamp } from "@/lib/queries";
import { ROLE_LABEL } from "@/lib/labels";
import type { CompanyContext, User } from "@/lib/types";
import type { ReactNode } from "react";
import { AppChrome } from "./app-chrome";
import { LiveRefresh } from "./live";

export function Shell({
  ctx,
  children,
}: {
  ctx: CompanyContext & { user: User };
  children: ReactNode;
}) {
  const unread = countUnread(ctx.company.id, ctx.user.id);
  const stamp = latestStamp(ctx.company.id, ctx.user.id);
  return (
    <>
      <LiveRefresh stamp={stamp} />
      <AppChrome
        name={ctx.user.name}
        role={ROLE_LABEL[ctx.membership.role]}
        companyName={ctx.company.name}
        unread={unread}
        logoutAction={logoutAction}
      >
        {children}
      </AppChrome>
    </>
  );
}
