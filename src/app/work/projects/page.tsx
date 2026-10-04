import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { Empty, PageHeader, StatusPill, fieldClass, labelClass } from "@/components/ui";
import { createProjectAction } from "@/lib/actions";
import { requireCompany } from "@/lib/guard";
import { canManageWork } from "@/lib/permissions";
import { listProjects } from "@/lib/queries";

export const metadata = { title: "المشاريع" };

export default async function ProjectsPage() {
  const ctx = await requireCompany();
  const projects = listProjects(ctx.company.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="المشاريع" subtitle="المشروع هو حاوية العمل: الفريق، المهام، والميزانية." />
      {projects.length ? (
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/work/projects/${project.id}`} className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 ring-1 ring-[#e7e9ef]">
                <span>
                  <span className="block font-extrabold">{project.name}</span>
                  {project.description ? <span className="text-sm text-[#5c6573]">{project.description}</span> : null}
                </span>
                <StatusPill status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          ابدأ أول مشروع لشركتك. بعد المشروع تأتي المهام، ثم يرى المدير العمليات.{" "}
          <a href="#new" className="font-bold text-[#2563eb]">
            أنشئ المشروع
          </a>
        </Empty>
      )}
      {canManageWork(ctx.membership.role) ? (
        <div id="new" className="mt-6">
          <ActionForm action={createProjectAction} className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
            <h2 className="text-lg font-extrabold">مشروع جديد</h2>
            <label className={labelClass}>
              الاسم
              <input name="name" required className={fieldClass} placeholder="مشروع العميل" />
            </label>
            <label className={labelClass}>
              الوصف
              <textarea name="description" className={fieldClass} rows={3} />
            </label>
            <SubmitButton>ابدأ المشروع</SubmitButton>
          </ActionForm>
        </div>
      ) : null}
    </Shell>
  );
}
