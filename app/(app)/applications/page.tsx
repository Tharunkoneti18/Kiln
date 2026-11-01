import type { Metadata } from "next";
import { ApplicationsView } from "@/components/pages/applications";

export const metadata: Metadata = {
  title: "Applications",
  description: "Application tracking and outcome intelligence.",
};

export default function Page() {
  return <ApplicationsView />;
}
