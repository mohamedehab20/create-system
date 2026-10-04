import { ActionForm, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { PageHeader, Stat, fieldClass, labelClass } from "@/components/ui";
import { financeAction } from "@/lib/actions";
import { formatMoney, formatWhen, todayISO } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { canSeeFinance, canWriteFinance } from "@/lib/permissions";
import { listFinance, listProjects, monthMoney } from "@/lib/queries";

export const metadata = { title: "المالية" };

export default async function FinancePage() {
  const ctx = await requireCompany();
  const see = canSeeFinance(ctx.membership.role);
  if (!see) {
    return (
      <Shell ctx={ctx}>
        <PageHeader title="المالية" subtitle="غرفة المالية للإدارة." />
        <p className="rounded-3xl bg-white p-6 text-sm leading-8 ring-1 ring-[#e7e9ef]">
          غرفة المالية للإدارة. المبالغ لا تظهر إلا للمالك ومدير النظام والمدير.
        </p>
      </Shell>
    );
  }
  const month = todayISO(ctx.company.country).slice(0, 7);
  const summary = monthMoney(ctx.company.id, month);
  const entries = listFinance(ctx.company.id);
  const projects = listProjects(ctx.company.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="المالية" subtitle="ملخص الشهر، والإيراد، والمصروف. هذه ليست محاسبة كاملة." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="الإيراد" value={formatMoney(summary.revenue, ctx.company.currency)} />
        <Stat label="المصروف" value={formatMoney(summary.expense, ctx.company.currency)} />
        <Stat label="الصافي" value={formatMoney(summary.net, ctx.company.currency)} />
      </div>
      {canWriteFinance(ctx.membership.role) ? (
        <ActionForm action={financeAction} className="mt-5 grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
          <label className={labelClass}>
            النوع
            <select name="type" className={fieldClass} defaultValue="expense">
              <option value="expense">مصروف</option>
              <option value="revenue">إيراد</option>
            </select>
          </label>
          <label className={labelClass}>
            المبلغ
            <input name="amount" type="number" min="0" step="0.01" required dir="ltr" className={fieldClass} />
          </label>
          <label className={labelClass}>
            المشروع
            <select name="projectId" className={fieldClass} defaultValue="">
              <option value="">بدون مشروع</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            ملاحظة
            <input name="note" className={fieldClass} />
          </label>
          <div className="md:col-span-2">
            <SubmitButton>تسجيل</SubmitButton>
          </div>
        </ActionForm>
      ) : null}
      <ul className="mt-4 space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#e7e9ef]">
            <span>
              <span className="font-bold">{entry.type === "expense" ? "مصروف" : "إيراد"}</span>
              {entry.note ? <span className="mr-2 text-[#5c6573]">{entry.note}</span> : null}
              {entry.projectName ? <span className="mr-2 text-[#5c6573]">· {entry.projectName}</span> : null}
            </span>
            <span className="font-extrabold">
              {formatMoney(entry.amount, ctx.company.currency)}
              <span className="mr-2 text-xs font-medium text-[#8b93a1]">{formatWhen(entry.createdAt, ctx.company.country)}</span>
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
