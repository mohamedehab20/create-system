"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession,
  getSessionUser,
  hashPassword,
  rememberCompany,
  setSession,
  verifyPassword,
} from "./auth";
import {
  addComment,
  addDepartment,
  addFinance,
  addMember,
  createCompany,
  createProject,
  createTask,
  decideLeave,
  deleteTask,
  registerUser,
  removeDepartment,
  removeMember,
  requestLeave,
  toggleAttendance,
  updateCompany,
  updateMember,
  updateProfile,
  updateProgress,
  updateTask,
} from "./domain";
import { requireCompany, requireUser } from "./guard";
import { ASSIGNABLE_ROLES, CURRENCIES, PRIORITIES, PROGRESS_STEPS, TASK_STATUSES } from "./labels";
import { canApproveLeave, canManagePeople, canManageWork, canWriteFinance } from "./permissions";
import { getUserByEmail, listCompanyIds, userPasswordHash } from "./queries";
import type { FormState, Priority, Role, TaskStatus } from "./types";

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string) {
  return value ? value : null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function refresh() {
  revalidatePath("/", "layout");
}

function asStatus(value: string): TaskStatus {
  return TASK_STATUSES.some((item) => item.id === value) ? (value as TaskStatus) : "new";
}

function asPriority(value: string): Priority {
  return PRIORITIES.some((item) => item.id === value) ? (value as Priority) : "medium";
}

function asProgress(value: string) {
  const number = Number(value);
  return PROGRESS_STEPS.includes(number) ? number : 0;
}

function asRole(value: string): Exclude<Role, "owner"> {
  return ASSIGNABLE_ROLES.some((item) => item.id === value) ? (value as Exclude<Role, "owner">) : "employee";
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  if (name.length < 2) return { error: "اكتب اسمك" };
  if (!isEmail(email)) return { error: "اكتب بريدًا صحيحًا" };
  if (password.length < 8) return { error: "كلمة المرور 8 أحرف على الأقل" };
  const created = registerUser({ name, email, passwordHash: hashPassword(password) });
  if ("error" in created) return created;
  await setSession(created.userId);
  redirect("/onboarding");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  const hash = userPasswordHash(email);
  if (!hash || !verifyPassword(password, hash)) return { error: "بيانات الدخول غير صحيحة" };
  const user = getUserByEmail(email);
  if (!user) return { error: "بيانات الدخول غير صحيحة" };
  await setSession(user.id);
  const companies = listCompanyIds(user.id);
  redirect(companies.length ? "/home" : "/onboarding");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = field(formData, "name");
  if (name.length < 2) return { error: "اكتب اسم الشركة" };
  const currency = field(formData, "currency");
  const companyId = createCompany(user.id, user.name, {
    name,
    industry: field(formData, "industry") || "تقنية",
    size: field(formData, "size") || "6-15",
    country: field(formData, "country") || "مصر",
    currency: CURRENCIES.some((item) => item.code === currency) ? currency : "EGP",
    website: field(formData, "website"),
    description: field(formData, "description"),
    template: field(formData, "template") || "startup",
    title: field(formData, "title") || "المؤسس",
  });
  await rememberCompany(companyId);
  refresh();
  redirect("/headquarters");
}

export async function switchCompanyAction(formData: FormData) {
  const { user } = await requireCompany();
  const companyId = field(formData, "companyId");
  if (!listCompanyIds(user.id).includes(companyId)) return;
  await rememberCompany(companyId);
  refresh();
  redirect("/home");
}

export async function addMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canManagePeople(ctx.membership.role)) return { error: "إضافة الفريق متاحة للمالك ومدير النظام" };
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  if (name.length < 2) return { error: "اكتب اسم العضو" };
  if (!isEmail(email)) return { error: "اكتب بريدًا صحيحًا" };
  const existing = getUserByEmail(email);
  if (!existing && password.length < 8) return { error: "كلمة المرور الأولية 8 أحرف على الأقل" };
  const departmentId = optional(field(formData, "departmentId"));
  if (departmentId && !ctx.departments.some((item) => item.id === departmentId)) {
    return { error: "القسم غير موجود" };
  }
  const result = addMember({ id: ctx.user.id, name: ctx.user.name }, ctx.company.id, ctx.company.name, {
    name,
    email,
    passwordHash: existing ? null : hashPassword(password),
    title: field(formData, "title"),
    departmentId,
    role: asRole(field(formData, "role")),
  });
  if ("error" in result) return result;
  refresh();
  redirect("/people");
}

