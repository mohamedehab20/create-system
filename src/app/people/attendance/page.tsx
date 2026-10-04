import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { attendanceAction } from "@/lib/actions";
import { formatTime, formatWhen } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { canManageWork } from "@/lib/permissions";
import { listAttendance, openAttendance } from "@/lib/queries";

export const metadata = { title: "الحضور" };

export default async function AttendancePage() {
  const ctx = await requireCompany();
  const open = openAttendance(ctx.company.id, ctx.user.id);
  const records = listAttendance(ctx.company.id, canManageWork(ctx.membership.role) ? undefined : ctx.user.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title="الحضور" subtitle="سجّل دخولك إلى اليوم، ثم الانصراف عندما تنتهي." />
      <form action={attendanceAction} className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
        {open ? <p className="mb-3 text-sm font-semibold">الحضور: {formatTime(open.checkIn, ctx.company.country)}</p> : null}
        <button className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white">
          {open ? "تسجيل الانصراف" : "تسجيل الحضور"}
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {records.map((record) => (
          <li key={record.id} className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#e7e9ef]">
            <span className="font-bold">{record.userName}</span>
            <span className="mr-2 text-[#5c6573]">دخول {formatWhen(record.checkIn, ctx.company.country)}</span>
            <span className="text-[#5c6573]">
              {record.checkOut ? ` · خروج ${formatWhen(record.checkOut, ctx.company.country)}` : " · ما زال حاضرًا"}
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
