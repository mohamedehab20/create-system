import Link from "next/link";
import { readNotificationsAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { Empty, PageHeader } from "@/components/ui";
import { listNotifications } from "@/data/store";
import { formatWhen } from "@/domain/views";

export default async function NotificationsPage() {
  const ctx = await requireCompany();
  const notices = listNotifications(ctx.company.id, ctx.user.id);
  return (
    <div>
      <PageHeader
        title="التنبيهات"
        subtitle="ما يخصك داخل الشركة."
        action={
          <form action={readNotificationsAction}>
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">تعليم الكل كمقروء</button>
          </form>
        }
      />
      {notices.length ? (
        <ul className="space-y-2">
          {notices.map((notice) => (
            <li key={notice.id} className={`rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef] ${notice.readAt ? "opacity-70" : ""}`}>
              <Link href={notice.href || "/home"}>
                <p className="font-extrabold">{notice.title}</p>
                <p className="text-sm leading-7 text-[#5c6573]">{notice.body}</p>
                <p className="text-xs text-[#8b93a1]">{formatWhen(notice.createdAt, ctx.company.country)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>لا تنبيهات.</Empty>
      )}
    </div>
  );
}
