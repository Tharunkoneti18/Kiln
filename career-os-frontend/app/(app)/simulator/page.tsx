import type { Metadata } from "next";
import { SimulatorView } from "@/components/pages/simulator";

export const metadata: Metadata = {
  title: "Job Shadow Simulator",
  description: "Realistic workplace scenarios before you enter the role.",
};

export default function Page() {
  return <SimulatorView />;
}
