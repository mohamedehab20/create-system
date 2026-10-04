"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "./ui";

const NAV = [
  {
    label: "المكان",
    items: [
      { href: "/home", label: "الرئيسية" },
      { href: "/headquarters", label: "المقر" },
    ],
  },
  {
    label: "الأشخاص",
    items: [
      { href: "/people", label: "الفريق" },
      { href: "/people/attendance", label: "الحضور" },
      { href: "/people/leave", label: "الإجازات" },
    ],
  },
  {
    label: "العمل",
    items: [
      { href: "/work/projects", label: "المشاريع" },
      { href: "/work/tasks", label: "المهام" },
      { href: "/work/operations", label: "العمليات" },
      { href: "/business", label: "الأعمال" },
    ],
  },
  { label: "المال", items: [{ href: "/business/finance", label: "المالية" }] },
  { label: "النظام", items: [{ href: "/settings", label: "الإعدادات" }] },
];

function active(path: string, href: string) {
  if (path === href) return true;
  if (href === "/work/projects" || href === "/work/tasks") return path.startsWith(`${href}/`);
  return false;
}

function SideNav({ name, role, onNavigate }: { name: string; role: string; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <div className="flex h-full min-h-screen flex-col bg-[#0e1628] text-white">
      <div className="px-5 py-5">
        <Logo />
        <p className="mt-3 text-xs text-white/55">هنا يبدأ كل شيء</p>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-bold text-white/40">{group.label}</p>
            <div className="mt-1 space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold ${
                    active(path, item.href) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-xs text-white/55">{role}</p>
      </div>
    </div>
  );
}

export function AppChrome({
  name,
  role,
  companyName,
  unread,
  logoutAction,
  children,
}: {
  name: string;
  role: string;
  companyName: string;
  unread: number;
  logoutAction: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f4f7fb] md:grid md:grid-cols-[272px_1fr]">
      <aside className="hidden md:block">
        <SideNav name={name} role={role} />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-slate-950/45" aria-label="إغلاق" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 shadow-2xl">
            <SideNav name={name} role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#e7e9ef] bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl px-3 py-2 text-sm font-bold ring-1 ring-[#e5e7eb] md:hidden"
              onClick={() => setOpen(true)}
            >
              القائمة
            </button>
            <div>
              <p className="text-sm font-extrabold text-[#191c1d]">{companyName}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                مباشر
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative rounded-xl px-3 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">
              التنبيهات
              {unread ? (
                <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#2563eb] px-1 text-[10px] text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            <form action={logoutAction}>
              <button className="rounded-xl px-3 py-2 text-sm font-bold text-[#5c6573] ring-1 ring-[#e5e7eb]">خروج</button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
