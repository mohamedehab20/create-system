import { getDb } from "./db";
import type {
  ActivityItem,
  AttendanceRecord,
  Comment,
  Company,
  CompanyContext,
  CompanySummary,
  Department,
  FinanceEntry,
  LeaveRequest,
  Member,
  Membership,
  Notice,
  Priority,
  Project,
  Role,
  Task,
  TaskStatus,
  User,
} from "./types";

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function nullable(value: unknown) {
  return value == null || value === "" ? null : String(value);
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: text(row.id),
    name: text(row.name),
    email: text(row.email),
    createdAt: text(row.created_at),
  };
}

function mapCompany(row: Record<string, unknown>): Company {
  return {
    id: text(row.company_id ?? row.id),
    name: text(row.company_name ?? row.name),
    industry: text(row.industry),
    size: text(row.size),
    country: text(row.country),
    currency: text(row.currency),
    website: text(row.website),
    description: text(row.description),
    template: text(row.template),
    createdAt: text(row.company_created_at ?? row.created_at),
  };
}

export function getUserByEmail(email: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row ? mapUser(row) : null;
}

export function getUserById(id: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? mapUser(row) : null;
}

export function userPasswordHash(email: string) {
  const row = getDb().prepare("SELECT password_hash FROM users WHERE email = ?").get(email);
  return row ? text(row.password_hash) : null;
}

export function listCompanyIds(userId: string) {
  return getDb()
    .prepare("SELECT company_id FROM memberships WHERE user_id = ?")
    .all(userId)
    .map((row) => text(row.company_id));
}

export function loadCompanyContext(userId: string, preferredCompanyId?: string | null): CompanyContext | null {
  const rows = getDb()
    .prepare(
      `SELECT m.id, m.company_id, m.user_id, m.role, m.title, m.department_id,
              c.name AS company_name, c.industry, c.size, c.country, c.currency,
              c.website, c.description, c.template, c.created_at AS company_created_at
       FROM memberships m
       JOIN companies c ON c.id = m.company_id
       WHERE m.user_id = ?
       ORDER BY m.created_at ASC`,
    )
    .all(userId);

  if (!rows.length) return null;
  const chosen = rows.find((row) => text(row.company_id) === preferredCompanyId) ?? rows[0];
  const company = mapCompany(chosen);
  const membership: Membership = {
    id: text(chosen.id),
    companyId: company.id,
    userId,
    role: text(chosen.role) as Role,
    title: text(chosen.title),
    departmentId: nullable(chosen.department_id),
  };
  const companies: CompanySummary[] = rows.map((row) => ({
    id: text(row.company_id),
    name: text(row.company_name),
    role: text(row.role) as Role,
  }));
  return {
    company,
    membership,
    departments: listDepartments(company.id),
    members: listMembers(company.id),
    companies,
  };
}

export function listDepartments(companyId: string): Department[] {
  return getDb()
    .prepare("SELECT id, name FROM departments WHERE company_id = ? ORDER BY created_at ASC")
    .all(companyId)
    .map((row) => ({ id: text(row.id), name: text(row.name) }));
}

export function listMembers(companyId: string): Member[] {
  return getDb()
    .prepare(
      `SELECT m.id, m.company_id, m.user_id, m.role, m.title, m.department_id,
              u.name, u.email, d.name AS department_name
       FROM memberships m
       JOIN users u ON u.id = m.user_id
       LEFT JOIN departments d ON d.id = m.department_id
       WHERE m.company_id = ?
       ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 ELSE 3 END, u.name`,
    )
    .all(companyId)
    .map((row) => ({
      id: text(row.id),
      companyId: text(row.company_id),
      userId: text(row.user_id),
      role: text(row.role) as Role,
      title: text(row.title),
      departmentId: nullable(row.department_id),
      name: text(row.name),
      email: text(row.email),
      departmentName: nullable(row.department_name),
    }));
}

export function listProjects(companyId: string): Project[] {
  return getDb()
    .prepare(
      `SELECT id, name, description, status, created_by, created_at
       FROM projects WHERE company_id = ? ORDER BY created_at DESC`,
    )
    .all(companyId)
    .map(mapProject);
}

