import type { Metadata } from "next";
import { OptimizerView } from "@/components/pages/optimizer";

export const metadata: Metadata = {
  title: "Career Path Optimizer",
  description: "The shortest credible path toward your career goal.",
};

export default function Page() {
  return <OptimizerView />;
}
