import type { Metadata } from "next";
import { ReadinessView } from "@/components/pages/readiness";

export const metadata: Metadata = {
  title: "Career Readiness",
  description: "Evidence-based progress toward your target role.",
};

export default function Page() {
  return <ReadinessView />;
}
