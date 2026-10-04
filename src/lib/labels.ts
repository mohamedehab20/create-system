import type { Priority, Role, TaskStatus } from "./types";

export const INDUSTRIES = ["تقنية", "تسويق", "تدريب", "استشارات", "خدمات", "تجارة", "أخرى"];
export const SIZES = ["1-5", "6-15", "16-30", "31-100", "أكثر من 100"];
export const COUNTRIES = ["مصر", "السعودية", "الإمارات", "الأردن", "الكويت", "قطر", "البحرين", "عُمان", "المغرب", "تونس", "الجزائر", "العراق", "لبنان"];

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

export const PROGRESS_STEPS = [0, 25, 50, 75, 100];

export const ROOMS = [
  { id: "reception", name: "الاستقبال", subtitle: "بداية اليوم", href: "/home" },
  { id: "management", name: "مكتب الإدارة", subtitle: "نبض الشركة", href: "/home" },
  { id: "meetings", name: "الاجتماعات", subtitle: "المتابعة", href: "/work/tasks" },
  { id: "operations", name: "العمليات", subtitle: "سير العمل", href: "/work/operations" },
  { id: "hr", name: "الموارد البشرية", subtitle: "الفريق", href: "/people" },
  { id: "finance", name: "المالية", subtitle: "المال", href: "/business/finance" },
  { id: "marketing", name: "التسويق", subtitle: "المشاريع", href: "/work/projects" },
  { id: "sales", name: "المبيعات", subtitle: "العمل التجاري", href: "/business" },
  { id: "studio", name: "الاستوديو", subtitle: "التنفيذ", href: "/work/tasks" },
  { id: "team", name: "غرفة الفريق", subtitle: "باقي الأقسام", href: "/people" },
] as const;

export function templateById(id: string) {
  return TEMPLATES.find((item) => item.id === id) ?? TEMPLATES[0];
}

export function statusLabel(status: string) {
  return TASK_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export function priorityLabel(priority: string) {
  return PRIORITIES.find((item) => item.id === priority)?.label ?? priority;
}

export function roomIdFor(departmentName: string | null, role: Role) {
  if (role === "owner" || departmentName === "الإدارة") return "management";
  switch (departmentName) {
    case "المالية":
      return "finance";
    case "التسويق":
      return "marketing";
    case "المبيعات":
      return "sales";
    case "التصميم":
    case "الهندسة":
    case "المنتج":
    case "التدريب":
    case "الاستشارات":
      return "studio";
    case "العمليات":
      return "operations";
    case "الموارد البشرية":
      return "hr";
    default:
      return "team";
  }
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "م";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}
