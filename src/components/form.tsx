"use client";

import { useFormStatus } from "react-dom";
import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/domain/types";

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}

export function SubmitButton({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "ghost" | "danger" }) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-[#2563eb] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]",
    ghost: "bg-white text-[#0f172a] ring-1 ring-[#e5e7eb]",
    danger: "bg-red-600 text-white",
  }[variant];
  return (
    <button className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${styles}`} disabled={pending}>
      {pending ? "لحظات…" : children}
    </button>
  );
}

export function ConfirmSubmit({
  action,
  label,
  message,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {hidden
        ? Object.entries(hidden).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)
        : null}
      <button className="text-sm font-bold text-red-600">{label}</button>
    </form>
  );
}
