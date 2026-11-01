/**
 * Display shapes for the Career OS frontend fixtures.
 *
 * Every module in the platform definition has a shape here. Field names follow
 * the shared integration contract (user, target role, skill, learning plan,
 * weekly module, lesson, session, assessment, skill evidence) so screens can
 * later be pointed at the real services without reshaping props.
 */

export type EvidenceState = "demonstrated" | "supported" | "transferable" | "gap" | "unknown";
export type EvidenceKind = "assessment" | "project" | "profile" | "self_reported" | "tutor" | "interview";
export type SkillCategory = "ai" | "engineering" | "data" | "foundations" | "professional";

export interface SkillEvidence {
  id: string;
  kind: EvidenceKind;
  excerpt: string;
  source: string;
  capturedAt: string;
}

export interface Skill {
  id: string;
  label: string;
  category: SkillCategory;
  state: EvidenceState;
  /** Level the user claims, 0 to 5. */
  claimed: number;
  /** Level backed by evidence, 0 to 5. */
  demonstrated: number;
  /** How much the target role asks for it, 0 to 100. */
  importance: number;
  requirement: "mandatory" | "preferred";
  /** Confidence in the assessment, 0 to 1. */
  confidence: number;
  /** Composite gap priority, 0 to 100. */
  priority: number;
  effortHours: number;
  lastUsed: string;
  dependsOn: string[];
  evidence: SkillEvidence[];
  bridge?: string;
}

export interface RoleOption {
  id: string;
  title: string;
  level: "internship" | "entry" | "experienced";
  industry: string;
  summary: string;
  responsibilities: string[];
  /** Share of required skills already backed by evidence, 0 to 100. */
  compatibility: number;
  transferable: string[];
  missing: string[];
  effortWeeks: number;
  demandTrend: "rising" | "steady" | "cooling";
  isTarget?: boolean;
}

export interface JobPosting {
  id: string;
  company: string;
  title: string;
  source: "API" | "Manual upload" | "Pasted";
  ingestedAt: string;
  experience: string;
  required: string[];
  preferred: string[];
  technologies: string[];
  deliverables: string[];
}

export interface SkillDemand {
  skill: string;
  /** Share of analysed postings mentioning it, 0 to 100. */
  frequency: number;
  /** Change versus the previous 90 days, in points. */
  change: number;
  mandatoryShare: number;
}

export interface PathRoute {
  id: string;
  title: string;
  steps: { role: string; weeks: number }[];
  totalWeeks: number;
  skillCoverage: number;
  sharedSkills: string[];
  newSkills: string[];
  recommended?: boolean;
}

export type ModuleStatus = "completed" | "in_progress" | "upcoming" | "missed";
export type TaskKind = "lesson" | "reading" | "exercise" | "assignment" | "revision" | "checkpoint" | "assessment";

export interface DailyTask {
  id: string;
  day: string;
  title: string;
  kind: TaskKind;
  minutes: number;
  done: boolean;
  lessonId?: string;
}

export interface WeeklyModule {
  id: string;
  week: number;
  objective: string;
  skillIds: string[];
  status: ModuleStatus;
  hours: number;
  topics: string[];
  resources: { label: string; kind: "docs" | "article" | "video" | "generated" }[];
  assignment: string;
  checkpoint: string;
  days: DailyTask[];
}

export type LibraryKind = "lecture" | "notes" | "transcript" | "snapshot" | "document" | "diagram" | "bookmark" | "question";

export interface LibraryItem {
  id: string;
  kind: LibraryKind;
  title: string;
  topic: string;
  excerpt: string;
  createdAt: string;
  inRevision: boolean;
}

export type AssessmentKind = "quiz" | "mcq" | "descriptive" | "coding" | "debugging" | "architecture" | "project";

export interface Assessment {
  id: string;
  kind: AssessmentKind;
  title: string;
  topic: string;
  skillIds: string[];
  status: "passed" | "needs_work" | "available" | "locked";
  score?: number;
  attempts: number;
  minutes: number;
  rubric?: { label: string; score: number; max: number }[];
  feedback?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  skillIds: string[];
  status: "recommended" | "in_progress" | "completed";
  milestones: { label: string; done: boolean }[];
  architecture: string[];
  repo?: string;
  evaluation?: number;
}

export interface SimulationScenario {
  id: string;
  title: string;
  role: string;
  stakeholder: string;
  brief: string;
  tasks: { label: string; kind: "requirements" | "architecture" | "implementation" | "debugging" | "review" | "communication"; done: boolean }[];
  twist: string;
  status: "completed" | "in_progress" | "available";
  score?: number;
}

export type InterviewType = "technical" | "hr" | "behavioral" | "system_design" | "project";

export interface InterviewSession {
  id: string;
  type: InterviewType;
  persona: string;
  date: string;
  minutes: number;
  scores: { technical: number; communication: number; problemSolving: number };
  weaknesses: string[];
  transcript: { speaker: "interviewer" | "you"; text: string }[];
}

export interface JobOpportunity {
  id: string;
  company: string;
  title: string;
  type: "job" | "internship" | "entry";
  location: string;
  remote: boolean;
  match: number;
  matchedSkills: string[];
  missingSkills: string[];
  eligible: boolean;
  deadline: string;
  why: string;
  bookmarked: boolean;
}

export type ApplicationStage = "saved" | "applied" | "screen" | "interview" | "offer" | "rejected" | "no_response";

export interface Application {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedAt: string | null;
  resumeVersion: string;
  nextStep?: string;
  nextDate?: string;
  recruiterResponded: boolean;
  feedback?: string;
}

export interface Notification {
  id: string;
  kind: "learning" | "assessment" | "assignment" | "interview" | "application" | "milestone" | "recovery" | "opportunity" | "summary";
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}

export interface ReadinessComponent {
  label: string;
  value: number;
  basis: string;
}
