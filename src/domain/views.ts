import { ZONES, currencySymbol } from "./catalog";
import type { TaskStatus } from "./types";

export function formatMoney(cents: number, currency: string) {
  const amount = cents / 100;
  const formatted = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${currencySymbol(currency)}`;
}

export function zoneFor(country?: string) {
  return (country && ZONES[country]) || "Africa/Cairo";
}

export function todayISO(country?: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zoneFor(country),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function hourIn(country?: string, now = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: zoneFor(country),
    hour: "numeric",
    hourCycle: "h23",
  }).format(now);
  return Number(hour);
}

export function greeting(country?: string, now = new Date()) {
  return hourIn(country, now) < 12 ? "صباح الخير" : "مساء الخير";
}

export function formatWhen(iso: string, country?: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: zoneFor(country),
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(iso: string, country?: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: zoneFor(country),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export type OpsCell = {
  projectId: string;
  projectName: string;
  departmentName: string;
  progress: number;
  taskCount: number;
};

export function operationsMatrix(
  projects: { id: string; name: string }[],
  tasks: { projectId: string; departmentName: string | null; progress: number }[],
): OpsCell[] {
  const names = new Map(projects.map((project) => [project.id, project.name]));
  const buckets = new Map<string, OpsCell>();
  for (const task of tasks) {
    const departmentName = task.departmentName ?? "بدون قسم";
    const key = `${task.projectId}:${departmentName}`;
    const current = buckets.get(key);
    if (!current) {
      buckets.set(key, {
        projectId: task.projectId,
        projectName: names.get(task.projectId) ?? "مشروع",
        departmentName,
        progress: task.progress,
        taskCount: 1,
      });
      continue;
    }
    current.progress += task.progress;
    current.taskCount += 1;
  }
  return [...buckets.values()]
    .map((cell) => ({ ...cell, progress: Math.round(cell.progress / cell.taskCount) }))
    .sort((a, b) => a.projectName.localeCompare(b.projectName, "ar") || a.departmentName.localeCompare(b.departmentName, "ar"));
}

export type AttentionItem = { title: string; href: string };

export function attentionItems(
  tasks: { id: string; title: string; status: TaskStatus; dueDate: string | null }[],
  today: string,
  pendingLeave: number,
): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const task of tasks) {
    if (task.dueDate && task.dueDate < today && task.status !== "done") {
      items.push({ title: `متأخرة: ${task.title}`, href: `/work/tasks/${task.id}` });
    }
  }
  for (const task of tasks) {
    if (task.status === "blocked") items.push({ title: `معلّقة: ${task.title}`, href: `/work/tasks/${task.id}` });
  }
  if (pendingLeave > 0) items.push({ title: `${pendingLeave} طلب إجازة بانتظار الاعتماد`, href: "/people/leave" });
  return items.slice(0, 6);
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function moneyTotals(entries: { type: "revenue" | "expense"; amountCents: number; createdAt: string }[], month: string) {
  let revenue = 0;
  let expense = 0;
  for (const entry of entries) {
    if (!entry.createdAt.startsWith(month)) continue;
    if (entry.type === "revenue") revenue += entry.amountCents;
    else expense += entry.amountCents;
  }
  return { revenue, expense, net: revenue - expense };
}

export function projectMoney(entries: { type: "revenue" | "expense"; amountCents: number }[]) {
  let revenue = 0;
  let expense = 0;
  for (const entry of entries) {
    if (entry.type === "revenue") revenue += entry.amountCents;
    else expense += entry.amountCents;
  }
  return { revenue, expense, net: revenue - expense };
}
