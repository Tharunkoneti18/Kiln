import type { Metadata } from "next";
import { RolesView } from "@/components/pages/roles";

export const metadata: Metadata = {
  title: "Career Opportunities",
  description: "Realistic roles and adjacent paths based on your current abilities.",
};

export default function Page() {
  return <RolesView />;
}
