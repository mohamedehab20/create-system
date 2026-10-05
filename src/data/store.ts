import { ROOM_BLUEPRINTS, templateById } from "@/domain/catalog";
import type {
  ActivityItem,
  AttendanceRecord,
  Comment,
  Company,
  CompanySummary,
  Department,
  FinanceEntry,
  LeaveRequest,
  LeaveStatus,
  Member,
  Membership,
  MoneyType,
  Notice,
  Priority,
  Project,
  Role,
  Room,
  Task,
  TaskStatus,
  User,
} from "@/domain/types";
import type { CompanyInput } from "@/domain/validate";
import { getDb, nowIso, transaction, uid } from "./db";

type Sql = string | number | null;

function text(row: Record<string, unknown>, key: string) {
  return String(row[key] ?? "");
}

function optional(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return value == null || value === "" ? null : String(value);
}

function run(sql: string, ...params: Sql[]) {
  return getDb().prepare(sql).run(...params);
}

function one(sql: string, ...params: Sql[]) {
  return getDb().prepare(sql).get(...params);
}

function many(sql: string, ...params: Sql[]) {
  return getDb().prepare(sql).all(...params);
}

function mapUser(row: Record<string, unknown>): User {
  return { id: text(row, "id"), name: text(row, "name"), email: text(row, "email"), createdAt: text(row, "created_at") };
}

function mapCompany(row: Record<string, unknown>): Company {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    industry: text(row, "industry"),
    size: text(row, "size"),
    country: text(row, "country"),
    currency: text(row, "currency"),
    website: text(row, "website"),
    description: text(row, "description"),
    template: text(row, "template"),
    createdAt: text(row, "created_at"),
  };
}

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: text(row, "id"),
    companyId: text(row, "company_id"),
    userId: text(row, "user_id"),
    role: text(row, "role") as Role,
    title: text(row, "title"),
    departmentId: optional(row, "department_id"),
    name: text(row, "name"),
    email: text(row, "email"),
    departmentName: optional(row, "department_name"),
  };
}

const TASK_SELECT = `
  SELECT tasks.*, projects.name AS project_name, departments.name AS department_name, users.name AS assignee_name
  FROM tasks
  JOIN projects ON projects.id = tasks.project_id AND projects.company_id = tasks.company_id
  LEFT JOIN departments ON departments.id = tasks.department_id AND departments.company_id = tasks.company_id
  LEFT JOIN users ON users.id = tasks.assignee_id
`;

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: text(row, "id"),
    projectId: text(row, "project_id"),
    departmentId: optional(row, "department_id"),
    assigneeId: optional(row, "assignee_id"),
    title: text(row, "title"),
    description: text(row, "description"),
    priority: text(row, "priority") as Priority,
    status: text(row, "status") as TaskStatus,
    progress: Number(row.progress ?? 0),
    startDate: optional(row, "start_date"),
    dueDate: optional(row, "due_date"),
    createdBy: text(row, "created_by"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
    projectName: text(row, "project_name"),
    departmentName: optional(row, "department_name"),
    assigneeName: optional(row, "assignee_name"),
  };
}

export function insertUser(input: { name: string; email: string; passwordHash: string }) {
  const id = uid();
  run(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    id,
    input.name,
    input.email,
    input.passwordHash,
    nowIso(),
  );
  return id;
}

export function findUserByEmail(email: string) {
  const row = one("SELECT id, name, email, created_at FROM users WHERE email = ?", email);
  return row ? mapUser(row) : null;
}

export function findUserById(id: string) {
  const row = one("SELECT id, name, email, created_at FROM users WHERE id = ?", id);
  return row ? mapUser(row) : null;
}

export function passwordHashFor(email: string) {
  const row = one("SELECT password_hash FROM users WHERE email = ?", email);
  return row ? text(row, "password_hash") : null;
}