export function getProject(companyId: string, projectId: string) {
  const row = getDb()
    .prepare(
      `SELECT id, name, description, status, created_by, created_at
       FROM projects WHERE company_id = ? AND id = ?`,
    )
    .get(companyId, projectId);
  return row ? mapProject(row) : null;
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: text(row.id),
    name: text(row.name),
    description: text(row.description),
    status: text(row.status),
    createdBy: text(row.created_by),
    createdAt: text(row.created_at),
  };
}

const TASK_SELECT = `
  SELECT t.id, t.project_id, t.department_id, t.assignee_id, t.title, t.description,
         t.priority, t.status, t.progress, t.start_date, t.due_date, t.created_by,
         t.created_at, t.updated_at, p.name AS project_name,
         d.name AS department_name, u.name AS assignee_name
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  LEFT JOIN departments d ON d.id = t.department_id
  LEFT JOIN users u ON u.id = t.assignee_id
`;

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: text(row.id),
    projectId: text(row.project_id),
    departmentId: nullable(row.department_id),
    assigneeId: nullable(row.assignee_id),
    title: text(row.title),
    description: text(row.description),
    priority: text(row.priority) as Priority,
    status: text(row.status) as TaskStatus,
    progress: Number(row.progress ?? 0),
    startDate: nullable(row.start_date),
    dueDate: nullable(row.due_date),
    createdBy: text(row.created_by),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
    projectName: text(row.project_name),
    departmentName: nullable(row.department_name),
    assigneeName: nullable(row.assignee_name),
  };
}

export function listTasks(companyId: string, filter?: { projectId?: string; status?: string }) {
  const clauses = ["t.company_id = ?"];
  const params: string[] = [companyId];
  if (filter?.projectId) {
    clauses.push("t.project_id = ?");
    params.push(filter.projectId);
  }
  if (filter?.status) {
    clauses.push("t.status = ?");
    params.push(filter.status);
  }
  return getDb()
    .prepare(`${TASK_SELECT} WHERE ${clauses.join(" AND ")} ORDER BY t.created_at DESC`)
    .all(...params)
    .map(mapTask);
}

export function getTask(companyId: string, taskId: string) {
  const row = getDb().prepare(`${TASK_SELECT} WHERE t.company_id = ? AND t.id = ?`).get(companyId, taskId);
  return row ? mapTask(row) : null;
}

export function listComments(taskId: string): Comment[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.task_id, c.user_id, c.body, c.created_at, u.name AS author
       FROM task_comments c JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ? ORDER BY c.created_at ASC`,
    )
    .all(taskId)
    .map((row) => ({
      id: text(row.id),
      taskId: text(row.task_id),
      userId: text(row.user_id),
      author: text(row.author),
      body: text(row.body),
      createdAt: text(row.created_at),
    }));
}

export function listAttendance(companyId: string, userId?: string): AttendanceRecord[] {
  const sql = userId
    ? `SELECT a.id, a.user_id, a.check_in, a.check_out, u.name AS user_name
       FROM attendance a JOIN users u ON u.id = a.user_id
       WHERE a.company_id = ? AND a.user_id = ? ORDER BY a.check_in DESC LIMIT 30`
    : `SELECT a.id, a.user_id, a.check_in, a.check_out, u.name AS user_name
       FROM attendance a JOIN users u ON u.id = a.user_id
       WHERE a.company_id = ? ORDER BY a.check_in DESC LIMIT 40`;
  const rows = userId
    ? getDb().prepare(sql).all(companyId, userId)
    : getDb().prepare(sql).all(companyId);
  return rows.map((row) => ({
    id: text(row.id),
    userId: text(row.user_id),
    userName: text(row.user_name),
    checkIn: text(row.check_in),
    checkOut: nullable(row.check_out),
  }));
}

export function openAttendance(companyId: string, userId: string) {
  const row = getDb()
    .prepare(
      `SELECT id, user_id, check_in, check_out FROM attendance
       WHERE company_id = ? AND user_id = ? AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
    )
    .get(companyId, userId);
  if (!row) return null;
  return {
    id: text(row.id),
    userId: text(row.user_id),
    userName: "",
    checkIn: text(row.check_in),
    checkOut: null,
  } satisfies AttendanceRecord;
}

