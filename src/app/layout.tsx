import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Figtree, Fraunces, Noto_Naskh_Arabic } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Shorock — Library desk",
    template: "%s — Shorock",
  },
  description:
    "A library desk for titles, authors, bookstores, ISBNs, and whether a book is still on the shelf.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
