import { ActionForm, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { PageHeader, StatusPill, fieldClass, labelClass } from "@/components/ui";
import { decideLeaveAction, leaveAction } from "@/lib/actions";
import { requireCompany } from "@/lib/guard";
import { canApproveLeave } from "@/lib/permissions";
import { listLeave } from "@/lib/queries";

export const metadata = { title: "الإجازات" };

export default async function LeavePage() {
  const ctx = await requireCompany();
  const requests = listLeave(ctx.company.id);
  const approve = canApproveLeave(ctx.membership.role);
  const visible = approve ? requests : requests.filter((item) => item.userId === ctx.user.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="الإجازات" subtitle="اطلب إجازة، والمدير يعتمدها أو يرفضها." />
      <ActionForm action={leaveAction} className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-3">
        <label className={labelClass}>
          البداية
          <input type="date" name="startDate" required className={fieldClass} dir="ltr" />
        </label>
        <label className={labelClass}>
          النهاية
          <input type="date" name="endDate" required className={fieldClass} dir="ltr" />
        </label>
        <label className={labelClass}>
          السبب
          <input name="reason" className={fieldClass} />
        </label>
        <div className="md:col-span-3">
          <SubmitButton>طلب الإجازة</SubmitButton>
        </div>
      </ActionForm>
      <ul className="mt-4 space-y-2">
        {visible.map((item) => (
          <li key={item.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">
                {item.userName} · {item.startDate} → {item.endDate}
              </p>
              <StatusPill status={item.status} />
            </div>
            {item.reason ? <p className="mt-1 text-sm text-[#5c6573]">{item.reason}</p> : null}
            {approve && item.status === "pending" ? (
              <div className="mt-2 flex gap-2">
                <form action={decideLeaveAction}>
                  <input type="hidden" name="leaveId" value={item.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">اعتماد</button>
                </form>
                <form action={decideLeaveAction}>
                  <input type="hidden" name="leaveId" value={item.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button className="rounded-xl px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-200">رفض</button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
        {!visible.length ? <li className="text-sm text-[#5c6573]">لا طلبات إجازة.</li> : null}
      </ul>
    </Shell>
  );
}
