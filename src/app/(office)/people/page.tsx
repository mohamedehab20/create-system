import { addDepartmentAction, addMemberAction, removeDepartmentAction, removeMemberAction, updateMemberAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/form";
import { Avatar, PageHeader, fieldClass, labelClass } from "@/components/ui";
import { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/domain/catalog";
import { actorOf, can } from "@/permissions/can";

export default async function PeoplePage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const manage = can(actor, "invite", { type: "membership", companyId: ctx.company.id });
  return (
    <div>
      <PageHeader title="الفريق" subtitle="الأشخاص والأقسام والأدوار داخل الشركة." />
      {manage ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <ActionForm action={addMemberAction} className="space-y-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
            <h2 className="font-extrabold">دعوة شخص</h2>
            <label className={labelClass}>
              الاسم
              <input className={fieldClass} name="name" required />
            </label>
            <label className={labelClass}>
              البريد
              <input className={fieldClass} name="email" type="email" dir="ltr" required />
            </label>
            <label className={labelClass}>
              كلمة مرور أولية
              <input className={fieldClass} name="password" type="password" dir="ltr" minLength={8} />
            </label>
            <label className={labelClass}>
              المسمى
              <input className={fieldClass} name="title" />
            </label>
            <label className={labelClass}>
              القسم
              <select className={fieldClass} name="departmentId" defaultValue="">
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
              <select className={fieldClass} name="role" defaultValue="employee">
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton>إضافة</SubmitButton>
          </ActionForm>
          <div className="space-y-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
            <ActionForm action={addDepartmentAction} className="space-y-3">
              <h2 className="font-extrabold">قسم جديد</h2>
              <label className={labelClass}>
                الاسم
                <input className={fieldClass} name="name" required />
              </label>
              <SubmitButton>إضافة القسم</SubmitButton>
            </ActionForm>
            <ul className="space-y-2 pt-2">
              {ctx.departments.map((department) => (
                <li key={department.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{department.name}</span>
                  <ConfirmSubmit action={removeDepartmentAction} label="حذف" message="حذف هذا القسم؟" hidden={{ departmentId: department.id }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-[#5c6573]">تعرض الأقسام: {ctx.departments.map((department) => department.name).join("، ")}</p>
      )}
      <ul className="grid gap-3">
        {ctx.members.map((member) => (
          <li key={member.id} className="rounded-[28px] bg-white p-4 ring-1 ring-[#e7e9ef]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} />
                <div>
                  <p className="font-extrabold">{member.name}</p>
                  <p className="text-sm text-[#5c6573]">
                    {member.title || "بدون مسمى"} · {member.departmentName || "بدون قسم"} · {ROLE_LABEL[member.role]}
                  </p>
                </div>
              </div>
              {manage && member.role !== "owner" ? (
                <ConfirmSubmit action={removeMemberAction} label="إزالة" message="إزالة هذا الشخص من الشركة؟" hidden={{ membershipId: member.id }} />
              ) : null}
            </div>
            {manage && member.role !== "owner" ? (
              <ActionForm action={updateMemberAction} className="mt-4 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="membershipId" value={member.id} />
                <input className={fieldClass} name="title" defaultValue={member.title} placeholder="المسمى" />
                <select className={fieldClass} name="departmentId" defaultValue={member.departmentId ?? ""}>
                  <option value="">بدون قسم</option>
                  {ctx.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                <select className={fieldClass} name="role" defaultValue={member.role}>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <SubmitButton variant="ghost">حفظ</SubmitButton>
              </ActionForm>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