export function listLeave(companyId: string): LeaveRequest[] {
  return getDb()
    .prepare(
      `SELECT l.id, l.user_id, l.start_date, l.end_date, l.reason, l.status, l.created_at, u.name AS user_name
       FROM leave_requests l JOIN users u ON u.id = l.user_id
       WHERE l.company_id = ? ORDER BY l.created_at DESC`,
    )
    .all(companyId)
    .map((row) => ({
      id: text(row.id),
      userId: text(row.user_id),
      userName: text(row.user_name),
      startDate: text(row.start_date),
      endDate: text(row.end_date),
      reason: text(row.reason),
      status: text(row.status) as LeaveRequest["status"],
      createdAt: text(row.created_at),
    }));
}

export function listFinance(companyId: string): FinanceEntry[] {
  return getDb()
    .prepare(
      `SELECT f.id, f.project_id, f.type, f.amount, f.note, f.created_at, p.name AS project_name
       FROM finance_entries f LEFT JOIN projects p ON p.id = f.project_id
       WHERE f.company_id = ? ORDER BY f.created_at DESC`,
    )
    .all(companyId)
    .map((row) => ({
      id: text(row.id),
      projectId: nullable(row.project_id),
      projectName: nullable(row.project_name),
      type: text(row.type) as FinanceEntry["type"],
      amount: Number(row.amount),
      note: text(row.note),
      createdAt: text(row.created_at),
    }));
}

export function projectMoney(companyId: string, projectId: string) {
  const rows = getDb()
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS total
       FROM finance_entries WHERE company_id = ? AND project_id = ? GROUP BY type`,
    )
    .all(companyId, projectId);
  let revenue = 0;
  let expense = 0;
  for (const row of rows) {
    if (row.type === "revenue") revenue = Number(row.total);
    if (row.type === "expense") expense = Number(row.total);
  }
  return { revenue, expense, margin: revenue - expense };
}

export function monthMoney(companyId: string, month: string) {
  const rows = getDb()
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS total
       FROM finance_entries
       WHERE company_id = ? AND substr(created_at, 1, 7) = ?
       GROUP BY type`,
    )
    .all(companyId, month);
  let revenue = 0;
  let expense = 0;
  for (const row of rows) {
    if (row.type === "revenue") revenue = Number(row.total);
    if (row.type === "expense") expense = Number(row.total);
  }
  return { revenue, expense, net: revenue - expense };
}

export function listNotifications(companyId: string, userId: string): Notice[] {
  return getDb()
    .prepare(
      `SELECT id, title, body, href, read_at, created_at
       FROM notifications WHERE company_id = ? AND user_id = ?
       ORDER BY created_at DESC LIMIT 40`,
    )
    .all(companyId, userId)
    .map((row) => ({
      id: text(row.id),
      title: text(row.title),
      body: text(row.body),
      href: text(row.href),
      readAt: nullable(row.read_at),
      createdAt: text(row.created_at),
    }));
}

export function countUnread(companyId: string, userId: string) {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count FROM notifications
       WHERE company_id = ? AND user_id = ? AND read_at IS NULL`,
    )
    .get(companyId, userId);
  return Number(row?.count ?? 0);
}

export function listActivity(companyId: string): ActivityItem[] {
  return getDb()
    .prepare(
      `SELECT id, message, created_at FROM activity
       WHERE company_id = ? ORDER BY created_at DESC LIMIT 12`,
    )
    .all(companyId)
    .map((row) => ({
      id: text(row.id),
      message: text(row.message),
      createdAt: text(row.created_at),
    }));
}

export function latestStamp(companyId: string, userId: string) {
  const row = getDb()
    .prepare(
      `SELECT MAX(created_at) AS stamp FROM (
         SELECT created_at FROM activity WHERE company_id = ?
         UNION ALL SELECT created_at FROM notifications WHERE company_id = ? AND user_id = ?
         UNION ALL SELECT updated_at FROM tasks WHERE company_id = ?
         UNION ALL SELECT created_at FROM attendance WHERE company_id = ?
       )`,
    )
    .get(companyId, companyId, userId, companyId, companyId);
  return text(row?.stamp);
}

export function approverIds(companyId: string) {
  return getDb()
    .prepare(
      `SELECT user_id FROM memberships
       WHERE company_id = ? AND role IN ('owner', 'admin', 'manager')`,
    )
    .all(companyId)
    .map((row) => text(row.user_id));
}
