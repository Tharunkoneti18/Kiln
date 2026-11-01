import type { Metadata } from "next";
import { ProfileView } from "@/components/pages/profile";

export const metadata: Metadata = {
  title: "Career Profile",
  description: "Your professional identity, skill claims and supporting evidence.",
};

export default function Page() {
  return <ProfileView />;
}
