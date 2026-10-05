import { requireCompany } from "@/application/guard";
import { Empty, PageHeader, Progress } from "@/components/ui";
import { listProjects, listTasks } from "@/data/store";
import { operationsMatrix } from "@/domain/views";

export default async function OperationsPage() {
  const ctx = await requireCompany();
  const projects = listProjects(ctx.company.id);
  const cells = operationsMatrix(projects, listTasks(ctx.company.id));
  const grouped = new Map<string, typeof cells>();
  for (const cell of cells) {
    const list = grouped.get(cell.projectId) ?? [];
    list.push(cell);
    grouped.set(cell.projectId, list);
  }
  return (
    <div>
      <PageHeader title="مركز العمليات" subtitle="تقدم كل قسم داخل كل مشروع. بلا أرقام مالية." />
      {projects.length && cells.length ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <section key={project.id} className="rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
              <h2 className="font-extrabold">{project.name}</h2>
              <ul className="mt-4 space-y-3">
                {(grouped.get(project.id) ?? []).map((cell) => (
                  <li key={`${cell.projectId}-${cell.departmentName}`}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-bold">{cell.departmentName}</span>
                      <span>
                        {cell.progress}% · {cell.taskCount} مهام
                      </span>
                    </div>
                    <Progress value={cell.progress} />
                  </li>
                ))}
                {!grouped.get(project.id)?.length ? <li className="text-sm text-[#5c6573]">لا مهام بعد.</li> : null}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <Empty>أنشئ مشروعًا ومهامًا ليظهر سير العمل هنا.</Empty>
      )}
    </div>
  );
}
