import Link from "next/link";
import { TaskForm } from "@/components/task-form";
import { Shell } from "@/components/shell";
import { PageHeader, StatusPill } from "@/components/ui";
import { requireCompany } from "@/lib/guard";
import { priorityLabel } from "@/lib/labels";
import { listProjects, listTasks } from "@/lib/queries";

export const metadata = { title: "المهام" };

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ctx = await requireCompany();
  const status = (await searchParams).status;
  const tasks = listTasks(ctx.company.id, status ? { status } : undefined);
  const projects = listProjects(ctx.company.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="المهام" subtitle="كل عمل الشركة في قائمة واحدة." />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/work/tasks" className="rounded-full bg-white px-3 py-1 font-bold ring-1 ring-[#e7e9ef]">
          الكل
        </Link>
        {["new", "progress", "blocked", "done"].map((item) => (
          <Link key={item} href={`/work/tasks?status=${item}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-[#e7e9ef]">
            <StatusPill status={item} />
          </Link>
        ))}
      </div>
      <ul className="mb-6 space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link href={`/work/tasks/${task.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
              <span>
                <span className="block font-bold">{task.title}</span>
                <span className="text-xs text-[#5c6573]">
                  {task.projectName} · {priorityLabel(task.priority)} · {task.progress}%
                  {task.assigneeName ? ` · ${task.assigneeName}` : ""}
                </span>
              </span>
              <StatusPill status={task.status} />
            </Link>
          </li>
        ))}
        {!tasks.length ? <li className="text-sm text-[#5c6573]">لا مهام في هذا العرض.</li> : null}
      </ul>
      {projects.length ? <TaskForm projects={projects} departments={ctx.departments} members={ctx.members} /> : null}
    </Shell>
  );
}
