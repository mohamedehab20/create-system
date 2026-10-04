import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { Avatar, PageHeader, Pill, fieldClass, labelClass } from "@/components/ui";
import { addDepartmentAction, addMemberAction, removeDepartmentAction, removeMemberAction, updateMemberAction } from "@/lib/actions";
import { requireCompany } from "@/lib/guard";
import { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/lib/labels";
import { canManagePeople } from "@/lib/permissions";

export const metadata = { title: "الفريق" };

export default async function PeoplePage() {
  const ctx = await requireCompany();
  const manage = canManagePeople(ctx.membership.role);
  return (
    <Shell ctx={ctx}>
      <PageHeader
        title="الفريق"
        subtitle="الأشخاص، المسميات، والأدوار. مالك الشركة يبني المقر، والبيانات تبقى داخل الشركة."
      />
      {manage ? (
        <div id="invite" className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="text-lg font-extrabold">ادعُ فريقك</h2>
          <p className="mt-1 text-xs leading-6 text-[#5c6573]">إذا كان البريد مسجلاً من قبل، يُربط بالحساب الحالي دون تغيير كلمة المرور.</p>
          <ActionForm action={addMemberAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={labelClass}>
              الاسم
              <input name="name" required className={fieldClass} />
            </label>
            <label className={labelClass}>
              البريد
              <input name="email" type="email" required dir="ltr" className={fieldClass} />
            </label>
            <label className={labelClass}>
              المسمى
              <input name="title" className={fieldClass} placeholder="مصمم" />
            </label>
            <label className={labelClass}>
              القسم
              <select name="departmentId" className={fieldClass} defaultValue="">
                <option value="">بدون قسم</option>
                {ctx.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              الدور
              <select name="role" className={fieldClass} defaultValue="employee">
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              كلمة المرور الأولية
              <input name="password" type="password" dir="ltr" className={fieldClass} />
              <span className="mt-1 block text-xs text-[#8b93a1]">لحساب جديد فقط</span>
            </label>
            <div className="md:col-span-2">
              <SubmitButton>إضافة إلى الفريق</SubmitButton>
            </div>
          </ActionForm>
        </div>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-3 font-extrabold">الأقسام</h2>
        <div className="flex flex-wrap items-center gap-2">
          {ctx.departments.map((department) => (
            <div key={department.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-[#e7e9ef]">
              {department.name}
              {manage ? (
                <ConfirmSubmit
                  action={removeDepartmentAction}
                  label="حذف"
                  message={`حذف قسم ${department.name}؟`}
                  hidden={{ departmentId: department.id }}
                />
              ) : null}
            </div>
          ))}
        </div>
        {manage ? (
          <ActionForm action={addDepartmentAction} className="mt-3 flex flex-wrap items-end gap-2">
            <label className={labelClass}>
              قسم جديد
              <input name="name" className={fieldClass} />
            </label>
            <SubmitButton variant="ghost">إضافة القسم</SubmitButton>
          </ActionForm>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3">
        {ctx.members.map((member) => (
          <article key={member.id} className="rounded-3xl bg-white p-4 ring-1 ring-[#e7e9ef]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} />
                <div>
                  <p className="font-extrabold">{member.name}</p>
                  <p className="text-xs text-[#5c6573]" dir="ltr">
                    {member.email}
                  </p>
                </div>
              </div>
              <Pill tone={member.role === "owner" ? "blue" : "slate"}>{ROLE_LABEL[member.role]}</Pill>
            </div>
            <p className="mt-3 text-sm text-[#3c4451]">
              {member.title || "بدون مسمى"} · {member.departmentName || "بدون قسم"}
            </p>
            {manage && member.role !== "owner" ? (
              <ActionForm action={updateMemberAction} className="mt-3 grid gap-2 md:grid-cols-4">
                <input type="hidden" name="membershipId" value={member.id} />
                <label className={labelClass}>
                  المسمى
                  <input name="title" defaultValue={member.title} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  القسم
                  <select name="departmentId" defaultValue={member.departmentId ?? ""} className={fieldClass}>
                    <option value="">بدون قسم</option>
                    {ctx.departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  الدور
                  <select name="role" defaultValue={member.role} className={fieldClass}>
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end gap-3">
                  <SubmitButton variant="ghost">تحديث</SubmitButton>
                </div>
              </ActionForm>
            ) : null}
            {manage && member.role !== "owner" ? (
              <div className="mt-2">
                <ConfirmSubmit
                  action={removeMemberAction}
                  label="إزالة من الشركة"
                  message={`إزالة ${member.name} من الشركة؟`}
                  hidden={{ membershipId: member.id }}
                />
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </Shell>
  );
}
