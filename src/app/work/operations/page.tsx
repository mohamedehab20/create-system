import Link from "next/link";
import { Shell } from "@/components/shell";
import { Empty, PageHeader, Progress } from "@/components/ui";
import { requireCompany } from "@/lib/guard";
import { listProjects, listTasks } from "@/lib/queries";

export const metadata = { title: "العمليات" };

export default async function OperationsPage() {
  const ctx = await requireCompany();
  const projects = listProjects(ctx.company.id).filter((project) => project.status === "active");
  const tasks = listTasks(ctx.company.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="العمليات" subtitle="تقدم كل قسم داخل كل مشروع. من هنا يرى المدير أين يقف العمل." />
      <div className="space-y-4">
        {projects.length ? (
          projects.map((project) => {
            const related = tasks.filter((task) => task.projectId === project.id);
            const groups = new Map<string, { name: string; total: number; count: number }>();
            for (const task of related) {
              const key = task.departmentId ?? "none";
              const current = groups.get(key) ?? { name: task.departmentName ?? "بدون قسم", total: 0, count: 0 };
              current.total += task.progress;
              current.count += 1;
              groups.set(key, current);
            }
            return (
              <section key={project.id} className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
                <h2 className="font-extrabold">
                  <Link href={`/work/projects/${project.id}`} className="hover:text-[#2563eb]">
                    {project.name}
                  </Link>
                </h2>
                <div className="mt-3 space-y-3">
                  {groups.size ? (
                    [...groups.values()].map((group) => {
                      const value = Math.round(group.total / group.count);
                      return (
                        <div key={group.name}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-semibold">{group.name}</span>
                            <span>{value}%</span>
                          </div>
                          <Progress value={value} />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[#5c6573]">لا مهام في هذا المشروع بعد.</p>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <Empty>ابدأ أول مشروع لشركتك. بعد المشروع تأتي المهام، ثم يرى المدير العمليات.</Empty>
        )}
      </div>
    </Shell>
  );
}