export function updateUserName(userId: string, name: string) {
  run("UPDATE users SET name = ? WHERE id = ?", name, userId);
}

export function insertSession(userId: string, tokenHash: string) {
  run("INSERT INTO sessions (id, user_id, token_hash, created_at) VALUES (?, ?, ?, ?)", uid(), userId, tokenHash, nowIso());
}

export function deleteSession(tokenHash: string) {
  run("DELETE FROM sessions WHERE token_hash = ?", tokenHash);
}

export function userIdForSession(tokenHash: string) {
  const row = one("SELECT user_id FROM sessions WHERE token_hash = ?", tokenHash);
  return row ? text(row, "user_id") : null;
}

export function listCompaniesForUser(userId: string): CompanySummary[] {
  return many(
    `SELECT companies.id, companies.name, memberships.role
     FROM memberships JOIN companies ON companies.id = memberships.company_id
     WHERE memberships.user_id = ? ORDER BY companies.created_at`,
    userId,
  ).map((row) => ({ id: text(row, "id"), name: text(row, "name"), role: text(row, "role") as Role }));
}

export function foundCompany(userId: string, userName: string, input: CompanyInput) {
  const companyId = uid();
  const createdAt = nowIso();
  transaction(() => {
    run(
      `INSERT INTO companies
       (id, name, industry, size, country, currency, website, description, template, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    let managementId: string | null = null;
    for (const name of templateById(input.template).departments) {
      const id = uid();
      if (name === "الإدارة") managementId = id;
      run("INSERT INTO departments (id, company_id, name, created_at) VALUES (?, ?, ?, ?)", id, companyId, name, createdAt);
    }
    run(
      `INSERT INTO memberships (id, company_id, user_id, role, title, department_id, created_at)
       VALUES (?, ?, ?, 'owner', ?, ?, ?)`,
      uid(),
      companyId,
      userId,
      input.title || "المؤسس",
      managementId,
      createdAt,
    );
    const workspaceId = uid();
    run("INSERT INTO workspaces (id, company_id, created_at) VALUES (?, ?, ?)", workspaceId, companyId, createdAt);
    ROOM_BLUEPRINTS.forEach((room, index) => {
      run(
        `INSERT INTO rooms
         (id, company_id, workspace_id, room_key, name, subtitle, href, x, y, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        uid(),
        companyId,
        workspaceId,
        room.key,
        room.name,
        room.subtitle,
        room.href,
        room.x,
        room.y,
        index,
      );
    });
    logActivity(companyId, userId, `أسّس ${userName} شركة ${input.name}`);
  });
  return companyId;
}

export function loadCompanyContext(userId: string, preferredCompanyId?: string | null) {
  const companies = listCompaniesForUser(userId);
  if (!companies.length) return null;
  const companyId = companies.some((item) => item.id === preferredCompanyId) ? preferredCompanyId! : companies[0].id;
  const companyRow = one("SELECT * FROM companies WHERE id = ?", companyId);
  const membershipRow = one("SELECT * FROM memberships WHERE company_id = ? AND user_id = ?", companyId, userId);
  if (!companyRow || !membershipRow) return null;
  const membership: Membership = {
    id: text(membershipRow, "id"),
    companyId,
    userId,
    role: text(membershipRow, "role") as Role,
    title: text(membershipRow, "title"),
    departmentId: optional(membershipRow, "department_id"),
  };
  return {
    company: mapCompany(companyRow),
    membership,
    departments: listDepartments(companyId),
    members: listMembers(companyId),
    companies,
  };
}

export function listDepartments(companyId: string): Department[] {
  return many("SELECT id, name FROM departments WHERE company_id = ? ORDER BY created_at", companyId).map((row) => ({
    id: text(row, "id"),
    name: text(row, "name"),
  }));
}

