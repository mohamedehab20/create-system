import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/application/actions";
import { getSessionUser } from "@/auth/session";
import { AuthScreen } from "@/components/auth-screen";
import { ActionForm, SubmitButton } from "@/components/form";
import { fieldClass, labelClass } from "@/components/ui";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/home");
  return (
    <AuthScreen
      title="أسّس حسابك"
      subtitle="بعد الحساب تبني هوية الشركة، ثم تدعو الفريق."
      footer={
        <>
          لديك حساب؟{" "}
          <Link href="/login" className="font-bold text-[#2563eb]">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <ActionForm action={registerAction} className="space-y-4">
        <label className={labelClass}>
          الاسم
          <input className={fieldClass} name="name" required autoComplete="name" />
        </label>
        <label className={labelClass}>
          البريد
          <input className={fieldClass} name="email" type="email" dir="ltr" required autoComplete="email" />
        </label>
        <label className={labelClass}>
          كلمة المرور
          <input className={fieldClass} name="password" type="password" dir="ltr" required minLength={8} autoComplete="new-password" />
        </label>
        <SubmitButton>إنشاء الحساب</SubmitButton>
      </ActionForm>
    </AuthScreen>
  );
}
