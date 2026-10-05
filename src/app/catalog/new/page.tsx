import type { Metadata } from "next";
import { NewBook } from "@/components/new-book";

export const metadata: Metadata = {
  title: "Add title",
};

export default function NewBookPage() {
  return <NewBook />;
}