export async function updateMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canManagePeople(ctx.membership.role)) return { error: "تعديل الفريق متاح للمالك ومدير النظام" };
  const departmentId = optional(field(formData, "departmentId"));
  if (departmentId && !ctx.departments.some((item) => item.id === departmentId)) {
    return { error: "القسم غير موجود" };
  }
  const result = updateMember(ctx.company.id, {
    membershipId: field(formData, "membershipId"),
    title: field(formData, "title"),
    departmentId,
    role: asRole(field(formData, "role")),
  });
  if ("error" in result) return result;
  refresh();
  redirect("/people");
}

export async function removeMemberAction(formData: FormData) {
  const ctx = await requireCompany();
  if (!canManagePeople(ctx.membership.role)) redirect("/people");
  removeMember(ctx.company.id, field(formData, "membershipId"));
  refresh();
  redirect("/people");
}

export async function addDepartmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canManagePeople(ctx.membership.role)) return { error: "إدارة الأقسام للمالك ومدير النظام" };
  const name = field(formData, "name");
  if (name.length < 2) return { error: "اكتب اسم القسم" };
  const result = addDepartment(ctx.company.id, name);
  if ("error" in result) return result;
  refresh();
  redirect("/people");
}

export async function removeDepartmentAction(formData: FormData) {
  const ctx = await requireCompany();
  if (canManagePeople(ctx.membership.role)) {
    removeDepartment(ctx.company.id, field(formData, "departmentId"));
  }
  refresh();
  redirect("/people");
}

export async function createProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canManageWork(ctx.membership.role)) return { error: "إنشاء المشاريع للمدير ومن فوقه" };
  const name = field(formData, "name");
  if (name.length < 2) return { error: "اكتب اسم المشروع" };
  const id = createProject({ id: ctx.user.id, name: ctx.user.name }, ctx.company.id, {
    name,
    description: field(formData, "description"),
  });
  refresh();
  redirect(`/work/projects/${id}`);
}

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const assigneeId = optional(field(formData, "assigneeId"));
  const departmentId = optional(field(formData, "departmentId"));
  if (assigneeId && !ctx.members.some((member) => member.userId === assigneeId)) {
    return { error: "المسؤول ليس من الفريق" };
  }
  if (departmentId && !ctx.departments.some((item) => item.id === departmentId)) {
    return { error: "القسم غير موجود" };
  }
  const title = field(formData, "title");
  if (title.length < 2) return { error: "اكتب عنوان المهمة" };
  const result = createTask({ id: ctx.user.id, name: ctx.user.name }, ctx.company.id, {
    projectId: field(formData, "projectId"),
    departmentId,
    assigneeId,
    title,
    description: field(formData, "description"),
    priority: asPriority(field(formData, "priority")),
    status: asStatus(field(formData, "status")),
    progress: asProgress(field(formData, "progress")),
    startDate: optional(field(formData, "startDate")),
    dueDate: optional(field(formData, "dueDate")),
  });
  if ("error" in result || !result.id) return { error: "error" in result ? result.error : "تعذر إنشاء المهمة" };
  refresh();
  redirect(`/work/tasks/${result.id}`);
}

