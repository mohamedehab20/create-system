import { decideLeaveAction, leaveAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, SubmitButton } from "@/components/form";
import { PageHeader, StatusPill, fieldClass, labelClass } from "@/components/ui";
import { listLeave } from "@/data/store";
import { actorOf, can } from "@/permissions/can";

export default async function LeavePage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const approve = can(actor, "approve", { type: "leave", companyId: ctx.company.id });
  const requests = listLeave(ctx.company.id);
  const visible = approve ? requests : requests.filter((item) => item.userId === ctx.user.id);
  const pending = requests.filter((item) => item.status === "pending");
  return (
    <div>
      <PageHeader title="الإجازات" subtitle="اطلب إجازة، والمدير يعتمدها." />
      <ActionForm action={leaveAction} className="mb-6 grid gap-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
        <label className={labelClass}>
          من
          <input className={fieldClass} type="date" name="startDate" required />
        </label>
        <label className={labelClass}>
          إلى
          <input className={fieldClass} type="date" name="endDate" required />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          السبب
          <input className={fieldClass} name="reason" />
        </label>
        <SubmitButton>إرسال الطلب</SubmitButton>
      </ActionForm>
      {approve && pending.length ? (
        <section className="mb-6">
          <h2 className="mb-3 font-extrabold">بانتظار الاعتماد</h2>
          <ul className="space-y-2">
            {pending.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e7e9ef]">
                <div>
                  <p className="font-bold">{item.userName}</p>
                  <p className="text-sm text-[#5c6573]">
                    {item.startDate} — {item.endDate} {item.reason ? `· ${item.reason}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decideLeaveAction}>
                    <input type="hidden" name="leaveId" value={item.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">قبول</button>
                  </form>
                  <form action={decideLeaveAction}>
                    <input type="hidden" name="leaveId" value={item.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">رفض</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#e7e9ef]">
            <span>
              <span className="font-bold">{item.userName}</span>
              <span className="text-[#5c6573]">
                {" "}
                {item.startDate} — {item.endDate}
              </span>
            </span>
            <StatusPill status={item.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
