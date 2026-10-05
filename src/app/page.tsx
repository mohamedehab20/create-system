import type { Metadata } from "next";
import { Desk } from "@/components/desk";

export const metadata: Metadata = {
  title: "Desk",
};

export default function HomePage() {
  return <Desk />;
}
