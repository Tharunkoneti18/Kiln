import type { Metadata } from "next";
import { GapsView } from "@/components/pages/gaps";

export const metadata: Metadata = {
  title: "Skill Gap Analysis",
  description: "What stands between you and your target role.",
};

export default function Page() {
  return <GapsView />;
}
