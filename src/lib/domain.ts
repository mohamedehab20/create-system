import { getDb, nowIso, transaction, uid } from "./db";
import { templateById } from "./labels";
import { approverIds, getUserByEmail } from "./queries";
import type { Role } from "./types";

export type Result = { error: string } | { ok: true };

function ok(): Result {
  return { ok: true };
}

function fail(error: string): Result {
  return { error };
}

function notify(companyId: string, userId: string, title: string, body: string, href: string) {
  getDb()
    .prepare(
      `INSERT INTO notifications (id, company_id, user_id, title, body, href, read_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
    )
    .run(uid(), companyId, userId, title, body, href, nowIso());
}

function activity(companyId: string, userId: string, message: string) {
  getDb()
    .prepare("INSERT INTO activity (id, company_id, user_id, message, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(uid(), companyId, userId, message, nowIso());
}

export function registerUser(input: { name: string; email: string; passwordHash: string }) {
  if (getUserByEmail(input.email)) return { error: "هذا البريد مسجّل بالفعل" };
  const id = uid();
  getDb()
    .prepare("INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.name, input.email, input.passwordHash, nowIso());
  return { userId: id };
}

export function createCompany(
  userId: string,
  userName: string,
  input: {
    name: string;
    industry: string;
    size: string;
    country: string;
    currency: string;
    website: string;
    description: string;
    template: string;
    title: string;
  },
) {
  const companyId = uid();
  const createdAt = nowIso();
  const departments = templateById(input.template).departments;
  let managementId = "";
  transaction(() => {
    getDb()
      .prepare(
        `INSERT INTO companies
         (id, name, industry, size, country, currency, website, description, template, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        companyId,
        input.name,
        input.industry,
        input.size,
        input.country,
        input.currency,
        input.website,
        input.description,
        input.template,
        createdAt,
      );
    for (const name of departments) {
      const id = uid();
      if (name === "الإدارة") managementId = id;
      getDb()
        .prepare("INSERT INTO departments (id, company_id, name, created_at) VALUES (?, ?, ?, ?)")
        .run(id, companyId, name, createdAt);
    }
    getDb()
      .prepare(
        `INSERT INTO memberships (id, company_id, user_id, role, title, department_id, created_at)
         VALUES (?, ?, ?, 'owner', ?, ?, ?)`,
      )
      .run(uid(), companyId, userId, input.title || "المؤسس", managementId || null, createdAt);
    activity(companyId, userId, `أسّس ${userName} شركة ${input.name}`);
  });
  return companyId;
}

