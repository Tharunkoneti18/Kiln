import type { Metadata } from "next";
import { LibraryView } from "@/components/pages/library";

export const metadata: Metadata = {
  title: "Knowledge Vault",
  description: "Everything you have learned in one place.",
};

export default function Page() {
  return <LibraryView />;
}
