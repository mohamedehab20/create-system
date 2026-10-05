import type { Action, Actor, ResourceRef, Role } from "@/domain/types";

function managesPeople(role: Role) {
  return role === "owner" || role === "admin";
}

function managesWork(role: Role) {
  return role === "owner" || role === "admin" || role === "manager";
}

export function can(actor: Actor, action: Action, resource: ResourceRef) {
  if (actor.companyId !== resource.companyId) return false;
  if (action === "export") return false;

  const people = managesPeople(actor.role);
  const work = managesWork(actor.role);

  switch (resource.type) {
    case "company":
      if (action === "view") return true;
      if (action === "update") return actor.role === "owner";
      return false;
    case "department":
      if (action === "view") return true;
      return action === "create" || action === "delete" || action === "manage" ? people : false;
    case "membership":
      if (action === "view") return true;
      return action === "invite" || action === "create" || action === "update" || action === "delete" || action === "manage"
        ? people
        : false;
    case "workspace":
      if (action === "view") return true;
      return action === "update" ? people : false;
    case "project":
      if (action === "view") return true;
      return action === "create" || action === "update" || action === "delete" ? work : false;
    case "task":
      if (action === "view" || action === "create") return true;
      if (action === "delete") return work;
      if (action === "update") return work || resource.assigneeId === actor.userId;
      return false;
    case "attendance":
      if (action === "create" || action === "update") return true;
      if (action === "view") return resource.scope === "team" ? work : true;
      return false;
    case "leave":
      if (action === "view" || action === "create") return true;
      return action === "approve" || action === "update" ? work : false;
    case "finance":
      if (action === "view") return work;
      return action === "create" || action === "update" || action === "delete" ? actor.role === "owner" || actor.role === "admin" : false;
    case "notification":
      return (action === "view" || action === "update") && resource.subjectUserId === actor.userId;
    default:
      return false;
  }
}

export function actorOf(userId: string, companyId: string, role: Role): Actor {
  return { userId, companyId, role };
}
