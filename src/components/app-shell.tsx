"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Desk" },
  { href: "/catalog", label: "Catalog" },
  { href: "/catalog/new", label: "Add title" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/catalog/new") return pathname === "/catalog/new";
  return (
    pathname === "/catalog" ||
    (pathname.startsWith("/catalog/") && pathname !== "/catalog/new")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-md">
            <span
              aria-hidden
              className="grid h-11 w-11 place-items-center rounded-md bg-burgundy text-card"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <rect x="3" y="3" width="3.2" height="18" rx="0.6" />
                <rect x="7.2" y="3" width="2.4" height="18" rx="0.6" opacity="0.55" />
                <rect x="10.6" y="3" width="4.2" height="18" rx="0.6" />
                <rect x="15.8" y="3" width="2" height="18" rx="0.6" opacity="0.75" />
                <rect x="18.8" y="3" width="2.2" height="18" rx="0.6" opacity="0.4" />
              </svg>
            </span>
            <span>
              <span className="block font-serif text-2xl leading-none tracking-tight">
                Shorock
              </span>
              <span lang="ar" className="mt-1 block text-sm text-ink-soft">
                نظام إدارة المكتبة
              </span>
            </span>
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              const isAdd = link.href === "/catalog/new";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    isAdd
                      ? "rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-card hover:bg-[#732630]"
                      : active
                        ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-card"
                        : "rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-ink-soft sm:px-6">
          Titles, authors, bookstores, and ISBNs stay in this browser.
        </p>
      </footer>
    </div>
  );
}
