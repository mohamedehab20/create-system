import Link from "next/link";
import { notFound } from "next/navigation";
import { createTaskAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { TaskForm } from "@/components/task-form";
import { PageHeader, Progress, StatusPill } from "@/components/ui";
import { getProject, listFinance, listTasks } from "@/data/store";
import { formatMoney, projectMoney } from "@/domain/views";
import { actorOf, can } from "@/permissions/can";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCompany();
  const { id } = await params;
  const project = getProject(ctx.company.id, id);
  if (!project) notFound();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const seeMoney = can(actor, "view", { type: "finance", companyId: ctx.company.id });
  const tasks = listTasks(ctx.company.id, { projectId: project.id });
  const money = seeMoney ? projectMoney(listFinance(ctx.company.id).filter((entry) => entry.projectId === project.id)) : null;
  const average = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0;
  return (
    <div>
      <PageHeader title={project.name} subtitle={project.description || "مشروع داخل المقر"} />
      <div className="mb-6 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>تقدم المهام</span>
          <span>{average}%</span>
        </div>
        <Progress value={average} />
        {seeMoney && money ? (
          <p className="mt-4 text-sm text-[#5c6573]">
            الميزانية {formatMoney(project.budgetCents, ctx.company.currency)} · الصافي {formatMoney(money.net, ctx.company.currency)}
          </p>
        ) : null}
      </div>
      <TaskForm action={createTaskAction} departments={ctx.departments} members={ctx.members} projectId={project.id} />
      <ul className="mt-6 space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link href={`/work/tasks/${task.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
              <span>
                <span className="font-bold">{task.title}</span>
                <span className="mt-1 block text-xs text-[#5c6573]">{task.assigneeName || "بدون تعيين"}</span>
              </span>
              <StatusPill status={task.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
