import type { Metadata } from "next";
import { SettingsView } from "@/components/pages/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, preferences, integrations and your data.",
};

export default function Page() {
  return <SettingsView />;
}
