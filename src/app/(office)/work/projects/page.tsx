import Link from "next/link";
import { createProjectAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, SubmitButton } from "@/components/form";
import { Empty, PageHeader, fieldClass, labelClass } from "@/components/ui";
import { listProjects } from "@/data/store";
import { actorOf, can } from "@/permissions/can";

export default async function ProjectsPage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const manage = can(actor, "create", { type: "project", companyId: ctx.company.id });
  const projects = listProjects(ctx.company.id);
  return (
    <div>
      <PageHeader title="المشاريع" subtitle="كل عمل يبدأ بمشروع داخل الشركة." />
      {manage ? (
        <ActionForm action={createProjectAction} className="mb-6 grid gap-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
          <label className={labelClass}>
            الاسم
            <input className={fieldClass} name="name" required />
          </label>
          <label className={labelClass}>
            الميزانية
            <input className={fieldClass} name="budget" dir="ltr" inputMode="decimal" placeholder="0" />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            الوصف
            <textarea className={fieldClass} name="description" rows={2} />
          </label>
          <SubmitButton>إنشاء المشروع</SubmitButton>
        </ActionForm>
      ) : null}
      {projects.length ? (
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/work/projects/${project.id}`} className="block rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
                <h2 className="font-extrabold">{project.name}</h2>
                {project.description ? <p className="mt-1 text-sm leading-7 text-[#5c6573]">{project.description}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>لا مشاريع بعد. أنشئ المشروع الأول.</Empty>
      )}
    </div>
  );
}
