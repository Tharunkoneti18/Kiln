import type { Metadata } from "next";
import { AssessmentsView } from "@/components/pages/assessments";

export const metadata: Metadata = {
  title: "Proof-of-Skill Lab",
  description: "Assessments that verify what you can actually do.",
};

export default function Page() {
  return <AssessmentsView />;
}
