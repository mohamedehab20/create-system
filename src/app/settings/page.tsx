import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { PageHeader, fieldClass, labelClass } from "@/components/ui";
import { companySettingsAction, profileAction, switchCompanyAction } from "@/lib/actions";
import { requireCompany } from "@/lib/guard";
import { CURRENCIES, ROLE_LABEL } from "@/lib/labels";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const ctx = await requireCompany();
  return (
    <Shell ctx={ctx}>
      <PageHeader title="الإعدادات" subtitle={`${ctx.user.email} · ${ROLE_LABEL[ctx.membership.role]}`} />
      <ActionForm action={profileAction} className="max-w-lg rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">حسابك</h2>
        <label className={`${labelClass} mt-3`}>
          الاسم
          <input name="name" defaultValue={ctx.user.name} required className={fieldClass} />
        </label>
        <div className="mt-3">
          <SubmitButton>حفظ الاسم</SubmitButton>
        </div>
      </ActionForm>

      {ctx.companies.length > 1 ? (
        <form action={switchCompanyAction} className="mt-4 max-w-lg rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">الشركة الحالية</h2>
          <select name="companyId" defaultValue={ctx.company.id} className={`${fieldClass} mt-3`}>
            {ctx.companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <button className="mt-3 rounded-xl bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[#e5e7eb]">تبديل</button>
        </form>
      ) : null}

      {ctx.membership.role === "owner" ? (
        <ActionForm action={companySettingsAction} className="mt-4 max-w-lg rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">الشركة</h2>
          <label className={`${labelClass} mt-3`}>
            الاسم
            <input name="name" defaultValue={ctx.company.name} required className={fieldClass} />
          </label>
          <label className={`${labelClass} mt-3`}>
            العملة
            <select name="currency" defaultValue={ctx.company.currency} className={fieldClass}>
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} mt-3`}>
            الموقع
            <input name="website" defaultValue={ctx.company.website} dir="ltr" className={fieldClass} />
          </label>
          <label className={`${labelClass} mt-3`}>
            نبذة
            <textarea name="description" defaultValue={ctx.company.description} className={fieldClass} rows={3} />
          </label>
          <div className="mt-3">
            <SubmitButton>حفظ الشركة</SubmitButton>
          </div>
        </ActionForm>
      ) : null}

      <p className="mt-6 text-sm">
        <Link href="/onboarding?another=1" className="font-bold text-[#2563eb]">
          أسّس شركة أخرى
        </Link>
      </p>
    </Shell>
  );
}
