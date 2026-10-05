import { redirect } from "next/navigation";
import { createCompanyAction } from "@/application/actions";
import { requireUser } from "@/application/guard";
import { preferredCompanyId } from "@/auth/session";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";
import { COUNTRIES, CURRENCIES, INDUSTRIES, SIZES, TEMPLATES } from "@/domain/catalog";
import { loadCompanyContext } from "@/data/store";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ another?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const existing = loadCompanyContext(user.id, await preferredCompanyId());
  if (existing && params.another !== "1") redirect("/home");
  return (
    <AuthScreen title="أسّس شركتك" subtitle="هوية الشركة والهيكل هما بداية المقر." footer="القوالب تنشئ الأقسام، ويمكنك إضافة أقسام لاحقًا.">
      <ActionForm action={createCompanyAction} className="space-y-4">
        <label className={labelClass}>
          اسم الشركة
          <input className={fieldClass} name="name" required />
        </label>
        <label className={labelClass}>
          المسمى
          <input className={fieldClass} name="title" placeholder="المؤسس" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            النشاط
            <select className={fieldClass} name="industry" defaultValue="تقنية">
              {INDUSTRIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            حجم الفريق
            <select className={fieldClass} name="size" defaultValue="6-15">
              {SIZES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            الدولة
            <select className={fieldClass} name="country" defaultValue="مصر">
              {COUNTRIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            العملة
            <select className={fieldClass} name="currency" defaultValue="EGP">
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          هيكل البداية
          <select className={fieldClass} name="template" defaultValue="startup">
            {TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          الموقع
          <input className={fieldClass} name="website" dir="ltr" placeholder="https://" />
        </label>
        <label className={labelClass}>
          وصف قصير
          <textarea className={fieldClass} name="description" rows={3} />
        </label>
        <SubmitButton>ادخل المقر</SubmitButton>
      </ActionForm>
    </AuthScreen>
  );
}
