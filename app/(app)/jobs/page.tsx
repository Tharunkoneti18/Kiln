import type { Metadata } from "next";
import { JobsView } from "@/components/pages/jobs";

export const metadata: Metadata = {
  title: "Opportunity Radar",
  description: "Jobs matched to your demonstrated skills.",
};

export default function Page() {
  return <JobsView />;
}
