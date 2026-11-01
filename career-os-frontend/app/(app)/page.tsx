import type { Metadata } from "next";
import { DashboardView } from "@/components/pages/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Where you are, what to do next, and how close you are to your goal.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
