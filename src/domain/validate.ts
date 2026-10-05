import { COUNTRIES, CURRENCIES, INDUSTRIES, PRIORITIES, PROGRESS_STEPS, SIZES, TASK_STATUSES, TEMPLATES } from "./catalog";
import type { Priority, Role, TaskStatus } from "./types";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordError(password: string) {
  if (password.length < 8) return "كلمة المرور 8 أحرف على الأقل";
  return null;
}

export function oneOf<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export type CompanyInput = {
  name: string;
  industry: string;
  size: string;
  country: string;
  currency: string;
  website: string;
  description: string;
  template: string;
  title: string;
};

export function readCompanyInput(raw: CompanyInput): { error: string } | { value: CompanyInput } {
  const name = clean(raw.name);
  if (!name) return { error: "اسم الشركة مطلوب" };
  return {
    value: {
      name,
      industry: oneOf(raw.industry, INDUSTRIES, "تقنية"),
      size: oneOf(raw.size, SIZES, "6-15"),
      country: oneOf(raw.country, COUNTRIES, "مصر"),
      currency: oneOf(raw.currency, CURRENCIES.map((item) => item.code), "EGP"),
      website: raw.website.trim(),
      description: raw.description.trim(),
      template: oneOf(raw.template, TEMPLATES.map((item) => item.id), "startup"),
      title: clean(raw.title),
    },
  };
}

export function parseAmountToCents(input: string) {
  const normalized = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  return cents;
}

export function parseDate(input: string) {
  const value = input.trim();
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

export function parseProgress(input: string) {
  const value = Number(input);
  return PROGRESS_STEPS.find((step) => step === value) ?? null;
}

export function parseStatus(input: string): TaskStatus {
  return oneOf(input, TASK_STATUSES.map((item) => item.id), "new");
}

export function parsePriority(input: string): Priority {
  return oneOf(input, PRIORITIES.map((item) => item.id), "medium");
}

export function parseAssignableRole(input: string): Exclude<Role, "owner"> | null {
  if (input === "admin" || input === "manager" || input === "employee") return input;
  return null;
}

export function withProgress(status: TaskStatus, progress: number): { status: TaskStatus; progress: number } {
  if (status === "done") return { status, progress: 100 };
  if (progress === 100) return { status: "done", progress: 100 };
  if (status === "new" && progress > 0) return { status: "progress", progress };
  return { status, progress };
}
