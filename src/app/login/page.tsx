import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/application/actions";
import { getSessionUser, preferredCompanyId } from "@/auth/session";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";
import { loadCompanyContext } from "@/data/store";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user && loadCompanyContext(user.id, await preferredCompanyId())) redirect("/home");
  if (user) redirect("/onboarding");
  return (
    <AuthScreen
      title="دخول الموظف"
      subtitle="ادخل إلى شركتك وتابع عملك من المقر."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-[#2563eb]">
            إنشاء حساب
          </Link>
        </>
      }
    >
      <ActionForm action={loginAction} className="space-y-4">
        <label className={labelClass}>
          البريد
          <input className={fieldClass} name="email" type="email" dir="ltr" required autoComplete="email" />
        </label>
        <label className={labelClass}>
          كلمة المرور
          <input className={fieldClass} name="password" type="password" dir="ltr" required autoComplete="current-password" />
        </label>
        <SubmitButton>تسجيل الدخول</SubmitButton>
      </ActionForm>
    </AuthScreen>
  );
}
