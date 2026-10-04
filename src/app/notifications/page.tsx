import Link from "next/link";
import { Shell } from "@/components/shell";
import { Empty, PageHeader } from "@/components/ui";
import { formatWhen } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { markNotificationsRead } from "@/lib/domain";
import { listNotifications } from "@/lib/queries";

export const metadata = { title: "التنبيهات" };

export default async function NotificationsPage() {
  const ctx = await requireCompany();
  const notices = listNotifications(ctx.company.id, ctx.user.id);
  markNotificationsRead(ctx.company.id, ctx.user.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="التنبيهات" subtitle="ما يخصك: مهمة، تعليق، دعوة، أو إجازة." />
      {notices.length ? (
        <ul className="space-y-2">
          {notices.map((notice) => (
            <li key={notice.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
              {notice.href ? (
                <Link href={notice.href} className="font-extrabold text-[#2563eb]">
                  {notice.title}
                </Link>
              ) : (
                <p className="font-extrabold">{notice.title}</p>
              )}
              {notice.body ? <p className="mt-1 text-sm leading-7 text-[#3c4451]">{notice.body}</p> : null}
              <p className="mt-1 text-xs text-[#8b93a1]">{formatWhen(notice.createdAt, ctx.company.country)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>لا تنبيهات بعد.</Empty>
      )}
    </Shell>
  );
}
