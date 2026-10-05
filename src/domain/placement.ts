import type { Role } from "./types";

const STUDIO = new Set(["التصميم", "الهندسة", "المنتج", "التدريب", "الاستشارات"]);

export function roomKeyFor(departmentName: string | null, role: Role) {
  if (role === "owner" || departmentName === "الإدارة") return "management";
  if (departmentName === "المالية") return "finance";
  if (departmentName === "التسويق") return "marketing";
  if (departmentName === "المبيعات") return "sales";
  if (departmentName && STUDIO.has(departmentName)) return "studio";
  if (departmentName === "العمليات") return "operations";
  if (departmentName === "الموارد البشرية") return "hr";
  return "team";
}

export type FloorPerson = { id: string; name: string };
export type FloorInputRoom = { id: string; key: string; name: string; subtitle: string; href: string; sortOrder: number };
export type FloorRoom = FloorInputRoom & { people: FloorPerson[] };

export function buildFloor(
  rooms: FloorInputRoom[],
  members: { userId: string; name: string; role: Role; departmentName: string | null }[],
): FloorRoom[] {
  const grouped = new Map<string, FloorPerson[]>();
  for (const room of rooms) grouped.set(room.key, []);
  for (const member of members) {
    const key = roomKeyFor(member.departmentName, member.role);
    grouped.get(key)?.push({ id: member.userId, name: member.name });
  }
  return [...rooms]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((room) => ({ ...room, people: grouped.get(room.key) ?? [] }));
}
