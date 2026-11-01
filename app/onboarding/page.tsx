import type { Metadata } from "next";
import { OnboardingView } from "@/components/pages/onboarding";

export const metadata: Metadata = { title: "Get started" };

export default function OnboardingPage() {
  return <OnboardingView />;
}