export function addMember(
  actor: { id: string; name: string },
  companyId: string,
  companyName: string,
  input: {
    name: string;
    email: string;
    passwordHash: string | null;
    title: string;
    departmentId: string | null;
    role: Exclude<Role, "owner">;
  },
): Result {
  const existing = getUserByEmail(input.email);
  if (!existing && !input.passwordHash) return fail("كلمة المرور الأولية 8 أحرف على الأقل");
  const member = getDb()
    .prepare("SELECT id FROM memberships WHERE company_id = ? AND user_id = ?")
    .get(companyId, existing?.id ?? "");
  if (existing && member) return fail("هذا البريد عضو في الشركة بالفعل");

  let userId = existing?.id ?? "";
  transaction(() => {
    if (!existing) {
      userId = uid();
      getDb()
        .prepare("INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(userId, input.name, input.email, input.passwordHash, nowIso());
    }
    getDb()
      .prepare(
        `INSERT INTO memberships (id, company_id, user_id, role, title, department_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(uid(), companyId, userId, input.role, input.title, input.departmentId, nowIso());
    activity(companyId, actor.id, `أضاف ${actor.name} ${input.name} إلى الفريق`);
    notify(companyId, userId, `أُضيفت إلى ${companyName}`, "يمكنك الدخول إلى مقر الشركة الآن.", "/home");
  });
  return ok();
}

export function updateMember(
  companyId: string,
  input: { membershipId: string; title: string; departmentId: string | null; role: Role | null },
): Result {
  const row = getDb()
    .prepare("SELECT role FROM memberships WHERE id = ? AND company_id = ?")
    .get(input.membershipId, companyId);
  if (!row) return fail("العضو غير موجود");
  const current = String(row.role);
  const nextRole = current === "owner" ? "owner" : input.role ?? current;
  getDb()
    .prepare("UPDATE memberships SET title = ?, department_id = ?, role = ? WHERE id = ? AND company_id = ?")
    .run(input.title, input.departmentId, nextRole, input.membershipId, companyId);
  return ok();
}

export function removeMember(companyId: string, membershipId: string): Result {
  const row = getDb()
    .prepare("SELECT role FROM memberships WHERE id = ? AND company_id = ?")
    .get(membershipId, companyId);
  if (!row) return fail("العضو غير موجود");
  if (row.role === "owner") return fail("لا يمكن إزالة مالك الشركة");
  getDb().prepare("DELETE FROM memberships WHERE id = ? AND company_id = ?").run(membershipId, companyId);
  return ok();
}

export function addDepartment(companyId: string, name: string): Result {
  const exists = getDb()
    .prepare("SELECT id FROM departments WHERE company_id = ? AND name = ?")
    .get(companyId, name);
  if (exists) return fail("هذا القسم موجود بالفعل");
  getDb()
    .prepare("INSERT INTO departments (id, company_id, name, created_at) VALUES (?, ?, ?, ?)")
    .run(uid(), companyId, name, nowIso());
  return ok();
}

export function removeDepartment(companyId: string, departmentId: string): Result {
  const people = getDb()
    .prepare("SELECT COUNT(*) AS count FROM memberships WHERE company_id = ? AND department_id = ?")
    .get(companyId, departmentId);
  const tasks = getDb()
    .prepare("SELECT COUNT(*) AS count FROM tasks WHERE company_id = ? AND department_id = ?")
    .get(companyId, departmentId);
  if (Number(people?.count ?? 0) || Number(tasks?.count ?? 0)) {
    return fail("لا يمكن حذف قسم فيه أشخاص أو مهام");
  }
  getDb().prepare("DELETE FROM departments WHERE id = ? AND company_id = ?").run(departmentId, companyId);
  return ok();
}

export function createProject(
  actor: { id: string; name: string },
  companyId: string,
  input: { name: string; description: string },
) {
  const id = uid();
  transaction(() => {
    getDb()
      .prepare(
        `INSERT INTO projects (id, company_id, name, description, status, created_by, created_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?)`,
      )
      .run(id, companyId, input.name, input.description, actor.id, nowIso());
    activity(companyId, actor.id, `أنشأ ${actor.name} مشروع ${input.name}`);
  });
  return id;
}

export function createTask(
  actor: { id: string; name: string },
  companyId: string,
  input: {
    projectId: string;
    departmentId: string | null;
    assigneeId: string | null;
    title: string;
    description: string;
    priority: string;
    status: string;
    progress: number;
    startDate: string | null;
    dueDate: string | null;
  },
): Result & { id?: string } {
  const project = getDb()
    .prepare("SELECT name FROM projects WHERE id = ? AND company_id = ?")
    .get(input.projectId, companyId);
  if (!project) return fail("اختر مشروعًا من الشركة");
  const id = uid();
  const createdAt = nowIso();
  transaction(() => {
    getDb()
      .prepare(
        `INSERT INTO tasks
         (id, company_id, project_id, department_id, assignee_id, title, description, priority, status, progress, start_date, due_date, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        companyId,
        input.projectId,
        input.departmentId,
        input.assigneeId,
        input.title,
        input.description,
        input.priority,
        input.status,
        input.progress,
        input.startDate,
        input.dueDate,
        actor.id,
        createdAt,
        createdAt,
      );
    activity(companyId, actor.id, `أضاف ${actor.name} مهمة ${input.title}`);
    if (input.assigneeId && input.assigneeId !== actor.id) {
      notify(companyId, input.assigneeId, `مهمة جديدة: ${input.title}`, `${actor.name} كلفك بهذه المهمة.`, `/work/tasks/${id}`);
    }
  });
  return { ok: true, id };
}

export function updateTask(
  actorId: string,
  companyId: string,
  taskId: string,
  input: {
    projectId: string;
    departmentId: string | null;
    assigneeId: string | null;
    title: string;
    description: string;
    priority: string;
    status: string;
    progress: number;
    startDate: string | null;
    dueDate: string | null;
  },
): Result {
  const current = getDb()
    .prepare("SELECT assignee_id, title FROM tasks WHERE id = ? AND company_id = ?")
    .get(taskId, companyId);
  if (!current) return fail("المهمة غير موجودة");
  const project = getDb()
    .prepare("SELECT id FROM projects WHERE id = ? AND company_id = ?")
    .get(input.projectId, companyId);
  if (!project) return fail("المشروع غير موجود");
  getDb()
    .prepare(
      `UPDATE tasks SET project_id = ?, department_id = ?, assignee_id = ?, title = ?, description = ?, priority = ?,
       status = ?, progress = ?, start_date = ?, due_date = ?, updated_at = ?
       WHERE id = ? AND company_id = ?`,
    )
    .run(
      input.projectId,
      input.departmentId,
      input.assigneeId,
      input.title,
      input.description,
      input.priority,
      input.status,
      input.progress,
      input.startDate,
      input.dueDate,
      nowIso(),
      taskId,
      companyId,
    );
  if (input.assigneeId && input.assigneeId !== actorId && input.assigneeId !== String(current.assignee_id ?? "")) {
    notify(companyId, input.assigneeId, `مهمة: ${input.title}`, "أُسندت إليك مهمة.", `/work/tasks/${taskId}`);
  }
  return ok();
}

export function updateProgress(userId: string, companyId: string, taskId: string, progress: number): Result {
  const task = getDb()
    .prepare("SELECT assignee_id, title FROM tasks WHERE id = ? AND company_id = ?")
    .get(taskId, companyId);
  if (!task) return fail("المهمة غير موجودة");
  if (String(task.assignee_id ?? "") !== userId) return fail("تحديث التقدم متاح لمسؤول المهمة");
  getDb()
    .prepare("UPDATE tasks SET progress = ?, updated_at = ? WHERE id = ?")
    .run(progress, nowIso(), taskId);
  return ok();
}

export function deleteTask(companyId: string, taskId: string): Result {
  const task = getDb().prepare("SELECT id FROM tasks WHERE id = ? AND company_id = ?").get(taskId, companyId);
  if (!task) return fail("المهمة غير موجودة");
  transaction(() => {
    getDb().prepare("DELETE FROM task_comments WHERE task_id = ?").run(taskId);
    getDb().prepare("DELETE FROM tasks WHERE id = ? AND company_id = ?").run(taskId, companyId);
  });
  return ok();
}

export function addComment(
  actor: { id: string; name: string },
  companyId: string,
  taskId: string,
  body: string,
): Result {
  const task = getDb()
    .prepare("SELECT title, assignee_id, created_by FROM tasks WHERE id = ? AND company_id = ?")
    .get(taskId, companyId);
  if (!task) return fail("المهمة غير موجودة");
  getDb()
    .prepare("INSERT INTO task_comments (id, task_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(uid(), taskId, actor.id, body, nowIso());
  const targets = new Set([String(task.assignee_id ?? ""), String(task.created_by ?? "")].filter(Boolean));
  targets.delete(actor.id);
  for (const userId of targets) {
    notify(companyId, userId, `تعليق على ${textOf(task.title)}`, `${actor.name}: ${body}`, `/work/tasks/${taskId}`);
  }
  activity(companyId, actor.id, `علّق ${actor.name} على ${textOf(task.title)}`);
  return ok();
}

export function toggleAttendance(userId: string, userName: string, companyId: string) {
  const open = getDb()
    .prepare(
      `SELECT id FROM attendance WHERE company_id = ? AND user_id = ? AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
    )
    .get(companyId, userId);
  if (open) {
    getDb().prepare("UPDATE attendance SET check_out = ? WHERE id = ?").run(nowIso(), String(open.id));
    activity(companyId, userId, `سجّل ${userName} الانصراف`);
    return "out" as const;
  }
  getDb()
    .prepare("INSERT INTO attendance (id, company_id, user_id, check_in, check_out, created_at) VALUES (?, ?, ?, ?, NULL, ?)")
    .run(uid(), companyId, userId, nowIso(), nowIso());
  activity(companyId, userId, `سجّل ${userName} الحضور`);
  return "in" as const;
}

export function requestLeave(
  actor: { id: string; name: string },
  companyId: string,
  input: { startDate: string; endDate: string; reason: string },
): Result {
  const id = uid();
  getDb()
    .prepare(
      `INSERT INTO leave_requests (id, company_id, user_id, start_date, end_date, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .run(id, companyId, actor.id, input.startDate, input.endDate, input.reason, nowIso());
  for (const userId of approverIds(companyId)) {
    if (userId === actor.id) continue;
    notify(companyId, userId, "طلب إجازة", `${actor.name} يطلب إجازة.`, "/people/leave");
  }
  return ok();
}

export function decideLeave(companyId: string, leaveId: string, status: "approved" | "rejected"): Result {
  const row = getDb()
    .prepare("SELECT user_id FROM leave_requests WHERE id = ? AND company_id = ?")
    .get(leaveId, companyId);
  if (!row) return fail("الطلب غير موجود");
  getDb().prepare("UPDATE leave_requests SET status = ? WHERE id = ?").run(status, leaveId);
  notify(
    companyId,
    String(row.user_id),
    status === "approved" ? "تم اعتماد الإجازة" : "رُفض طلب الإجازة",
    "تم تحديث حالة طلبك.",
    "/people/leave",
  );
  return ok();
}

export function addFinance(
  actorId: string,
  companyId: string,
  input: { type: "revenue" | "expense"; amount: number; projectId: string | null; note: string },
): Result {
  if (input.projectId) {
    const project = getDb()
      .prepare("SELECT id FROM projects WHERE id = ? AND company_id = ?")
      .get(input.projectId, companyId);
    if (!project) return fail("المشروع غير موجود");
  }
  getDb()
    .prepare(
      `INSERT INTO finance_entries (id, company_id, project_id, type, amount, note, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(uid(), companyId, input.projectId, input.type, input.amount, input.note, actorId, nowIso());
  return ok();
}

export function updateProfile(userId: string, name: string) {
  getDb().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
}

export function updateCompany(
  companyId: string,
  input: { name: string; website: string; description: string; currency: string },
) {
  getDb()
    .prepare("UPDATE companies SET name = ?, website = ?, description = ?, currency = ? WHERE id = ?")
    .run(input.name, input.website, input.description, input.currency, companyId);
}

export function markNotificationsRead(companyId: string, userId: string) {
  getDb()
    .prepare("UPDATE notifications SET read_at = ? WHERE company_id = ? AND user_id = ? AND read_at IS NULL")
    .run(nowIso(), companyId, userId);
}

function textOf(value: unknown) {
  return value == null ? "" : String(value);
}
