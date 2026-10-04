import type { ReactNode } from "react";
import { initials } from "@/lib/labels";
import { statusLabel } from "@/lib/labels";

export const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#e6e8ee] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15";
export const labelClass = "block text-sm font-semibold text-[#191c1d]";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[#191c1d]">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2563eb] text-white shadow-[0_8px_16px_rgba(37,99,235,0.28)]">
        <BuildingIcon />
      </span>
      {compact ? null : <span className="text-lg font-extrabold tracking-tight">المقر</span>}
    </span>
  );
}

export function BuildingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 20V9.5L12 5l8 4.5V20" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" strokeLinejoin="round" />
    </svg>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const palette = ["#2563eb", "#0f766e", "#b45309", "#7c3aed", "#be123c", "#0e7490"];
  const color = palette[name.charCodeAt(0) % palette.length];
  const box = size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs";
  return (
    <span className={`grid place-items-center rounded-full font-bold text-white ${box}`} style={{ background: color }}>
      {initials(name)}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-[#191c1d]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm leading-7 text-[#5c6573]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-[#e7e9ef]">
      <div className="text-sm text-[#5c6573]">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-[#191c1d]">{value}</div>
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e7eefc]">
      <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "green" | "amber" | "red" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function statusTone(status: string): "slate" | "blue" | "green" | "amber" {
  if (status === "progress") return "blue";
  if (status === "done" || status === "approved" || status === "active") return "green";
  if (status === "blocked" || status === "pending") return "amber";
  return "slate";
}

export function StatusPill({ status }: { status: string }) {
  const label = status === "active" ? "نشط" : status === "pending" ? "بانتظار" : status === "approved" ? "معتمدة" : status === "rejected" ? "مرفوضة" : statusLabel(status);
  return <Pill tone={status === "rejected" ? "red" : statusTone(status)}>{label}</Pill>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-[#f8fafc] px-4 py-6 text-sm leading-7 text-[#5c6573]">{children}</p>;
}
