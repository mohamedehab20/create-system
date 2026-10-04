"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LiveRefresh({ stamp }: { stamp: string }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { stamp?: string };
        if (data.stamp && data.stamp !== stamp) router.refresh();
      } catch {
        /* the next poll retries */
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [router, stamp]);
  return null;
}