export async function updateTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canManageWork(ctx.membership.role)) return { error: "تعديل المهمة للمدير ومن فوقه" };
  const taskId = field(formData, "taskId");
  const departmentId = optional(field(formData, "departmentId"));
  const assigneeId = optional(field(formData, "assigneeId"));
  if (departmentId && !ctx.departments.some((item) => item.id === departmentId)) return { error: "القسم غير موجود" };
  if (assigneeId && !ctx.members.some((member) => member.userId === assigneeId)) return { error: "المسؤول ليس من الفريق" };
  const result = updateTask(ctx.user.id, ctx.company.id, taskId, {
    projectId: field(formData, "projectId"),
    departmentId,
    assigneeId,
    title: field(formData, "title"),
    description: field(formData, "description"),
    priority: asPriority(field(formData, "priority")),
    status: asStatus(field(formData, "status")),
    progress: asProgress(field(formData, "progress")),
    startDate: optional(field(formData, "startDate")),
    dueDate: optional(field(formData, "dueDate")),
  });
  if ("error" in result) return result;
  refresh();
  redirect(`/work/tasks/${taskId}`);
}

export async function updateProgressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const taskId = field(formData, "taskId");
  const result = updateProgress(ctx.user.id, ctx.company.id, taskId, asProgress(field(formData, "progress")));
  if ("error" in result) return result;
  refresh();
  redirect(`/work/tasks/${taskId}`);
}

export async function deleteTaskAction(formData: FormData) {
  const ctx = await requireCompany();
  if (!canManageWork(ctx.membership.role)) redirect("/work/tasks");
  deleteTask(ctx.company.id, field(formData, "taskId"));
  refresh();
  redirect("/work/tasks");
}

export async function commentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const taskId = field(formData, "taskId");
  const body = field(formData, "body");
  if (body.length < 1) return { error: "اكتب التعليق" };
  const result = addComment({ id: ctx.user.id, name: ctx.user.name }, ctx.company.id, taskId, body);
  if ("error" in result) return result;
  refresh();
  redirect(`/work/tasks/${taskId}`);
}

export async function attendanceAction() {
  const ctx = await requireCompany();
  toggleAttendance(ctx.user.id, ctx.user.name, ctx.company.id);
  refresh();
  redirect("/people/attendance");
}

export async function leaveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const startDate = field(formData, "startDate");
  const endDate = field(formData, "endDate");
  if (!startDate || !endDate) return { error: "حدد بداية الإجازة ونهايتها" };
  if (endDate < startDate) return { error: "تاريخ النهاية قبل البداية" };
  const result = requestLeave({ id: ctx.user.id, name: ctx.user.name }, ctx.company.id, {
    startDate,
    endDate,
    reason: field(formData, "reason"),
  });
  if ("error" in result) return result;
  refresh();
  redirect("/people/leave");
}

export async function decideLeaveAction(formData: FormData) {
  const ctx = await requireCompany();
  if (!canApproveLeave(ctx.membership.role)) redirect("/people/leave");
  const status = field(formData, "status") === "rejected" ? "rejected" : "approved";
  decideLeave(ctx.company.id, field(formData, "leaveId"), status);
  refresh();
  redirect("/people/leave");
}

export async function financeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (!canWriteFinance(ctx.membership.role)) return { error: "تسجيل المال للمالك ومدير النظام" };
  const amount = Number(field(formData, "amount"));
  if (!Number.isFinite(amount) || amount <= 0) return { error: "أدخل مبلغًا صحيحًا" };
  const type = field(formData, "type") === "revenue" ? "revenue" : "expense";
  const result = addFinance(ctx.user.id, ctx.company.id, {
    type,
    amount,
    projectId: optional(field(formData, "projectId")),
    note: field(formData, "note"),
  });
  if ("error" in result) return result;
  refresh();
  redirect("/business/finance");
}

export async function profileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const name = field(formData, "name");
  if (name.length < 2) return { error: "اكتب اسمك" };
  updateProfile(user.id, name);
  refresh();
  redirect("/settings");
}

export async function companySettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  if (ctx.membership.role !== "owner") return { error: "بيانات الشركة يعدلها المالك" };
  const name = field(formData, "name");
  if (name.length < 2) return { error: "اكتب اسم الشركة" };
  const currency = field(formData, "currency");
  updateCompany(ctx.company.id, {
    name,
    website: field(formData, "website"),
    description: field(formData, "description"),
    currency: CURRENCIES.some((item) => item.code === currency) ? currency : ctx.company.currency,
  });
  refresh();
  redirect("/settings");
}
