import { ROOMS, roomIdFor } from "./labels";
import type { Member, Role } from "./types";
import type { FloorRoom } from "@/components/floor";

export function buildFloor(members: Pick<Member, "userId" | "name" | "role" | "departmentName">[]): FloorRoom[] {
  const grouped = new Map<string, { id: string; name: string }[]>();
  for (const room of ROOMS) grouped.set(room.id, []);
  for (const member of members) {
    const roomId = roomIdFor(member.departmentName, member.role as Role);
    grouped.get(roomId)?.push({ id: member.userId, name: member.name });
  }
  return ROOMS.map((room) => ({
    id: room.id,
    name: room.name,
    subtitle: room.subtitle,
    href: room.href,
    people: grouped.get(room.id) ?? [],
  }));
}
