import Link from "next/link";
import { Shell } from "@/components/shell";
import { Empty, PageHeader, StatusPill } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { canSeeFinance } from "@/lib/permissions";
import { listProjects, projectMoney } from "@/lib/queries";

export const metadata = { title: "الأعمال" };

export default async function BusinessPage() {
  const ctx = await requireCompany();
  const projects = listProjects(ctx.company.id);
  const see = canSeeFinance(ctx.membership.role);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="الأعمال" subtitle="المشاريع كأعمال جارية: الحالة، والإيراد، والمصروف." />
      {projects.length ? (
        <ul className="space-y-3">
          {projects.map((project) => {
            const money = see ? projectMoney(ctx.company.id, project.id) : null;
            return (
              <li key={project.id} className="rounded-3xl bg-white p-4 ring-1 ring-[#e7e9ef]">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/work/projects/${project.id}`} className="font-extrabold hover:text-[#2563eb]">
                    {project.name}
                  </Link>
                  <StatusPill status={project.status} />
                </div>
                {money ? (
                  <p className="mt-2 text-sm text-[#5c6573]">
                    الإيراد {formatMoney(money.revenue, ctx.company.currency)} · المصروف {formatMoney(money.expense, ctx.company.currency)} · الهامش{" "}
                    {formatMoney(money.margin, ctx.company.currency)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[#5c6573]">أرقام المال ظاهرة للإدارة.</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>ابدأ أول مشروع لشركتك.</Empty>
      )}
    </Shell>
  );
}