export function listMembers(companyId: string): Member[] {
  return many(
    `SELECT memberships.*, users.name, users.email, departments.name AS department_name
     FROM memberships
     JOIN users ON users.id = memberships.user_id
     LEFT JOIN departments ON departments.id = memberships.department_id
     WHERE memberships.company_id = ?
     ORDER BY memberships.created_at`,
    companyId,
  ).map(mapMember);
}

export function departmentInCompany(companyId: string, departmentId: string) {
  return Boolean(one("SELECT id FROM departments WHERE company_id = ? AND id = ?", companyId, departmentId));
}

export function addDepartment(companyId: string, name: string) {
  const existing = one("SELECT id FROM departments WHERE company_id = ? AND name = ?", companyId, name);
  if (existing) return { error: "القسم موجود بالفعل" as const };
  run("INSERT INTO departments (id, company_id, name, created_at) VALUES (?, ?, ?, ?)", uid(), companyId, name, nowIso());
  return { ok: true as const };
}

export function removeDepartment(companyId: string, departmentId: string) {
  const used = one(
    `SELECT id FROM memberships WHERE company_id = ? AND department_id = ?
     UNION ALL SELECT id FROM tasks WHERE company_id = ? AND department_id = ? LIMIT 1`,
    companyId,
    departmentId,
    companyId,
    departmentId,
  );
  if (used) return { error: "القسم مرتبط بأشخاص أو مهام" as const };
  const result = run("DELETE FROM departments WHERE company_id = ? AND id = ?", companyId, departmentId);
  if (!result.changes) return { error: "القسم غير موجود" as const };
  return { ok: true as const };
}

export function membershipForEmail(companyId: string, email: string) {
  return one(
    `SELECT memberships.id FROM memberships
     JOIN users ON users.id = memberships.user_id
     WHERE memberships.company_id = ? AND users.email = ?`,
    companyId,
    email,
  );
}

