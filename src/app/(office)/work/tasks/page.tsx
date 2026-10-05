import Link from "next/link";
import { createTaskAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { TaskForm } from "@/components/task-form";
import { Empty, PageHeader, StatusPill } from "@/components/ui";
import { listProjects, listTasks } from "@/data/store";
import { TASK_STATUSES } from "@/domain/catalog";
import { actorOf, can } from "@/permissions/can";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ctx = await requireCompany();
  const params = await searchParams;
  const status = TASK_STATUSES.some((item) => item.id === params.status) ? params.status : undefined;
  const tasks = listTasks(ctx.company.id, { status });
  const projects = listProjects(ctx.company.id);
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const canCreate = can(actor, "create", { type: "task", companyId: ctx.company.id }) && projects.length > 0;
  return (
    <div>
      <PageHeader title="المهام" subtitle="التعيين والتقدم والتعليقات تعيش مع المهمة." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/work/tasks" className={`rounded-full px-3 py-1 text-sm font-bold ${!status ? "bg-[#2563eb] text-white" : "bg-white ring-1 ring-[#e7e9ef]"}`}>
          الكل
        </Link>
        {TASK_STATUSES.map((item) => (
          <Link
            key={item.id}
            href={`/work/tasks?status=${item.id}`}
            className={`rounded-full px-3 py-1 text-sm font-bold ${status === item.id ? "bg-[#2563eb] text-white" : "bg-white ring-1 ring-[#e7e9ef]"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {canCreate ? <TaskForm action={createTaskAction} projects={projects} departments={ctx.departments} members={ctx.members} /> : null}
      {tasks.length ? (
        <ul className="mt-6 space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={`/work/tasks/${task.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
                <span>
                  <span className="font-bold">{task.title}</span>
                  <span className="mt-1 block text-xs text-[#5c6573]">
                    {task.projectName} · {task.assigneeName || "بدون تعيين"}
                  </span>
                </span>
                <StatusPill status={task.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <Empty>لا مهام في هذا العرض.</Empty>
        </div>
      )}
    </div>
  );
}
