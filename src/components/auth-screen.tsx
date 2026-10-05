import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./ui";

export function AuthScreen({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex">
          <Logo />
        </Link>
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-[#e7e9ef]">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-[#5c6573]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-4 text-sm text-[#5c6573]">{footer}</p>
      </div>
    </div>
  );
}
