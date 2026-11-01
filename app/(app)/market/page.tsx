import type { Metadata } from "next";
import { MarketView } from "@/components/pages/market";

export const metadata: Metadata = {
  title: "Job Market Intelligence",
  description: "What companies actually demand, extracted from real job descriptions.",
};

export default function Page() {
  return <MarketView />;
}
