import { Floor } from "@/components/floor";
import { PageHeader } from "@/components/ui";
import { Shell } from "@/components/shell";
import { buildFloor } from "@/lib/floor-data";
import { requireCompany } from "@/lib/guard";

export const metadata = { title: "المقر" };

export default async function HeadquartersPage() {
  const ctx = await requireCompany();
  return (
    <Shell ctx={ctx}>
      <PageHeader title="مقر الشركة" subtitle="عشر غرف. كل شخص يظهر في غرفة قسمه، والمالك في مكتب الإدارة." />
      <Floor rooms={buildFloor(ctx.members)} />
    </Shell>
  );
}
