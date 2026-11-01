import type { Metadata } from "next";
import { PlannerView } from "@/components/pages/planner";

export const metadata: Metadata = {
  title: "Learning Planner",
  description: "Your personalized week-by-week learning plan.",
};

export default function Page() {
  return <PlannerView />;
}
