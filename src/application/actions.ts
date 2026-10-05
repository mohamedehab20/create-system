"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword } from "@/auth/password";
import { clearSession, rememberCompany, setSession } from "@/auth/session";
import { CURRENCIES } from "@/domain/catalog";
import { mail } from "@/integrations/mail";
import {
  addComment,
  addDepartment,
  addFinance,
  addMember,
  countOwners,
  createProject,
  createTask,
  decideLeave,
  deleteTask,
  departmentInCompany,
  findUserByEmail,
  foundCompany,
  getProject,
  listCompaniesForUser,
  getTask,
  insertUser,
  markNotificationsRead,
  memberUserIds,
  membershipForEmail,
  passwordHashFor,
  removeDepartment,
  removeMember,
  requestLeave,
  toggleAttendance,
  updateCompany,
  updateMember,
  updateProgress,
  updateTask,
  updateUserName,
} from "@/data/store";
import type { FormState } from "@/domain/types";
import {
  clean,
  normalizeEmail,
  parseAmountToCents,
  parseAssignableRole,
  parseDate,
  parsePriority,
  parseProgress,
  parseStatus,
  passwordError,
  readCompanyInput,
  withProgress,
  isEmail,
} from "@/domain/validate";
import { actorOf, can } from "@/permissions/can";
import { requireCompany, requireUser } from "./guard";

function denied(): FormState {
  return { error: "لا تملك صلاحية هذا الإجراء" };
}

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = clean(field(formData, "name"));
  const email = normalizeEmail(field(formData, "email"));
  const password = field(formData, "password");
  if (!name) return { error: "الاسم مطلوب" };
  if (!isEmail(email)) return { error: "البريد غير صالح" };
  const passwordIssue = passwordError(password);
  if (passwordIssue) return { error: passwordIssue };
  if (findUserByEmail(email)) return { error: "هذا البريد مسجّل بالفعل" };
  const userId = insertUser({ name, email, passwordHash: hashPassword(password) });
  await setSession(userId);
  redirect("/onboarding");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(field(formData, "email"));
  const password = field(formData, "password");
  const stored = passwordHashFor(email);
  const user = findUserByEmail(email);
  if (!stored || !user || !verifyPassword(password, stored)) return { error: "البريد أو كلمة المرور غير صحيحة" };
  await setSession(user.id);
  redirect("/home");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = readCompanyInput({
    name: field(formData, "name"),
    industry: field(formData, "industry"),
    size: field(formData, "size"),
    country: field(formData, "country"),
    currency: field(formData, "currency"),
    website: field(formData, "website"),
    description: field(formData, "description"),
    template: field(formData, "template"),
    title: field(formData, "title"),
  });
  if ("error" in parsed) return parsed;
  const companyId = foundCompany(user.id, user.name, parsed.value);
  await rememberCompany(companyId);
  redirect("/headquarters");
}

export async function switchCompanyAction(formData: FormData) {
  const user = await requireUser();
  const companyId = field(formData, "companyId");
  const allowed = listCompaniesForUser(user.id).some((company) => company.id === companyId);
  if (!allowed) return;
  await rememberCompany(companyId);
  redirect("/home");
}

export async function addDepartmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "department", companyId: ctx.company.id })) return denied();
  const name = clean(field(formData, "name"));
  if (!name) return { error: "اسم القسم مطلوب" };
  const result = addDepartment(ctx.company.id, name);
  if ("error" in result) return result;
  revalidatePath("/people");
  return {};
}

export async function removeDepartmentAction(formData: FormData) {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "delete", { type: "department", companyId: ctx.company.id })) return;
  removeDepartment(ctx.company.id, field(formData, "departmentId"));
  revalidatePath("/people");
}

export async function addMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "invite", { type: "membership", companyId: ctx.company.id })) return denied();
  const name = clean(field(formData, "name"));
  const email = normalizeEmail(field(formData, "email"));
  const role = parseAssignableRole(field(formData, "role"));
  const departmentId = field(formData, "departmentId") || null;
  if (!name) return { error: "الاسم مطلوب" };
  if (!isEmail(email)) return { error: "البريد غير صالح" };
  if (!role) return { error: "الدور غير صالح" };
  if (departmentId && !departmentInCompany(ctx.company.id, departmentId)) return { error: "القسم غير موجود" };
  const existing = findUserByEmail(email);
  let passwordHash: string | null = null;
  if (!existing) {
    const issue = passwordError(field(formData, "password"));
    if (issue) return { error: issue };
    passwordHash = hashPassword(field(formData, "password"));
  }
  if (existing && membershipForEmail(ctx.company.id, email)) return { error: "هذا البريد عضو في الشركة بالفعل" };
  const result = addMember({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    companyName: ctx.company.name,
    name,
    email,
    passwordHash,
    title: clean(field(formData, "title")),
    departmentId,
    role,
  });
  if ("error" in result) return result;
  await mail.send({
    to: email,
    subject: `دعوة إلى ${ctx.company.name}`,
    body: `${ctx.user.name} أضافك إلى مقر ${ctx.company.name}`,
  });
  revalidatePath("/people");
  revalidatePath("/headquarters");
  return {};
}

