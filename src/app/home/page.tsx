import Link from "next/link";
import { Empty, PageHeader, Progress, Stat, StatusPill } from "@/components/ui";
import { Shell } from "@/components/shell";
import { requireCompany } from "@/lib/guard";
import { formatMoney, greeting, todayISO } from "@/lib/format";
import { canSeeFinance } from "@/lib/permissions";
import { listActivity, listProjects, listTasks, monthMoney } from "@/lib/queries";

export const metadata = { title: "الرئيسية" };

export default async function HomeDashboard() {
  const ctx = await requireCompany();
  const tasks = listTasks(ctx.company.id);
  const projects = listProjects(ctx.company.id).filter((project) => project.status === "active");
  const today = todayISO(ctx.company.country);
  const open = tasks.filter((task) => task.status !== "done");
  const overdue = open.filter((task) => task.dueDate && task.dueDate < today);
  const dueToday = open.filter((task) => task.dueDate === today);
  const seeMoney = canSeeFinance(ctx.membership.role);
  const money = seeMoney ? monthMoney(ctx.company.id, today.slice(0, 7)) : null;
  const activity = listActivity(ctx.company.id);
  const important = [...open].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });

  return (
    <Shell ctx={ctx}>
      <PageHeader
        title={`${greeting(ctx.company.country)}، ${ctx.user.name}`}
        subtitle={`${ctx.company.name} · ملخص التشغيل: ${projects.length} مشاريع نشطة، ${dueToday.length} مهام مستحقة اليوم، ${overdue.length} متأخرة.`}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="مشاريع نشطة" value={projects.length} />
        <Stat label="مهام مفتوحة" value={open.length} />
        <Stat label="متأخرة" value={overdue.length} />
        <Stat label="الفريق" value={ctx.members.length} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/work/projects#new" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
          مشروع جديد
        </Link>
        <Link href="/people#invite" className="rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">
          ادعُ فريقك
        </Link>
        <Link href="/headquarters" className="rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">
          ادخل المقر
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">يحتاج انتباهك</h2>
          <div className="mt-3">
            {overdue.length ? (
              <ul className="space-y-2">
                {overdue.map((task) => (
                  <li key={task.id}>
                    <Link href={`/work/tasks/${task.id}`} className="font-semibold text-[#2563eb]">
                      {task.title}
                    </Link>
                    <span className="mr-2 text-xs text-[#8b93a1]">النهاية {task.dueDate}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>لا شيء عاجل الآن.</Empty>
            )}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">مهام مهمة</h2>
            <Link href="/work/tasks" className="text-sm font-bold text-[#2563eb]">
              كل المهام
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {important.length ? (
              important.slice(0, 5).map((task) => (
                <Link key={task.id} href={`/work/tasks/${task.id}`} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{task.title}</span>
                    <StatusPill status={task.status} />
                  </div>
                  <p className="mt-1 text-xs text-[#5c6573]">
                    {task.projectName}
                    {task.assigneeName ? ` · ${task.assigneeName}` : ""}
                  </p>
                  <div className="mt-2">
                    <Progress value={task.progress} />
                  </div>
                </Link>
              ))
            ) : (
              <Empty>لا مهام مفتوحة. ابدأ أول مشروع ثم أضف مهمة.</Empty>
            )}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">المال هذا الشهر</h2>
          {money ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-[#5c6573]">الإيراد</p>
                <p className="font-extrabold">{formatMoney(money.revenue, ctx.company.currency)}</p>
              </div>
              <div>
                <p className="text-[#5c6573]">المصروف</p>
                <p className="font-extrabold">{formatMoney(money.expense, ctx.company.currency)}</p>
              </div>
              <div>
                <p className="text-[#5c6573]">الصافي</p>
                <p className="font-extrabold">{formatMoney(money.net, ctx.company.currency)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[#5c6573]">المالية ظاهرة للإدارة.</p>
          )}
        </section>
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">مشاريع نشطة</h2>
          <div className="mt-3 space-y-3">
            {projects.length ? (
              projects.slice(0, 4).map((project) => {
                const related = tasks.filter((task) => task.projectId === project.id);
                const progress = related.length
                  ? Math.round(related.reduce((sum, task) => sum + task.progress, 0) / related.length)
                  : 0;
                return (
                  <Link key={project.id} href={`/work/projects/${project.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{project.name}</span>
                      <span className="text-xs font-bold text-[#5c6573]">{progress}%</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={progress} />
                    </div>
                  </Link>
                );
              })
            ) : (
              <Empty>ابدأ أول مشروع لشركتك.</Empty>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">الفريق</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {ctx.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <span className="font-semibold">{member.name}</span>
                <span className="text-[#5c6573]">{member.title || member.departmentName || "—"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">ماذا تغير</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[#3c4451]">
            {activity.length ? activity.map((item) => <li key={item.id}>{item.message}</li>) : <li>لا حركة بعد.</li>}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
