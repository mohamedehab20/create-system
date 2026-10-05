import { requireCompany } from "@/application/guard";
import { Floor } from "@/components/floor";
import { PageHeader } from "@/components/ui";
import { listRooms } from "@/data/store";
import { buildFloor } from "@/domain/placement";

export default async function HeadquartersPage() {
  const ctx = await requireCompany();
  const rooms = buildFloor(listRooms(ctx.company.id), ctx.members);
  return (
    <div>
      <PageHeader title="المقر" subtitle="الغرف محفوظة مع الشركة، والناس تظهر في غرفة قسمهم." />
      <Floor rooms={rooms} />
    </div>
  );
}
