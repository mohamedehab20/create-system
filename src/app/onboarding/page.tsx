import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";
import { createCompanyAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { COUNTRIES, CURRENCIES, INDUSTRIES, SIZES, TEMPLATES } from "@/lib/labels";
import { listCompanyIds } from "@/lib/queries";

export const metadata = { title: "أسّس شركتك" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ another?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const another = (await searchParams).another === "1";
  if (!another && listCompanyIds(user.id).length) redirect("/home");
  return (
    <AuthScreen
      wide
      title="أسّس شركتك"
      subtitle={`أهلاً ${user.name}. المقر يبدأ من الشركة لا من أداة. اختر قالبًا يبني الهيكل، ثم تدخل المقر.`}
    >
      <ActionForm action={createCompanyAction} className="grid gap-4 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          اسم الشركة
          <input name="name" required className={fieldClass} />
        </label>
        <label className={labelClass}>
          النشاط
          <select name="industry" className={fieldClass} defaultValue="تقنية">
            {INDUSTRIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          حجم الفريق
          <select name="size" className={fieldClass} defaultValue="6-15">
            {SIZES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          الدولة
          <select name="country" className={fieldClass} defaultValue="مصر">
            {COUNTRIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          العملة
          <select name="currency" className={fieldClass} defaultValue="EGP">
            {CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          قالب البداية
          <select name="template" className={fieldClass} defaultValue="startup">
            {TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          مسماك
          <input name="title" className={fieldClass} placeholder="المؤسس" />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          الموقع
          <input name="website" dir="ltr" className={fieldClass} placeholder="https://" />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          نبذة
          <textarea name="description" className={fieldClass} rows={3} placeholder="ماذا تعمل الشركة؟" />
        </label>
        <div className="sm:col-span-2">
          <SubmitButton>أسّس الشركة وادخل المقر</SubmitButton>
        </div>
      </ActionForm>
    </AuthScreen>
  );
}
