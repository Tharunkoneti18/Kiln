import type { Metadata } from "next";
import { ProjectsView } from "@/components/pages/projects";

export const metadata: Metadata = {
  title: "Projects and Portfolio",
  description: "Projects matched to your skill gaps.",
};

export default function Page() {
  return <ProjectsView />;
}
