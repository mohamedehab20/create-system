import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";
import { loginAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listCompanyIds } from "@/lib/queries";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(listCompanyIds(user.id).length ? "/home" : "/onboarding");
  return (
    <AuthScreen title="ادخل المقر" subtitle="البريد وكلمة المرور التي أنشأت بهما حسابك.">
      <ActionForm action={loginAction} className="grid gap-4">
        <label className={labelClass}>
          البريد
          <input name="email" type="email" required dir="ltr" className={fieldClass} placeholder="name@company.com" />
        </label>
        <label className={labelClass}>
          كلمة المرور
          <input name="password" type="password" required dir="ltr" className={fieldClass} />
        </label>
        <SubmitButton>تسجيل الدخول</SubmitButton>
      </ActionForm>
      <p className="mt-4 text-sm text-[#5c6573]">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-bold text-[#2563eb]">
          إنشاء حساب
        </Link>
      </p>
    </AuthScreen>
  );
}
