import { attendanceAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { SubmitButton } from "@/components/submit";
import { PageHeader } from "@/components/ui";
import { listAttendance, openAttendance } from "@/data/store";
import { formatTime, formatWhen, todayISO } from "@/domain/views";
import { actorOf, can } from "@/permissions/can";

export default async function AttendancePage() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const team = can(actor, "view", { type: "attendance", companyId: ctx.company.id, scope: "team" });
  const open = openAttendance(ctx.company.id, ctx.user.id);
  const records = listAttendance(ctx.company.id, team ? undefined : ctx.user.id);
  const today = todayISO(ctx.company.country);
  return (
    <div>
      <PageHeader title="الحضور" subtitle="سجّل دخولك وخروجك. المدير يرى الفريق." />
      <form action={attendanceAction} className="mb-6 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <p className="text-sm text-[#5c6573]">{open ? `حاضر منذ ${formatTime(open.checkIn, ctx.company.country)}` : "لست مسجّل الحضور الآن"}</p>
        <div className="mt-3">
          <SubmitButton>{open ? "تسجيل الانصراف" : "تسجيل الحضور"}</SubmitButton>
        </div>
      </form>
      <ul className="space-y-2">
        {records.slice(0, 30).map((record) => (
          <li key={record.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#e7e9ef]">
            <span className="font-bold">{team ? record.userName : "سجلك"}</span>
            <span>
              {formatWhen(record.checkIn, ctx.company.country)}
              {record.checkOut ? ` — ${formatTime(record.checkOut, ctx.company.country)}` : " — ما زال حاضرًا"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[#8b93a1]">اليوم في توقيت الشركة: {today}</p>
    </div>
  );
}