export async function updateMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "update", { type: "membership", companyId: ctx.company.id })) return denied();
  const role = parseAssignableRole(field(formData, "role"));
  const departmentId = field(formData, "departmentId") || null;
  if (!role) return { error: "الدور غير صالح" };
  if (departmentId && !departmentInCompany(ctx.company.id, departmentId)) return { error: "القسم غير موجود" };
  const result = updateMember(ctx.company.id, field(formData, "membershipId"), {
    role,
    title: clean(field(formData, "title")),
    departmentId,
  });
  if ("error" in result) return result;
  revalidatePath("/people");
  return {};
}

export async function removeMemberAction(formData: FormData) {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "delete", { type: "membership", companyId: ctx.company.id })) return;
  const membershipId = field(formData, "membershipId");
  if (membershipId === ctx.membership.id && ctx.membership.role === "owner" && countOwners(ctx.company.id) <= 1) return;
  removeMember(ctx.company.id, membershipId);
  revalidatePath("/people");
}

export async function createProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "project", companyId: ctx.company.id })) return denied();
  const name = clean(field(formData, "name"));
  if (!name) return { error: "اسم المشروع مطلوب" };
  const budgetRaw = field(formData, "budget");
  const budgetCents = budgetRaw.trim() ? parseAmountToCents(budgetRaw) : 0;
  if (budgetRaw.trim() && budgetCents == null) return { error: "الميزانية رقم أكبر من صفر" };
  const id = createProject({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    name,
    description: field(formData, "description").trim(),
    budgetCents: budgetCents ?? 0,
  });
  redirect(`/work/projects/${id}`);
}

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "task", companyId: ctx.company.id })) return denied();
  const project = getProject(ctx.company.id, field(formData, "projectId"));
  if (!project) return { error: "المشروع غير موجود" };
  const title = clean(field(formData, "title"));
  if (!title) return { error: "عنوان المهمة مطلوب" };
  const departmentId = field(formData, "departmentId") || null;
  const assigneeId = field(formData, "assigneeId") || null;
  if (departmentId && !departmentInCompany(ctx.company.id, departmentId)) return { error: "القسم غير موجود" };
  if (assigneeId && !memberUserIds(ctx.company.id).has(assigneeId)) return { error: "الموظف غير موجود" };
  const progress = parseProgress(field(formData, "progress")) ?? 0;
  const status = withProgress(parseStatus(field(formData, "status")), progress);
  const id = createTask({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    projectId: project.id,
    departmentId,
    assigneeId,
    title,
    description: field(formData, "description").trim(),
    priority: parsePriority(field(formData, "priority")),
    status: status.status,
    progress: status.progress,
    startDate: parseDate(field(formData, "startDate")),
    dueDate: parseDate(field(formData, "dueDate")),
  });
  redirect(`/work/tasks/${id}`);
}

export async function updateTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const task = getTask(ctx.company.id, field(formData, "taskId"));
  if (!task) return { error: "المهمة غير موجودة" };
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "update", { type: "task", companyId: ctx.company.id, assigneeId: task.assigneeId })) return denied();
  const manages = can(actor, "delete", { type: "task", companyId: ctx.company.id });
  if (!manages) return denied();
  const title = clean(field(formData, "title"));
  if (!title) return { error: "عنوان المهمة مطلوب" };
  const departmentId = field(formData, "departmentId") || null;
  const assigneeId = field(formData, "assigneeId") || null;
  if (departmentId && !departmentInCompany(ctx.company.id, departmentId)) return { error: "القسم غير موجود" };
  if (assigneeId && !memberUserIds(ctx.company.id).has(assigneeId)) return { error: "الموظف غير موجود" };
  const progress = parseProgress(field(formData, "progress")) ?? task.progress;
  const status = withProgress(parseStatus(field(formData, "status")), progress);
  updateTask({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    taskId: task.id,
    departmentId,
    assigneeId,
    previousAssigneeId: task.assigneeId,
    title,
    description: field(formData, "description").trim(),
    priority: parsePriority(field(formData, "priority")),
    status: status.status,
    progress: status.progress,
    startDate: parseDate(field(formData, "startDate")),
    dueDate: parseDate(field(formData, "dueDate")),
  });
  revalidatePath(`/work/tasks/${task.id}`);
  return {};
}

