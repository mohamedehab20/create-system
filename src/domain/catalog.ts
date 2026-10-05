import type { Priority, Role, TaskStatus } from "./types";

export const INDUSTRIES = ["تقنية", "تسويق", "تدريب", "استشارات", "خدمات", "تجارة", "أخرى"] as const;
export const SIZES = ["1-5", "6-15", "16-30", "31-100", "أكثر من 100"] as const;
export const COUNTRIES = [
  "مصر",
  "السعودية",
  "الإمارات",
  "الأردن",
  "الكويت",
  "قطر",
  "البحرين",
  "عُمان",
  "المغرب",
  "تونس",
  "الجزائر",
  "العراق",
  "لبنان",
] as const;

export const CURRENCIES = [
  { code: "EGP", label: "جنيه مصري" },
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
] as const;

export const TEMPLATES = [
  { id: "startup", label: "شركة ناشئة", departments: ["الإدارة", "المنتج", "الهندسة", "التسويق", "المالية"] },
  { id: "agency", label: "وكالة تسويق", departments: ["الإدارة", "التسويق", "التصميم", "المالية", "المبيعات"] },
  { id: "training", label: "مكتب تدريب", departments: ["الإدارة", "التدريب", "العمليات", "المالية"] },
  { id: "consulting", label: "استشارات", departments: ["الإدارة", "الاستشارات", "العمليات", "المالية"] },
  { id: "custom", label: "هيكل مخصص", departments: ["الإدارة"] },
] as const;

export const ASSIGNABLE_ROLES: { id: Exclude<Role, "owner">; label: string }[] = [
  { id: "admin", label: "مدير النظام" },
  { id: "manager", label: "مدير" },
  { id: "employee", label: "موظف" },
];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "المالك",
  admin: "مدير النظام",
  manager: "مدير",
  employee: "موظف",
};

export const TASK_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "new", label: "جديدة" },
  { id: "progress", label: "قيد التنفيذ" },
  { id: "blocked", label: "معلّقة" },
  { id: "done", label: "مكتملة" },
];

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "low", label: "منخفضة" },
  { id: "medium", label: "متوسطة" },
  { id: "high", label: "عالية" },
];

export const PROGRESS_STEPS = [0, 25, 50, 75, 100] as const;

export const ROOM_BLUEPRINTS = [
  { key: "reception", name: "الاستقبال", subtitle: "بداية اليوم", href: "/home", x: 0, y: 0 },
  { key: "management", name: "مكتب الإدارة", subtitle: "نبض الشركة", href: "/home", x: 1, y: 0 },
  { key: "meetings", name: "الاجتماعات", subtitle: "المتابعة", href: "/work/tasks", x: 2, y: 0 },
  { key: "operations", name: "العمليات", subtitle: "سير العمل", href: "/work/operations", x: 3, y: 0 },
  { key: "hr", name: "الموارد البشرية", subtitle: "الفريق", href: "/people", x: 4, y: 0 },
  { key: "finance", name: "المالية", subtitle: "المال", href: "/finance", x: 0, y: 1 },
  { key: "marketing", name: "التسويق", subtitle: "المشاريع", href: "/work/projects", x: 1, y: 1 },
  { key: "sales", name: "المبيعات", subtitle: "العمل", href: "/work/projects", x: 2, y: 1 },
  { key: "studio", name: "الاستوديو", subtitle: "التنفيذ", href: "/work/tasks", x: 3, y: 1 },
  { key: "team", name: "غرفة الفريق", subtitle: "باقي الأقسام", href: "/people", x: 4, y: 1 },
] as const;

export const ZONES: Record<string, string> = {
  مصر: "Africa/Cairo",
  السعودية: "Asia/Riyadh",
  الإمارات: "Asia/Dubai",
  الأردن: "Asia/Amman",
  الكويت: "Asia/Kuwait",
  قطر: "Asia/Qatar",
  البحرين: "Asia/Bahrain",
  عُمان: "Asia/Muscat",
  المغرب: "Africa/Casablanca",
  تونس: "Africa/Tunis",
  الجزائر: "Africa/Algiers",
  العراق: "Asia/Baghdad",
  لبنان: "Asia/Beirut",
};

export function templateById(id: string) {
  return TEMPLATES.find((item) => item.id === id) ?? TEMPLATES[0];
}

export function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "pending") return "بانتظار الاعتماد";
  if (status === "approved") return "مقبولة";
  if (status === "rejected") return "مرفوضة";
  return TASK_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export function priorityLabel(priority: string) {
  return PRIORITIES.find((item) => item.id === priority)?.label ?? priority;
}

export function currencySymbol(code: string) {
  if (code === "EGP") return "ج.م";
  if (code === "SAR") return "ر.س";
  if (code === "AED") return "د.إ";
  if (code === "USD") return "$";
  return code;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "م";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}
