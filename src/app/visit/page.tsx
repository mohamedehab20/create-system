import Link from "next/link";
import { Floor } from "@/components/floor";
import { Logo } from "@/components/ui";
import { buildFloor } from "@/lib/floor-data";
import type { Role } from "@/lib/types";

export const metadata = { title: "زيارة المقر" };

const SAMPLE: { userId: string; name: string; role: Role; departmentName: string | null }[] = [
  { userId: "1", name: "ليلى حسن", role: "owner", departmentName: "الإدارة" },
  { userId: "2", name: "أحمد نبيل", role: "employee", departmentName: "التصميم" },
  { userId: "3", name: "سارة عادل", role: "manager", departmentName: "التسويق" },
  { userId: "4", name: "كريم فؤاد", role: "employee", departmentName: "المبيعات" },
];

export default function VisitPage() {
  const rooms = buildFloor(SAMPLE).map((room) => ({ ...room, href: "/register" }));
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/register" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
          أسّس شركتك
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16">
        <p className="text-sm font-bold text-[#2563eb]">معاينة توضيحية للمقر، وليست بيانات شركة.</p>
        <h1 className="mt-2 text-3xl font-extrabold">ادخل كزائر وشوف شكل المقر</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5c6573]">
          الاستقبال مفتوح. المكاتب تمتلئ عندما تؤسس الشركة وتدعو الفريق. هذه معاينة ثابتة، وبياناتك تبقى داخل شركتك.
        </p>
        <div className="mt-6">
          <Floor rooms={rooms} />
        </div>
      </main>
    </div>
  );
}
