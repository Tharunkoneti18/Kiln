import type { Metadata } from "next";
import lessonJson from "../../../content/lessons/rag-architecture.v1.json";
import { TutorRoom } from "@/components/tutor/TutorRoom";
import { TutorSessions } from "@/components/tutor/TutorSessions";
import { parseLessonManifest } from "@/lib/tutor/manifest";

export const metadata: Metadata = {
  title: "AI Tutor",
  description:
    "Interactive lessons from your learning plan, with a 3D instructor, narration, a synchronised whiteboard and questions at any time.",
};

// The lesson comes from the current weekly module of the learning plan.
const lesson = parseLessonManifest(lessonJson);

export default function TutorPage() {
  return (
    <>
      <TutorRoom
        lesson={lesson}
        context="Week 3 of your plan: RAG architecture and implementation"
        pathLabel="Applied AI Engineer path"
      />
      <TutorSessions />
    </>
  );
}