export async function updateProgressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const task = getTask(ctx.company.id, field(formData, "taskId"));
  if (!task) return { error: "المهمة غير موجودة" };
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "update", { type: "task", companyId: ctx.company.id, assigneeId: task.assigneeId })) return denied();
  const progress = parseProgress(field(formData, "progress"));
  if (progress == null) return { error: "نسبة التقدم غير صالحة" };
  const next = withProgress(progress === 100 ? "done" : progress === 0 ? "new" : "progress", progress);
  updateProgress({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    taskId: task.id,
    title: task.title,
    progress: next.progress,
    status: next.status,
  });
  revalidatePath(`/work/tasks/${task.id}`);
  return {};
}

export async function deleteTaskAction(formData: FormData) {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "delete", { type: "task", companyId: ctx.company.id })) return;
  const task = getTask(ctx.company.id, field(formData, "taskId"));
  if (!task) return;
  deleteTask(ctx.company.id, task.id);
  redirect("/work/tasks");
}

export async function commentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const task = getTask(ctx.company.id, field(formData, "taskId"));
  if (!task) return { error: "المهمة غير موجودة" };
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "task", companyId: ctx.company.id })) return denied();
  const body = field(formData, "body").trim();
  if (!body) return { error: "التعليق فارغ" };
  addComment({
    companyId: ctx.company.id,
    taskId: task.id,
    userId: ctx.user.id,
    userName: ctx.user.name,
    assigneeId: task.assigneeId,
    body,
    title: task.title,
  });
  revalidatePath(`/work/tasks/${task.id}`);
  return {};
}

export async function attendanceAction() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "attendance", companyId: ctx.company.id })) return;
  toggleAttendance(ctx.company.id, ctx.user.id, ctx.user.name);
  revalidatePath("/people/attendance");
}

export async function leaveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "leave", companyId: ctx.company.id })) return denied();
  const startDate = parseDate(field(formData, "startDate"));
  const endDate = parseDate(field(formData, "endDate"));
  if (!startDate || !endDate) return { error: "حدد تاريخ البداية والنهاية" };
  if (endDate < startDate) return { error: "تاريخ النهاية قبل البداية" };
  requestLeave({
    companyId: ctx.company.id,
    userId: ctx.user.id,
    userName: ctx.user.name,
    startDate,
    endDate,
    reason: field(formData, "reason").trim(),
  });
  revalidatePath("/people/leave");
  return {};
}

export async function decideLeaveAction(formData: FormData) {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "approve", { type: "leave", companyId: ctx.company.id })) return;
  const status = field(formData, "status");
  if (status !== "approved" && status !== "rejected") return;
  decideLeave({ companyId: ctx.company.id, leaveId: field(formData, "leaveId"), reviewerId: ctx.user.id, status });
  revalidatePath("/people/leave");
}

export async function financeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "create", { type: "finance", companyId: ctx.company.id })) return denied();
  const amountCents = parseAmountToCents(field(formData, "amount"));
  if (amountCents == null) return { error: "المبلغ رقم أكبر من صفر" };
  const type = field(formData, "type") === "revenue" ? "revenue" : "expense";
  const projectId = field(formData, "projectId") || null;
  if (projectId && !getProject(ctx.company.id, projectId)) return { error: "المشروع غير موجود" };
  addFinance({
    companyId: ctx.company.id,
    actorId: ctx.user.id,
    actorName: ctx.user.name,
    projectId,
    type,
    amountCents,
    note: field(formData, "note").trim(),
  });
  revalidatePath("/finance");
  return {};
}

export async function profileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const name = clean(field(formData, "name"));
  if (!name) return { error: "الاسم مطلوب" };
  updateUserName(ctx.user.id, name);
  revalidatePath("/settings");
  return {};
}

export async function companySettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "update", { type: "company", companyId: ctx.company.id })) return denied();
  const name = clean(field(formData, "name"));
  if (!name) return { error: "اسم الشركة مطلوب" };
  const requested = field(formData, "currency");
  const currency = CURRENCIES.some((item) => item.code === requested) ? requested : ctx.company.currency;
  updateCompany(ctx.company.id, {
    name,
    currency,
    website: field(formData, "website").trim(),
    description: field(formData, "description").trim(),
  });
  revalidatePath("/settings");
  return {};
}

export async function readNotificationsAction() {
  const ctx = await requireCompany();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  if (!can(actor, "update", { type: "notification", companyId: ctx.company.id, subjectUserId: ctx.user.id })) return;
  markNotificationsRead(ctx.company.id, ctx.user.id);
  revalidatePath("/notifications");
}
