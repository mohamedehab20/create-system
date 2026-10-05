import Link from "next/link";
import { requireCompany } from "@/application/guard";
import { Empty, PageHeader, Stat, StatusPill } from "@/components/ui";
import { listActivity, listFinance, listLeave, listProjects, listTasks } from "@/data/store";
import { formatMoney, greeting, moneyTotals, todayISO, attentionItems, monthKey } from "@/domain/views";
import { actorOf, can } from "@/permissions/can";

export default async function HomePage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const seeMoney = can(actor, "view", { type: "finance", companyId: ctx.company.id });
  const tasks = listTasks(ctx.company.id);
  const projects = listProjects(ctx.company.id);
  const today = todayISO(ctx.company.country);
  const pendingLeave = can(actor, "approve", { type: "leave", companyId: ctx.company.id })
    ? listLeave(ctx.company.id).filter((item) => item.status === "pending").length
    : 0;
  const attention = attentionItems(tasks, today, pendingLeave);
  const openTasks = tasks.filter((task) => task.status !== "done");
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "done");
  const month = monthKey(new Date().toISOString());
  const money = seeMoney ? moneyTotals(listFinance(ctx.company.id), month) : null;
  const activity = listActivity(ctx.company.id);
  return (
    <div>
      <PageHeader title={`${greeting(ctx.company.country)}، ${ctx.user.name}`} subtitle={`${ctx.company.name} · ملخص التشغيل`} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="مشاريع نشطة" value={projects.filter((project) => project.status === "active").length} />
        <Stat label="مهام مفتوحة" value={openTasks.length} />
        <Stat label="متأخرة" value={overdue.length} />
        <Stat label="الفريق" value={ctx.members.length} />
      </div>
      <section className="mt-6">
        <h2 className="mb-3 font-extrabold">يحتاج انتباهك</h2>
        {attention.length ? (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold ring-1 ring-[#e7e9ef]">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>لا شيء عاجل الآن.</Empty>
        )}
      </section>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">مهام مهمة</h2>
          <ul className="mt-3 space-y-3">
            {openTasks.slice(0, 5).map((task) => (
              <li key={task.id}>
                <Link href={`/work/tasks/${task.id}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{task.title}</span>
                  <StatusPill status={task.status} />
                </Link>
              </li>
            ))}
            {openTasks.length === 0 ? <li className="text-sm text-[#5c6573]">لا مهام مفتوحة.</li> : null}
          </ul>
        </section>
        <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">{seeMoney ? "المال هذا الشهر" : "المشاريع"}</h2>
          {seeMoney && money ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <p>
                <span className="block text-[#5c6573]">إيراد</span>
                <span className="font-extrabold">{formatMoney(money.revenue, ctx.company.currency)}</span>
              </p>
              <p>
                <span className="block text-[#5c6573]">مصروف</span>
                <span className="font-extrabold">{formatMoney(money.expense, ctx.company.currency)}</span>
              </p>
              <p>
                <span className="block text-[#5c6573]">الصافي</span>
                <span className="font-extrabold">{formatMoney(money.net, ctx.company.currency)}</span>
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {projects.length ? (
                projects.slice(0, 5).map((project) => (
                  <li key={project.id}>
                    <Link href={`/work/projects/${project.id}`} className="font-semibold">
                      {project.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-[#5c6573]">لا مشاريع بعد.</li>
              )}
            </ul>
          )}
        </section>
      </div>
      <section className="mt-6 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">ماذا تغير</h2>
        {activity.length ? (
          <ul className="mt-3 space-y-2 text-sm leading-7">
            {activity.map((item) => (
              <li key={item.id}>{item.message}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#5c6573]">لا حركة بعد.</p>
        )}
      </section>
    </div>
  );
}
