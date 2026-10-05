import Link from "next/link";
import { companySettingsAction, profileAction, switchCompanyAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, SubmitButton } from "@/components/form";
import { PageHeader, fieldClass, labelClass } from "@/components/ui";
import { CURRENCIES } from "@/domain/catalog";
import { actorOf, can } from "@/permissions/can";

export default async function SettingsPage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const editCompany = can(actor, "update", { type: "company", companyId: ctx.company.id });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <PageHeader title="الإعدادات" subtitle="حسابك وهوية الشركة." />
      </div>
      <ActionForm action={profileAction} className="space-y-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">اسمك</h2>
        <label className={labelClass}>
          الاسم
          <input className={fieldClass} name="name" defaultValue={ctx.user.name} required />
        </label>
        <SubmitButton>حفظ</SubmitButton>
      </ActionForm>
      {editCompany ? (
        <ActionForm action={companySettingsAction} className="space-y-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">هوية الشركة</h2>
          <label className={labelClass}>
            الاسم
            <input className={fieldClass} name="name" defaultValue={ctx.company.name} required />
          </label>
          <label className={labelClass}>
            العملة
            <select className={fieldClass} name="currency" defaultValue={ctx.company.currency}>
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            الموقع
            <input className={fieldClass} name="website" dir="ltr" defaultValue={ctx.company.website} />
          </label>
          <label className={labelClass}>
            الوصف
            <textarea className={fieldClass} name="description" rows={3} defaultValue={ctx.company.description} />
          </label>
          <SubmitButton>حفظ الهوية</SubmitButton>
        </ActionForm>
      ) : null}
      <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">شركاتك</h2>
        <ul className="mt-3 space-y-2">
          {ctx.companies.map((company) => (
            <li key={company.id}>
              <form action={switchCompanyAction}>
                <input type="hidden" name="companyId" value={company.id} />
                <button className="text-sm font-bold text-[#2563eb]" disabled={company.id === ctx.company.id}>
                  {company.name}
                  {company.id === ctx.company.id ? " · الحالية" : " · انتقال"}
                </button>
              </form>
            </li>
          ))}
        </ul>
        <Link href="/onboarding?another=1" className="mt-4 inline-flex text-sm font-bold text-[#2563eb]">
          تأسيس شركة أخرى
        </Link>
      </section>
    </div>
  );
}
