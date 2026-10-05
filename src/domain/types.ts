export type Role = "owner" | "admin" | "manager" | "employee";
export type TaskStatus = "new" | "progress" | "blocked" | "done";
export type Priority = "low" | "medium" | "high";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type MoneyType = "revenue" | "expense";
export type FormState = { error?: string };

export type Action =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "manage"
  | "export"
  | "invite";

export type ResourceType =
  | "company"
  | "department"
  | "membership"
  | "workspace"
  | "project"
  | "task"
  | "attendance"
  | "leave"
  | "finance"
  | "notification";

export type Actor = {
  userId: string;
  companyId: string;
  role: Role;
};

export type ResourceRef = {
  type: ResourceType;
  companyId: string;
  assigneeId?: string | null;
  subjectUserId?: string | null;
  scope?: "own" | "team";
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  size: string;
  country: string;
  currency: string;
  website: string;
  description: string;
  template: string;
  createdAt: string;
};

export type Department = {
  id: string;
  name: string;
};

export type Membership = {
  id: string;
  companyId: string;
  userId: string;
  role: Role;
  title: string;
  departmentId: string | null;
};

export type Member = Membership & {
  name: string;
  email: string;
  departmentName: string | null;
};

export type CompanySummary = {
  id: string;
  name: string;
  role: Role;
};

export type Room = {
  id: string;
  key: string;
  name: string;
  subtitle: string;
  href: string;
  x: number;
  y: number;
  sortOrder: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  budgetCents: number;
  createdBy: string;
  createdAt: string;
};

export type Task = {
  id: string;
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectName: string;
  departmentName: string | null;
  assigneeName: string | null;
};

export type Comment = {
  id: string;
  taskId: string;
  userId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  userName: string;
  checkIn: string;
  checkOut: string | null;
};

export type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
};

export type FinanceEntry = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  type: MoneyType;
  amountCents: number;
  note: string;
  createdAt: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
};

export type CompanyContext = {
  company: Company;
  membership: Membership;
  departments: Department[];
  members: Member[];
  companies: CompanySummary[];
};
