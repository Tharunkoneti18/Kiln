import type { Metadata } from "next";
import { InterviewsView } from "@/components/pages/interviews";

export const metadata: Metadata = {
  title: "Mock Interviews",
  description: "Adaptive interview practice with scoring and weakness memory.",
};

export default function Page() {
  return <InterviewsView />;
}
