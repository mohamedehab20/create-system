import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./ui";

export function AuthScreen({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e7ecfa,_#f6f7fb_55%)]">
      <div className={`mx-auto flex flex-col px-5 py-10 ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <h1 className="text-2xl font-extrabold text-[#191c1d]">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-7 text-[#5c6573]">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
