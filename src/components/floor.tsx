import Link from "next/link";
import type { FloorRoom } from "@/domain/placement";
import { Avatar } from "./ui";

export function Floor({ rooms, linked = true }: { rooms: FloorRoom[]; linked?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[#0f172a]">{room.name}</h3>
                  <p className="mt-1 text-xs text-[#5c6573]">{room.subtitle}</p>
                </div>
                <span className="rounded-full bg-[#f3f6fb] px-2 py-1 text-[11px] font-bold text-[#5c6573]">
                  {room.people.length ? room.people.length : "فارغة"}
                </span>
              </div>
              <div className="mt-4 flex min-h-10 flex-wrap items-center gap-2">
                {room.people.length ? (
                  room.people.slice(0, 4).map((person) => (
                    <span key={person.id} className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] py-1 pr-1 pl-2 text-xs font-semibold">
                      <Avatar name={person.name} size="sm" />
                      {person.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#8b93a1]">فارغة</span>
                )}
                {room.people.length > 4 ? <span className="text-xs font-bold text-[#5c6573]">+{room.people.length - 4}</span> : null}
              </div>
            </>
          );
          const className = "block rounded-3xl bg-white p-4 ring-1 ring-[#e7e9ef] transition hover:-translate-y-0.5 hover:ring-[#2563eb]/40";
          return linked ? (
            <Link key={room.id} href={room.href} className={className}>
              {body}
            </Link>
          ) : (
            <article key={room.id} className={className}>
              {body}
            </article>
          );
        })}
      </div>
      <ul className="grid gap-2 text-sm text-[#3c4451] sm:grid-cols-2">
        {rooms.map((room) => (
          <li key={`${room.id}-legend`} className="rounded-2xl bg-white px-3 py-2 ring-1 ring-[#eef0f4]">
            <span className="font-bold">{room.name}:</span> {room.people.length ? room.people.map((person) => person.name).join("، ") : "فارغة"}
          </li>
        ))}
      </ul>
    </div>
  );
}
