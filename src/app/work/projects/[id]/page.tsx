import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { Shell } from "@/components/shell";
import { Empty, PageHeader, Progress, StatusPill } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { canSeeFinance } from "@/lib/permissions";
import { getProject, listTasks, projectMoney } from "@/lib/queries";

export const metadata = { title: "مشروع" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCompany();
  const { id } = await params;
  const project = getProject(ctx.company.id, id);
  if (!project) notFound();
  const tasks = listTasks(ctx.company.id, { projectId: project.id });
  const money = canSeeFinance(ctx.membership.role) ? projectMoney(ctx.company.id, project.id) : null;
  return (
    <Shell ctx={ctx}>
      <PageHeader
        title={project.name}
        subtitle={project.description || "تفاصيل المشروع."}
        action={<StatusPill status={project.status} />}
      />
      <p className="mb-4 text-sm">
        <Link href="/work/projects" className="font-bold text-[#2563eb]">
          كل المشاريع
        </Link>
      </p>
      {money ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[
            ["الإيراد", money.revenue],
            ["المصروف", money.expense],
            ["الهامش", money.margin],
          ].map(([label, amount]) => (
            <div key={String(label)} className="rounded-3xl bg-white p-4 ring-1 ring-[#e7e9ef]">
              <p className="text-sm text-[#5c6573]">{label}</p>
              <p className="mt-1 font-extrabold">{formatMoney(Number(amount), ctx.company.currency)}</p>
            </div>
          ))}
        </div>
      ) : null}
      <section className="mb-6 space-y-2">
        {tasks.length ? (
          tasks.map((task) => (
            <Link key={task.id} href={`/work/tasks/${task.id}`} className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{task.title}</span>
                <span className="text-xs font-bold">{task.progress}%</span>
              </div>
              <p className="mt-1 text-xs text-[#5c6573]">
                {task.assigneeName || "غير معيّن"}
                {task.departmentName ? ` · ${task.departmentName}` : ""}
              </p>
              <div className="mt-2">
                <Progress value={task.progress} />
              </div>
            </Link>
          ))
        ) : (
          <Empty>لا مهام في هذا المشروع بعد.</Empty>
        )}
      </section>
      <TaskForm projects={[project]} departments={ctx.departments} members={ctx.members} projectId={project.id} />
    </Shell>
  );
}