export function addMember(input: {
  companyId: string;
  actorId: string;
  actorName: string;
  companyName: string;
  name: string;
  email: string;
  passwordHash: string | null;
  title: string;
  departmentId: string | null;
  role: Exclude<Role, "owner">;
}) {
  const existing = findUserByEmail(input.email);
  if (existing && membershipForEmail(input.companyId, input.email)) return { error: "هذا البريد عضو في الشركة بالفعل" as const };
  if (!existing && !input.passwordHash) return { error: "كلمة المرور الأولية 8 أحرف على الأقل" as const };
  let userId = existing?.id ?? "";
  transaction(() => {
    if (!existing) {
      userId = uid();
      run(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        userId,
        input.name,
        input.email,
        input.passwordHash,
        nowIso(),
      );
    }
    run(
      `INSERT INTO memberships (id, company_id, user_id, role, title, department_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      uid(),
      input.companyId,
      userId,
      input.role,
      input.title,
      input.departmentId,
      nowIso(),
    );
    notify(input.companyId, userId, "دعوة إلى المقر", `${input.actorName} أضافك إلى ${input.companyName}`, "/home", input.actorId);
    logActivity(input.companyId, input.actorId, `انضم ${input.name} إلى ${input.companyName}`);
  });
  return { ok: true as const, userId, email: input.email, name: input.name };
}

export function countOwners(companyId: string) {
  const row = one("SELECT COUNT(*) AS count FROM memberships WHERE company_id = ? AND role = 'owner'", companyId);
  return Number(row?.count ?? 0);
}

export function updateMember(
  companyId: string,
  membershipId: string,
  input: { role: Exclude<Role, "owner">; title: string; departmentId: string | null },
) {
  const current = one("SELECT role FROM memberships WHERE company_id = ? AND id = ?", companyId, membershipId);
  if (!current) return { error: "العضو غير موجود" as const };
  if (text(current, "role") === "owner") return { error: "لا يمكن تغيير دور المالك" as const };
  run(
    "UPDATE memberships SET role = ?, title = ?, department_id = ? WHERE company_id = ? AND id = ?",
    input.role,
    input.title,
    input.departmentId,
    companyId,
    membershipId,
  );
  return { ok: true as const };
}

export function removeMember(companyId: string, membershipId: string) {
  const current = one("SELECT role FROM memberships WHERE company_id = ? AND id = ?", companyId, membershipId);
  if (!current) return { error: "العضو غير موجود" as const };
  if (text(current, "role") === "owner" && countOwners(companyId) <= 1) return { error: "لا يمكن إزالة المالك الأخير" as const };
  run("DELETE FROM memberships WHERE company_id = ? AND id = ?", companyId, membershipId);
  return { ok: true as const };
}

export function updateCompany(companyId: string, input: Pick<CompanyInput, "name" | "currency" | "website" | "description">) {
  run(
    "UPDATE companies SET name = ?, currency = ?, website = ?, description = ? WHERE id = ?",
    input.name,
    input.currency,
    input.website,
    input.description,
    companyId,
  );
}

export function listRooms(companyId: string): Room[] {
  return many(
    "SELECT * FROM rooms WHERE company_id = ? ORDER BY sort_order",
    companyId,
  ).map((row) => ({
    id: text(row, "id"),
    key: text(row, "room_key"),
    name: text(row, "name"),
    subtitle: text(row, "subtitle"),
    href: text(row, "href"),
    x: Number(row.x ?? 0),
    y: Number(row.y ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export function listProjects(companyId: string): Project[] {
  return many("SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC", companyId).map(mapProject);
}

export function getProject(companyId: string, projectId: string) {
  const row = one("SELECT * FROM projects WHERE company_id = ? AND id = ?", companyId, projectId);
  return row ? mapProject(row) : null;
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    description: text(row, "description"),
    status: text(row, "status"),
    budgetCents: Number(row.budget_cents ?? 0),
    createdBy: text(row, "created_by"),
    createdAt: text(row, "created_at"),
  };
}

export function createProject(input: {
  companyId: string;
  actorId: string;
  actorName: string;
  name: string;
  description: string;
  budgetCents: number;
}) {
  const id = uid();
  transaction(() => {
    run(
      `INSERT INTO projects (id, company_id, name, description, status, budget_cents, created_by, created_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      id,
      input.companyId,
      input.name,
      input.description,
      input.budgetCents,
      input.actorId,
      nowIso(),
    );
    logActivity(input.companyId, input.actorId, `أنشأ ${input.actorName} مشروع ${input.name}`);
  });
  return id;
}

export function listTasks(companyId: string, filter?: { projectId?: string; status?: string }) {
  const clauses = ["tasks.company_id = ?"];
  const params: Sql[] = [companyId];
  if (filter?.projectId) {
    clauses.push("tasks.project_id = ?");
    params.push(filter.projectId);
  }
  if (filter?.status) {
    clauses.push("tasks.status = ?");
    params.push(filter.status);
  }
  return many(`${TASK_SELECT} WHERE ${clauses.join(" AND ")} ORDER BY tasks.updated_at DESC`, ...params).map(mapTask);
}

export function getTask(companyId: string, taskId: string) {
  const row = one(`${TASK_SELECT} WHERE tasks.company_id = ? AND tasks.id = ?`, companyId, taskId);
  return row ? mapTask(row) : null;
}

export function memberUserIds(companyId: string) {
  return new Set(many("SELECT user_id FROM memberships WHERE company_id = ?", companyId).map((row) => text(row, "user_id")));
}

export function createTask(input: {
  companyId: string;
  actorId: string;
  actorName: string;
  projectId: string;
  departmentId: string | null;
  assigneeId: string | null;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
}) {
  const id = uid();
  const stamp = nowIso();
  transaction(() => {
    run(
      `INSERT INTO tasks
       (id, company_id, project_id, department_id, assignee_id, title, description, priority, status, progress, start_date, due_date, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.companyId,
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
      input.actorId,
      stamp,
      stamp,
    );
    if (input.assigneeId) {
      notify(input.companyId, input.assigneeId, "مهمة جديدة", `${input.actorName} عيّن لك «${input.title}»`, `/work/tasks/${id}`, input.actorId);
    }
    logActivity(input.companyId, input.actorId, `أضاف ${input.actorName} المهمة «${input.title}»`);
  });
  return id;
}

export function updateTask(input: {
  companyId: string;
  actorId: string;
  actorName: string;
  taskId: string;
  departmentId: string | null;
  assigneeId: string | null;
  previousAssigneeId: string | null;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
}) {
  transaction(() => {
    run(
      `UPDATE tasks SET department_id = ?, assignee_id = ?, title = ?, description = ?, priority = ?, status = ?, progress = ?,
       start_date = ?, due_date = ?, updated_at = ? WHERE company_id = ? AND id = ?`,
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
      input.companyId,
      input.taskId,
    );
    if (input.assigneeId && input.assigneeId !== input.previousAssigneeId) {
      notify(
        input.companyId,
        input.assigneeId,
        "تعيين مهمة",
        `${input.actorName} عيّن لك «${input.title}»`,
        `/work/tasks/${input.taskId}`,
        input.actorId,
      );
    }
    logActivity(input.companyId, input.actorId, `حدّث ${input.actorName} المهمة «${input.title}»`);
  });
}

export function updateProgress(input: { companyId: string; actorId: string; actorName: string; taskId: string; title: string; progress: number; status: TaskStatus }) {
  transaction(() => {
    run(
      "UPDATE tasks SET progress = ?, status = ?, updated_at = ? WHERE company_id = ? AND id = ?",
      input.progress,
      input.status,
      nowIso(),
      input.companyId,
      input.taskId,
    );
    logActivity(input.companyId, input.actorId, `تقدّم ${input.actorName} في «${input.title}» إلى ${input.progress}%`);
  });
}

export function deleteTask(companyId: string, taskId: string) {
  transaction(() => {
    run("DELETE FROM task_comments WHERE company_id = ? AND task_id = ?", companyId, taskId);
    run("DELETE FROM tasks WHERE company_id = ? AND id = ?", companyId, taskId);
  });
}

export function listComments(companyId: string, taskId: string): Comment[] {
  return many(
    `SELECT task_comments.*, users.name AS author
     FROM task_comments JOIN users ON users.id = task_comments.user_id
     WHERE task_comments.company_id = ? AND task_comments.task_id = ?
     ORDER BY task_comments.created_at`,
    companyId,
    taskId,
  ).map((row) => ({
    id: text(row, "id"),
    taskId: text(row, "task_id"),
    userId: text(row, "user_id"),
    author: text(row, "author"),
    body: text(row, "body"),
    createdAt: text(row, "created_at"),
  }));
}

export function addComment(input: { companyId: string; taskId: string; userId: string; userName: string; assigneeId: string | null; body: string; title: string }) {
  transaction(() => {
    run(
      "INSERT INTO task_comments (id, company_id, task_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      uid(),
      input.companyId,
      input.taskId,
      input.userId,
      input.body,
      nowIso(),
    );
    if (input.assigneeId) {
      notify(input.companyId, input.assigneeId, "تعليق جديد", `${input.userName} علّق على «${input.title}»`, `/work/tasks/${input.taskId}`, input.userId);
    }
    logActivity(input.companyId, input.userId, `علّق ${input.userName} على «${input.title}»`);
  });
}

export function openAttendance(companyId: string, userId: string) {
  const row = one(
    "SELECT * FROM attendance WHERE company_id = ? AND user_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1",
    companyId,
    userId,
  );
  return row ? mapAttendance(row) : null;
}

export function listAttendance(companyId: string, userId?: string): AttendanceRecord[] {
  const sql = userId
    ? "SELECT attendance.*, users.name AS user_name FROM attendance JOIN users ON users.id = attendance.user_id WHERE attendance.company_id = ? AND attendance.user_id = ? ORDER BY check_in DESC"
    : "SELECT attendance.*, users.name AS user_name FROM attendance JOIN users ON users.id = attendance.user_id WHERE attendance.company_id = ? ORDER BY check_in DESC";
  const params = userId ? [companyId, userId] : [companyId];
  return many(sql, ...params).map(mapAttendance);
}

function mapAttendance(row: Record<string, unknown>): AttendanceRecord {
  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    userName: text(row, "user_name"),
    checkIn: text(row, "check_in"),
    checkOut: optional(row, "check_out"),
  };
}

export function toggleAttendance(companyId: string, userId: string, userName: string) {
  const open = one(
    "SELECT id FROM attendance WHERE company_id = ? AND user_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1",
    companyId,
    userId,
  );
  if (open) {
    run("UPDATE attendance SET check_out = ? WHERE company_id = ? AND id = ?", nowIso(), companyId, text(open, "id"));
    logActivity(companyId, userId, `سجّل ${userName} الانصراف`);
    return "out" as const;
  }
  run(
    "INSERT INTO attendance (id, company_id, user_id, check_in, check_out, created_at) VALUES (?, ?, ?, ?, NULL, ?)",
    uid(),
    companyId,
    userId,
    nowIso(),
    nowIso(),
  );
  logActivity(companyId, userId, `سجّل ${userName} الحضور`);
  return "in" as const;
}

export function listLeave(companyId: string): LeaveRequest[] {
  return many(
    `SELECT leave_requests.*, users.name AS user_name
     FROM leave_requests JOIN users ON users.id = leave_requests.user_id
     WHERE leave_requests.company_id = ? ORDER BY leave_requests.created_at DESC`,
    companyId,
  ).map((row) => ({
    id: text(row, "id"),
    userId: text(row, "user_id"),
    userName: text(row, "user_name"),
    startDate: text(row, "start_date"),
    endDate: text(row, "end_date"),
    reason: text(row, "reason"),
    status: text(row, "status") as LeaveStatus,
    createdAt: text(row, "created_at"),
  }));
}

export function requestLeave(input: { companyId: string; userId: string; userName: string; startDate: string; endDate: string; reason: string }) {
  const id = uid();
  transaction(() => {
    run(
      `INSERT INTO leave_requests (id, company_id, user_id, start_date, end_date, reason, status, reviewer_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL, ?)`,
      id,
      input.companyId,
      input.userId,
      input.startDate,
      input.endDate,
      input.reason,
      nowIso(),
    );
    for (const approver of approverIds(input.companyId)) {
      notify(input.companyId, approver, "طلب إجازة", `${input.userName} طلب إجازة`, "/people/leave", input.userId);
    }
    logActivity(input.companyId, input.userId, `طلب ${input.userName} إجازة`);
  });
}

export function decideLeave(input: { companyId: string; leaveId: string; reviewerId: string; status: "approved" | "rejected" }) {
  const row = one("SELECT user_id FROM leave_requests WHERE company_id = ? AND id = ?", input.companyId, input.leaveId);
  if (!row) return { error: "الطلب غير موجود" as const };
  transaction(() => {
    run(
      "UPDATE leave_requests SET status = ?, reviewer_id = ? WHERE company_id = ? AND id = ?",
      input.status,
      input.reviewerId,
      input.companyId,
      input.leaveId,
    );
    const decision = input.status === "approved" ? "قُبل طلب إجازتك" : "رُفض طلب إجازتك";
    notify(input.companyId, text(row, "user_id"), "قرار الإجازة", decision, "/people/leave", input.reviewerId);
    logActivity(input.companyId, input.reviewerId, input.status === "approved" ? "اعتُمدت إجازة" : "رُفضت إجازة");
  });
  return { ok: true as const };
}

export function listFinance(companyId: string): FinanceEntry[] {
  return many(
    `SELECT finance_entries.*, projects.name AS project_name
     FROM finance_entries LEFT JOIN projects ON projects.id = finance_entries.project_id AND projects.company_id = finance_entries.company_id
     WHERE finance_entries.company_id = ? ORDER BY finance_entries.created_at DESC`,
    companyId,
  ).map((row) => ({
    id: text(row, "id"),
    projectId: optional(row, "project_id"),
    projectName: optional(row, "project_name"),
    type: text(row, "type") as MoneyType,
    amountCents: Number(row.amount_cents ?? 0),
    note: text(row, "note"),
    createdAt: text(row, "created_at"),
  }));
}

export function addFinance(input: {
  companyId: string;
  actorId: string;
  actorName: string;
  projectId: string | null;
  type: MoneyType;
  amountCents: number;
  note: string;
}) {
  transaction(() => {
    run(
      `INSERT INTO finance_entries (id, company_id, project_id, type, amount_cents, note, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      uid(),
      input.companyId,
      input.projectId,
      input.type,
      input.amountCents,
      input.note,
      input.actorId,
      nowIso(),
    );
    logActivity(input.companyId, input.actorId, `أضاف ${input.actorName} قيدًا ماليًا`);
  });
}

export function listNotifications(companyId: string, userId: string): Notice[] {
  return many(
    "SELECT * FROM notifications WHERE company_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50",
    companyId,
    userId,
  ).map((row) => ({
    id: text(row, "id"),
    title: text(row, "title"),
    body: text(row, "body"),
    href: text(row, "href"),
    readAt: optional(row, "read_at"),
    createdAt: text(row, "created_at"),
  }));
}

export function countUnread(companyId: string, userId: string) {
  const row = one(
    "SELECT COUNT(*) AS count FROM notifications WHERE company_id = ? AND user_id = ? AND read_at IS NULL",
    companyId,
    userId,
  );
  return Number(row?.count ?? 0);
}

export function markNotificationsRead(companyId: string, userId: string) {
  run(
    "UPDATE notifications SET read_at = ? WHERE company_id = ? AND user_id = ? AND read_at IS NULL",
    nowIso(),
    companyId,
    userId,
  );
}

export function listActivity(companyId: string): ActivityItem[] {
  return many("SELECT id, message, created_at FROM activity WHERE company_id = ? ORDER BY created_at DESC LIMIT 12", companyId).map(
    (row) => ({ id: text(row, "id"), message: text(row, "message"), createdAt: text(row, "created_at") }),
  );
}

export function latestStamp(companyId: string, userId: string) {
  const row = one(
    `SELECT MAX(ts) AS stamp FROM (
       SELECT created_at AS ts FROM activity WHERE company_id = ?
       UNION ALL SELECT created_at FROM notifications WHERE company_id = ? AND user_id = ?
       UNION ALL SELECT updated_at FROM tasks WHERE company_id = ?
     )`,
    companyId,
    companyId,
    userId,
    companyId,
  );
  return text(row ?? {}, "stamp");
}

function approverIds(companyId: string) {
  return many("SELECT user_id FROM memberships WHERE company_id = ? AND role IN ('owner', 'admin', 'manager')", companyId).map((row) =>
    text(row, "user_id"),
  );
}

function notify(companyId: string, userId: string, title: string, body: string, href: string, actorId: string) {
  if (userId === actorId) return;
  run(
    "INSERT INTO notifications (id, company_id, user_id, title, body, href, read_at, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)",
    uid(),
    companyId,
    userId,
    title,
    body,
    href,
    nowIso(),
  );
}

function logActivity(companyId: string, userId: string, message: string) {
  run("INSERT INTO activity (id, company_id, user_id, message, created_at) VALUES (?, ?, ?, ?, ?)", uid(), companyId, userId, message, nowIso());
}
