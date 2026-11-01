import type { Metadata } from "next";
import { NotificationsView } from "@/components/pages/notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Reminders, alerts and weekly summaries.",
};

export default function Page() {
  return <NotificationsView />;
}
