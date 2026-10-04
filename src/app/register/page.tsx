import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";
import { registerAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listCompanyIds } from "@/lib/queries";

export const metadata = { title: "إنشاء حساب" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(listCompanyIds(user.id).length ? "/home" : "/onboarding");
  return (
    <AuthScreen title="أنشئ حسابك" subtitle="بعدها تؤسس الشركة وتدخل المقر.">
      <ActionForm action={registerAction} className="grid gap-4">
        <label className={labelClass}>
          الاسم
          <input name="name" required className={fieldClass} placeholder="اسمك" />
        </label>
        <label className={labelClass}>
          البريد
          <input name="email" type="email" required dir="ltr" className={fieldClass} placeholder="name@company.com" />
        </label>
        <label className={labelClass}>
          كلمة المرور
          <input name="password" type="password" required minLength={8} dir="ltr" className={fieldClass} />
          <span className="mt-1 block text-xs font-medium text-[#8b93a1]">8 أحرف على الأقل</span>
        </label>
        <SubmitButton>إنشاء الحساب</SubmitButton>
      </ActionForm>
      <p className="mt-4 text-sm text-[#5c6573]">
        لديك حساب؟{" "}
        <Link href="/login" className="font-bold text-[#2563eb]">
          ادخل
        </Link>
      </p>
    </AuthScreen>
  );
}
