import { latestStamp } from "@/data/store";

export function companyStamp(companyId: string, userId: string) {
  return latestStamp(companyId, userId);
}
