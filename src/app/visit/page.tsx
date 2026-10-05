import Link from "next/link";
import { Floor } from "@/components/floor";
import { Logo } from "@/components/ui";
import { ROOM_BLUEPRINTS } from "@/domain/catalog";
import { buildFloor } from "@/domain/placement";
import type { Role } from "@/domain/types";

const SAMPLE: { userId: string; name: string; role: Role; departmentName: string }[] = [
  { userId: "1", name: "ليلى حسن", role: "owner", departmentName: "الإدارة" },
  { userId: "2", name: "أحمد نبيل", role: "employee", departmentName: "التصميم" },
  { userId: "3", name: "سارة عادل", role: "manager", departmentName: "التسويق" },
  { userId: "4", name: "كريم فؤاد", role: "employee", departmentName: "المبيعات" },
];

export default function VisitPage() {
  const rooms = buildFloor(
    ROOM_BLUEPRINTS.map((room, index) => ({
      id: room.key,
      key: room.key,
      name: room.name,
      subtitle: room.subtitle,
      href: room.href,
      sortOrder: index,
    })),
    SAMPLE,
  );
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/register" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
          أسّس شركتك
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16">
        <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">معاينة توضيحية للمقر، وليست بيانات شركة.</p>
        <h1 className="mb-6 text-3xl font-extrabold">استوديو تجريبي</h1>
        <Floor rooms={rooms} linked={false} />
      </main>
    </div>
  );
}
