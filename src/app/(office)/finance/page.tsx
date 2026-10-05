import { financeAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, SubmitButton } from "@/components/form";
import { Empty, PageHeader, Stat, fieldClass, labelClass } from "@/components/ui";
import { listFinance, listProjects } from "@/data/store";
import { formatMoney, formatWhen, moneyTotals, monthKey } from "@/domain/views";
import { actorOf, can } from "@/permissions/can";

export default async function FinancePage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const see = can(actor, "view", { type: "finance", companyId: ctx.company.id });
  if (!see) {
    return (
      <div>
        <PageHeader title="المالية" subtitle="غرفة المالية للإدارة." />
        <Empty>المالية ظاهرة للإدارة. يمكنك دخول الغرفة، والمبالغ تبقى خاصة بالإدارة.</Empty>
      </div>
    );
  }
  const write = can(actor, "create", { type: "finance", companyId: ctx.company.id });
  const entries = listFinance(ctx.company.id);
  const month = monthKey(new Date().toISOString());
  const totals = moneyTotals(entries, month);
  const projects = listProjects(ctx.company.id);
  return (
    <div>
      <PageHeader title="المالية" subtitle="ملخص الشهر، والإيراد، والمصروف، وميزانية المشروع." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="إيراد" value={formatMoney(totals.revenue, ctx.company.currency)} />
        <Stat label="مصروف" value={formatMoney(totals.expense, ctx.company.currency)} />
        <Stat label="الصافي" value={formatMoney(totals.net, ctx.company.currency)} />
      </div>
      {write ? (
        <ActionForm action={financeAction} className="mb-6 grid gap-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
          <label className={labelClass}>
            النوع
            <select className={fieldClass} name="type" defaultValue="expense">
              <option value="expense">مصروف</option>
              <option value="revenue">إيراد</option>
            </select>
          </label>
          <label className={labelClass}>
            المبلغ
            <input className={fieldClass} name="amount" dir="ltr" inputMode="decimal" required />
          </label>
          <label className={labelClass}>
            المشروع
            <select className={fieldClass} name="projectId" defaultValue="">
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
            <input className={fieldClass} name="note" />
          </label>
          <SubmitButton>إضافة قيد</SubmitButton>
        </ActionForm>
      ) : null}
      {entries.length ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#e7e9ef]">
              <span>
                <span className="font-bold">{entry.type === "revenue" ? "إيراد" : "مصروف"}</span>
                <span className="text-[#5c6573]"> {entry.projectName ? `· ${entry.projectName}` : ""} {entry.note}</span>
              </span>
              <span className="font-extrabold">
                {formatMoney(entry.amountCents, ctx.company.currency)}
                <span className="mr-2 font-normal text-[#8b93a1]">{formatWhen(entry.createdAt, ctx.company.country)}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>لا قيود بعد.</Empty>
      )}
    </div>
  );
}
