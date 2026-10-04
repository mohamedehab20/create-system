import type { Role } from "./types";

export function canManagePeople(role: Role) {
  return role === "owner" || role === "admin";
}

export function canManageWork(role: Role) {
  return role === "owner" || role === "admin" || role === "manager";
}

export function canSeeFinance(role: Role) {
  return role === "owner" || role === "admin" || role === "manager";
}

export function canWriteFinance(role: Role) {
  return role === "owner" || role === "admin";
}

export function canApproveLeave(role: Role) {
  return role === "owner" || role === "admin" || role === "manager";
}
