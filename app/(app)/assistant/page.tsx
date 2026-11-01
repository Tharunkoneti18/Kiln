import type { Metadata } from "next";
import { AssistantView } from "@/components/pages/assistant";

export const metadata: Metadata = {
  title: "AI Career Assistant",
  description: "Ask about your plan, gaps, projects and applications.",
};

export default function Page() {
  return <AssistantView />;
}
