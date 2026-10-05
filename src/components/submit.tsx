"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" disabled={pending}>
      {pending ? "لحظات…" : children}
    </button>
  );
}
