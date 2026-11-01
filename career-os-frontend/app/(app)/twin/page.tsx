import type { Metadata } from "next";
import { TwinView } from "@/components/pages/twin";

export const metadata: Metadata = {
  title: "Digital Twin",
  description: "What you can actually demonstrate, updated after every learning activity.",
};

export default function Page() {
  return <TwinView />;
}
