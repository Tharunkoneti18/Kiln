import type {
  Application,
  Assessment,
  InterviewSession,
  JobOpportunity,
  JobPosting,
  LibraryItem,
  Notification,
  PathRoute,
  Project,
  ReadinessComponent,
  RoleOption,
  SimulationScenario,
  Skill,
  SkillDemand,
  WeeklyModule,
} from "./types";

/**
 * Frontend fixtures for Career OS.
 *
 * One scenario, taken from the platform definition's own example: a backend
 * developer targeting Applied AI Engineer, with weak RAG and evaluation
 * knowledge, in week 3 of the eight-week plan. Display data only.
 */

export const today = "2026-10-31";

export const learner = {
  name: "Rhea Dasgupta",
  initials: "RD",
  email: "rhea.dasgupta@example.com",
  headline: "Backend developer moving into applied AI engineering",
  stage: "Early career, 2 years experience",
  location: "Pune, India",
  weeklyHours: 10,
  learningDuration: "8 weeks",
  preferredDays: ["Mon", "Tue", "Thu", "Sat"],
  industries: ["Developer tools", "Fintech", "Health tech"],
  targetCompanies: ["Lattice Labs", "Northbeam AI", "Quill Health"],
  transitionGoal: "Ship production LLM features as an Applied AI Engineer within three months.",
  github: "github.com/rhea-dev",
  portfolio: "rhea.dev",
  education: [
    { degree: "B.Tech, Computer Engineering", school: "College of Engineering Pune", years: "2019 to 2023" },
  ],
  experience: [
    {
      role: "Backend Developer",
      company: "Tessellate Payments",
      years: "2023 to now",
      highlights: [
        "Built REST services in Python and FastAPI handling 40k requests a day",
        "Integrated three third-party payment APIs with retry and idempotency",
        "Wrote the unit and integration test suite for the ledger service",
      ],
    },
    {
      role: "Software Intern",
      company: "Kestrel Analytics",
      years: "2022",
      highlights: ["Automated weekly reporting with Python and PostgreSQL"],
    },
  ],
  certifications: [
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", year: "2024" },
    { name: "Embeddings and semantic search", issuer: "Career OS Proof Lab", year: "2026" },
  ],
  repos: [
    { name: "ledger-service-demo", language: "Python", stars: 14, lastCommit: "2026-10-12", skills: ["fastapi", "testing"] },
    { name: "semantic-notes", language: "Python", stars: 6, lastCommit: "2026-10-19", skills: ["embeddings", "vector-db"] },
    { name: "dotfiles", language: "Shell", stars: 2, lastCommit: "2026-08-02", skills: [] },
  ],
  versions: [
    { version: "v4", date: "2026-10-26", change: "Added semantic-notes project and embeddings certificate" },
    { version: "v3", date: "2026-10-12", change: "Target role changed to Applied AI Engineer" },
    { version: "v2", date: "2026-10-05", change: "Confirmed FastAPI and testing claims" },
    { version: "v1", date: "2026-10-03", change: "Profile created from uploaded resume" },
  ],
  history: [
    { from: "Software Intern", to: "Backend Developer", year: "2023" },
    { from: "Backend Developer", to: "Applied AI Engineer", year: "In progress" },
  ],
};

export const targetRole = {
  id: "applied-ai-engineer",
  title: "Applied AI Engineer",
  readiness: 46,
  postingsAnalysed: 214,
};

export const skills: Skill[] = [
  {
    id: "python", label: "Python", category: "engineering", state: "demonstrated",
    claimed: 4, demonstrated: 4, importance: 92, requirement: "mandatory", confidence: 0.93, priority: 6,
    effortHours: 0, lastUsed: "2026-10-30", dependsOn: [],
    evidence: [
      { id: "e1", kind: "project", excerpt: "ledger-service-demo, 2.1k lines with tests", source: "GitHub", capturedAt: "2026-10-12" },
      { id: "e2", kind: "assessment", excerpt: "Python coding challenge, 92 of 100", source: "Proof Lab", capturedAt: "2026-10-08" },
    ],
  },
  {
    id: "embeddings", label: "Embeddings and semantic search", category: "ai", state: "demonstrated",
    claimed: 2, demonstrated: 3, importance: 81, requirement: "mandatory", confidence: 0.82, priority: 14,
    effortHours: 0, lastUsed: "2026-10-19", dependsOn: ["python"],
    evidence: [
      { id: "e3", kind: "assessment", excerpt: "Week 1 assessment, 84 of 100", source: "Proof Lab", capturedAt: "2026-10-11" },
      { id: "e4", kind: "tutor", excerpt: "Completed 4 lectures on embeddings", source: "Tutor", capturedAt: "2026-10-10" },
    ],
  },
  {
    id: "vector-db", label: "Vector databases", category: "ai", state: "supported",
    claimed: 2, demonstrated: 2, importance: 78, requirement: "mandatory", confidence: 0.64, priority: 41,
    effortHours: 6, lastUsed: "2026-10-25", dependsOn: ["embeddings"],
    evidence: [{ id: "e5", kind: "project", excerpt: "semantic-notes uses pgvector", source: "GitHub", capturedAt: "2026-10-19" }],
  },
  {
    id: "rag", label: "RAG architecture", category: "ai", state: "gap",
    claimed: 2, demonstrated: 1, importance: 94, requirement: "mandatory", confidence: 0.41, priority: 92,
    effortHours: 14, lastUsed: "2026-10-30", dependsOn: ["embeddings", "vector-db", "llm-apis"],
    evidence: [{ id: "e6", kind: "self_reported", excerpt: "Built a RAG chatbot from a tutorial", source: "Onboarding", capturedAt: "2026-10-03" }],
  },
  {
    id: "evaluation", label: "LLM and retrieval evaluation", category: "ai", state: "gap",
    claimed: 1, demonstrated: 0, importance: 86, requirement: "mandatory", confidence: 0.22, priority: 88,
    effortHours: 12, lastUsed: "never", dependsOn: ["rag"], evidence: [],
  },
  {
    id: "llm-apis", label: "LLM APIs and tool calling", category: "ai", state: "transferable",
    claimed: 2, demonstrated: 1, importance: 83, requirement: "mandatory", confidence: 0.55, priority: 63,
    effortHours: 5, lastUsed: "2026-10-22", dependsOn: ["python"],
    bridge: "Your third-party API integration work covers auth, retries and schemas. The new part is streaming responses and structured tool calls.",
    evidence: [{ id: "e7", kind: "profile", excerpt: "Integrated three third-party payment APIs", source: "Resume, page 1", capturedAt: "2026-10-03" }],
  },
  {
    id: "prompt-engineering", label: "Prompt design", category: "ai", state: "supported",
    claimed: 3, demonstrated: 2, importance: 64, requirement: "preferred", confidence: 0.58, priority: 36,
    effortHours: 3, lastUsed: "2026-10-28", dependsOn: [],
    evidence: [{ id: "e8", kind: "tutor", excerpt: "Prompt patterns lecture and quiz", source: "Tutor", capturedAt: "2026-10-17" }],
  },
  {
    id: "fastapi", label: "FastAPI services", category: "engineering", state: "demonstrated",
    claimed: 3, demonstrated: 3, importance: 72, requirement: "mandatory", confidence: 0.88, priority: 10,
    effortHours: 0, lastUsed: "2026-10-29", dependsOn: ["python"],
    evidence: [{ id: "e9", kind: "project", excerpt: "ledger-service-demo REST API", source: "GitHub", capturedAt: "2026-10-12" }],
  },
  {
    id: "testing", label: "Testing and CI", category: "engineering", state: "transferable",
    claimed: 3, demonstrated: 2, importance: 61, requirement: "preferred", confidence: 0.6, priority: 34,
    effortHours: 4, lastUsed: "2026-10-12", dependsOn: ["python"],
    bridge: "Unit testing carries over. Testing non-deterministic model output needs golden sets and tolerance thresholds.",
    evidence: [{ id: "e10", kind: "profile", excerpt: "Wrote the ledger service test suite", source: "Resume, page 1", capturedAt: "2026-10-03" }],
  },
  {
    id: "docker", label: "Docker and deployment", category: "engineering", state: "supported",
    claimed: 2, demonstrated: 1, importance: 67, requirement: "mandatory", confidence: 0.5, priority: 47,
    effortHours: 6, lastUsed: "2026-07-14", dependsOn: [],
    evidence: [{ id: "e11", kind: "self_reported", excerpt: "Containerised a side project", source: "Onboarding", capturedAt: "2026-10-03" }],
  },
  {
    id: "system-design", label: "AI system design", category: "foundations", state: "unknown",
    claimed: 0, demonstrated: 0, importance: 70, requirement: "preferred", confidence: 0.1, priority: 52,
    effortHours: 8, lastUsed: "never", dependsOn: ["rag", "fastapi"], evidence: [],
  },
  {
    id: "sql", label: "SQL and PostgreSQL", category: "data", state: "demonstrated",
    claimed: 3, demonstrated: 3, importance: 55, requirement: "preferred", confidence: 0.86, priority: 5,
    effortHours: 0, lastUsed: "2026-10-26", dependsOn: [],
    evidence: [{ id: "e12", kind: "profile", excerpt: "Automated reporting with PostgreSQL", source: "Resume, page 2", capturedAt: "2026-10-03" }],
  },
  {
    id: "communication", label: "Technical communication", category: "professional", state: "demonstrated",
    claimed: 3, demonstrated: 3, importance: 58, requirement: "preferred", confidence: 0.8, priority: 7,
    effortHours: 0, lastUsed: "2026-10-27", dependsOn: [],
    evidence: [{ id: "e13", kind: "interview", excerpt: "Scored 4 of 5 on communication", source: "Mock interview", capturedAt: "2026-10-27" }],
  },
];

export const skillById = (id: string) => skills.find((skill) => skill.id === id);

export const roleOptions: RoleOption[] = [
  {
    id: "applied-ai-engineer", title: "Applied AI Engineer", level: "experienced", industry: "AI products",
    summary: "Builds LLM features into products: retrieval, tool use, evaluation and serving.",
    responsibilities: ["Design RAG pipelines", "Evaluate retrieval and answers", "Ship model-backed APIs"],
    compatibility: 46, transferable: ["Python", "FastAPI", "Testing"], missing: ["RAG", "Evaluation"],
    effortWeeks: 8, demandTrend: "rising", isTarget: true,
  },
  {
    id: "genai-developer", title: "GenAI Developer", level: "entry", industry: "AI products",
    summary: "Builds generative features and prototypes on top of hosted models.",
    responsibilities: ["Prototype LLM features", "Write prompts and chains", "Integrate model APIs"],
    compatibility: 58, transferable: ["Python", "LLM APIs", "Prompt design"], missing: ["RAG"],
    effortWeeks: 5, demandTrend: "rising",
  },
  {
    id: "ai-automation-engineer", title: "AI Automation Engineer", level: "entry", industry: "Operations",
    summary: "Automates business workflows with LLM agents and integrations.",
    responsibilities: ["Build agent workflows", "Integrate business systems", "Monitor automations"],
    compatibility: 63, transferable: ["Python", "API integration", "FastAPI"], missing: ["Tool calling"],
    effortWeeks: 4, demandTrend: "rising",
  },
  {
    id: "ai-evaluation-engineer", title: "AI Evaluation Engineer", level: "experienced", industry: "AI safety and quality",
    summary: "Measures model and retrieval quality with test sets and metrics.",
    responsibilities: ["Build evaluation sets", "Define quality metrics", "Report regressions"],
    compatibility: 39, transferable: ["Testing", "Python"], missing: ["Evaluation", "Statistics"],
    effortWeeks: 9, demandTrend: "rising",
  },
  {
    id: "ml-platform-engineer", title: "ML Platform Engineer", level: "experienced", industry: "Infrastructure",
    summary: "Runs the infrastructure that trains, serves and monitors models.",
    responsibilities: ["Serve models", "Build pipelines", "Own observability"],
    compatibility: 34, transferable: ["Docker", "Python"], missing: ["Kubernetes", "MLOps"],
    effortWeeks: 12, demandTrend: "steady",
  },
  {
    id: "ai-engineering-intern", title: "AI Engineering Intern", level: "internship", industry: "AI products",
    summary: "Supports an AI team on retrieval, evaluation and tooling tasks.",
    responsibilities: ["Write evaluation scripts", "Prototype retrieval", "Document experiments"],
    compatibility: 71, transferable: ["Python", "SQL"], missing: ["Evaluation"],
    effortWeeks: 2, demandTrend: "steady",
  },
];

export const postings: JobPosting[] = [
  {
    id: "jp-1", company: "Lattice Labs", title: "Applied AI Engineer", source: "API", ingestedAt: "2026-10-29",
    experience: "2+ years backend", required: ["Python", "RAG", "Vector databases", "Evaluation"],
    preferred: ["FastAPI", "Docker"], technologies: ["pgvector", "OpenAI API", "FastAPI"],
    deliverables: ["Ship a retrieval service", "Own answer quality metrics"],
  },
  {
    id: "jp-2", company: "Northbeam AI", title: "AI Engineer, Search", source: "API", ingestedAt: "2026-10-27",
    experience: "1 to 3 years", required: ["Python", "Embeddings", "RAG", "LLM APIs"],
    preferred: ["Evaluation", "Kubernetes"], technologies: ["Qdrant", "LangChain", "Anthropic API"],
    deliverables: ["Improve search relevance", "Build offline eval harness"],
  },
  {
    id: "jp-3", company: "Quill Health", title: "Applied ML Engineer, LLM", source: "Pasted", ingestedAt: "2026-10-24",
    experience: "2+ years", required: ["Python", "RAG", "Evaluation", "Testing"],
    preferred: ["HIPAA experience"], technologies: ["Weaviate", "FastAPI", "Ragas"],
    deliverables: ["Clinical document Q&A", "Hallucination monitoring"],
  },
  {
    id: "jp-4", company: "Corvid Systems", title: "GenAI Backend Engineer", source: "Manual upload", ingestedAt: "2026-10-21",
    experience: "2 years", required: ["Python", "FastAPI", "LLM APIs", "Docker"],
    preferred: ["RAG"], technologies: ["FastAPI", "Redis", "OpenAI API"],
    deliverables: ["Model gateway service", "Rate limiting and caching"],
  },
];

export const skillDemand: SkillDemand[] = [
  { skill: "Python", frequency: 96, change: 1, mandatoryShare: 94 },
  { skill: "RAG", frequency: 81, change: 9, mandatoryShare: 72 },
  { skill: "LLM APIs", frequency: 77, change: 6, mandatoryShare: 68 },
  { skill: "Vector databases", frequency: 69, change: 7, mandatoryShare: 55 },
  { skill: "Evaluation", frequency: 64, change: 14, mandatoryShare: 49 },
  { skill: "Docker", frequency: 58, change: 0, mandatoryShare: 41 },
  { skill: "FastAPI", frequency: 51, change: 3, mandatoryShare: 33 },
  { skill: "Agents and tool use", frequency: 47, change: 18, mandatoryShare: 26 },
  { skill: "Fine-tuning", frequency: 22, change: -5, mandatoryShare: 9 },
];

export const marketTrends = [
  { label: "Evaluation is moving from preferred to mandatory", detail: "Mandatory in 49% of postings, up from 31% last quarter." },
  { label: "Agents and tool use are the fastest-rising skill", detail: "Mentioned in 47% of postings, up 18 points." },
  { label: "Fine-tuning is cooling for applied roles", detail: "Down 5 points; most teams prefer retrieval over custom training." },
];

export const pathRoutes: PathRoute[] = [
  {
    id: "direct", title: "Direct transition", recommended: true,
    steps: [{ role: "Backend Developer", weeks: 0 }, { role: "Applied AI Engineer", weeks: 8 }],
    totalWeeks: 8, skillCoverage: 46, sharedSkills: ["Python", "FastAPI", "Testing", "SQL"], newSkills: ["RAG", "Evaluation", "Deployment"],
  },
  {
    id: "via-automation", title: "Through AI Automation Engineer",
    steps: [{ role: "Backend Developer", weeks: 0 }, { role: "AI Automation Engineer", weeks: 4 }, { role: "Applied AI Engineer", weeks: 6 }],
    totalWeeks: 10, skillCoverage: 63, sharedSkills: ["Python", "API integration", "FastAPI"], newSkills: ["Tool calling", "RAG", "Evaluation"],
  },
  {
    id: "via-genai", title: "Through GenAI Developer",
    steps: [{ role: "Backend Developer", weeks: 0 }, { role: "GenAI Developer", weeks: 5 }, { role: "Applied AI Engineer", weeks: 5 }],
    totalWeeks: 10, skillCoverage: 58, sharedSkills: ["Python", "LLM APIs", "Prompt design"], newSkills: ["RAG", "Evaluation"],
  },
];

const dayPlan = (week: number, done: boolean): WeeklyModule["days"] => [
  { id: "w" + week + "-mon", day: "Mon", title: "Tutor lecture", kind: "lesson", minutes: 45, done, lessonId: week === 3 ? "rag-architecture" : undefined },
  { id: "w" + week + "-tue", day: "Tue", title: "Guided exercise", kind: "exercise", minutes: 60, done },
  { id: "w" + week + "-thu", day: "Thu", title: "Weekly assignment", kind: "assignment", minutes: 90, done },
  { id: "w" + week + "-sat", day: "Sat", title: "Revision and checkpoint", kind: "checkpoint", minutes: 40, done },
];

export const learningPlan: WeeklyModule[] = [
  {
    id: "wm-1", week: 1, objective: "Embeddings and semantic search", skillIds: ["embeddings"], status: "completed", hours: 9,
    topics: ["What an embedding is", "Cosine similarity", "Semantic versus keyword search"],
    resources: [{ label: "Embeddings explained", kind: "generated" }, { label: "Sentence Transformers docs", kind: "docs" }],
    assignment: "Build semantic search over 500 support tickets", checkpoint: "Week 1 assessment, passed 84",
    days: dayPlan(1, true),
  },
  {
    id: "wm-2", week: 2, objective: "Vector databases and retrieval", skillIds: ["vector-db"], status: "completed", hours: 10,
    topics: ["Indexes: HNSW and IVF", "pgvector setup", "Metadata filtering"],
    resources: [{ label: "pgvector README", kind: "docs" }, { label: "Choosing a vector store", kind: "article" }],
    assignment: "Move semantic-notes onto pgvector with filters", checkpoint: "Week 2 assessment, passed 76",
    days: dayPlan(2, true),
  },
  {
    id: "wm-3", week: 3, objective: "RAG architecture and implementation", skillIds: ["rag", "llm-apis"], status: "in_progress", hours: 11,
    topics: ["Why retrieval", "The RAG pipeline", "Chunking and grounding", "Citations"],
    resources: [{ label: "RAG architecture lecture", kind: "generated" }, { label: "Lewis et al. 2020", kind: "article" }, { label: "Building RAG from scratch", kind: "video" }],
    assignment: "Question answering over your own documentation with citations", checkpoint: "Explain the pipeline end to end",
    days: [
      { id: "w3-mon", day: "Mon", title: "Lecture: RAG architecture", kind: "lesson", minutes: 45, done: true, lessonId: "rag-architecture" },
      { id: "w3-tue", day: "Tue", title: "Exercise: chunk and embed docs", kind: "exercise", minutes: 60, done: true },
      { id: "w3-thu", day: "Thu", title: "Assignment: grounded Q&A with citations", kind: "assignment", minutes: 90, done: false },
      { id: "w3-sat", day: "Sat", title: "Checkpoint quiz and revision", kind: "checkpoint", minutes: 40, done: false },
    ],
  },
  {
    id: "wm-4", week: 4, objective: "Retrieval and answer evaluation", skillIds: ["evaluation"], status: "upcoming", hours: 10,
    topics: ["Golden question sets", "Recall at k and MRR", "Faithfulness and answer relevance"],
    resources: [{ label: "Evaluating RAG", kind: "generated" }, { label: "Ragas docs", kind: "docs" }],
    assignment: "Evaluation harness for the week 3 system", checkpoint: "Week 4 assessment",
    days: dayPlan(4, false),
  },
  {
    id: "wm-5", week: 5, objective: "FastAPI and LLM application integration", skillIds: ["fastapi", "llm-apis"], status: "upcoming", hours: 9,
    topics: ["Streaming responses", "Tool calling", "Rate limits and retries"],
    resources: [{ label: "FastAPI streaming", kind: "docs" }], assignment: "Serve the RAG system behind a streaming API", checkpoint: "Code review checkpoint",
    days: dayPlan(5, false),
  },
  {
    id: "wm-6", week: 6, objective: "Production-ready AI application", skillIds: ["system-design", "testing"], status: "upcoming", hours: 10,
    topics: ["Caching", "Observability", "Guardrails"],
    resources: [{ label: "Production LLM checklist", kind: "generated" }], assignment: "Add tracing and guardrails", checkpoint: "Architecture design exercise",
    days: dayPlan(6, false),
  },
  {
    id: "wm-7", week: 7, objective: "Deployment and testing", skillIds: ["docker", "testing"], status: "upcoming", hours: 9,
    topics: ["Containers", "CI pipelines", "Regression tests for prompts"],
    resources: [{ label: "Docker for Python services", kind: "video" }], assignment: "Deploy with CI and eval gates", checkpoint: "Deployment checklist",
    days: dayPlan(7, false),
  },
  {
    id: "wm-8", week: 8, objective: "Capstone project and assessment", skillIds: ["rag", "evaluation", "system-design"], status: "upcoming", hours: 12,
    topics: ["Capstone scoping", "Demo and write-up"],
    resources: [{ label: "Capstone brief", kind: "generated" }], assignment: "Capstone: grounded assistant for a real domain", checkpoint: "Final proof-of-skill assessment",
    days: dayPlan(8, false),
  },
];

export const currentWeek = learningPlan.find((module) => module.status === "in_progress")!;

export const tutorSessions = [
  { id: "s-12", lessonId: "rag-architecture", title: "RAG architecture: retrieve, then generate", progress: 38, lastOpened: "2026-10-30", chapter: "Trace a query through the pipeline" },
  { id: "s-11", lessonId: "vector-indexes", title: "Vector indexes: HNSW and IVF", progress: 100, lastOpened: "2026-10-24", chapter: "Completed" },
  { id: "s-10", lessonId: "pgvector", title: "Setting up pgvector", progress: 100, lastOpened: "2026-10-22", chapter: "Completed" },
  { id: "s-9", lessonId: "cosine-similarity", title: "Cosine similarity, visually", progress: 100, lastOpened: "2026-10-09", chapter: "Completed" },
];

export const unansweredQuestions = [
  "When should I re-rank results instead of increasing k?",
  "How do I pick chunk overlap for code documentation?",
];

export const library: LibraryItem[] = [
  { id: "lb-1", kind: "lecture", title: "RAG architecture: retrieve, then generate", topic: "RAG", excerpt: "3 chapters, paused at chapter 2", createdAt: "2026-10-30", inRevision: false },
  { id: "lb-2", kind: "notes", title: "Generated notes: the RAG pipeline", topic: "RAG", excerpt: "Query, embed, search, top-k, prompt, answer.", createdAt: "2026-10-30", inRevision: true },
  { id: "lb-3", kind: "snapshot", title: "Whiteboard: six-stage pipeline", topic: "RAG", excerpt: "Saved at 0:41 in chapter 2", createdAt: "2026-10-30", inRevision: true },
  { id: "lb-4", kind: "transcript", title: "Transcript: vector indexes", topic: "Vector databases", excerpt: "HNSW builds a layered graph so search can skip ahead.", createdAt: "2026-10-24", inRevision: false },
  { id: "lb-5", kind: "diagram", title: "HNSW layers diagram", topic: "Vector databases", excerpt: "Generated during the indexes lecture", createdAt: "2026-10-24", inRevision: false },
  { id: "lb-6", kind: "question", title: "Why normalise vectors before cosine search?", topic: "Embeddings", excerpt: "Saved explanation with a worked example", createdAt: "2026-10-09", inRevision: true },
  { id: "lb-7", kind: "document", title: "Company engineering handbook.pdf", topic: "Uploads", excerpt: "Used as the corpus for the week 3 assignment", createdAt: "2026-10-28", inRevision: false },
  { id: "lb-8", kind: "bookmark", title: "Cosine similarity versus dot product", topic: "Embeddings", excerpt: "Bookmarked at 3:12 in lecture", createdAt: "2026-10-09", inRevision: false },
  { id: "lb-9", kind: "notes", title: "Personal notes: chunk sizes I tried", topic: "RAG", excerpt: "256 lost context. 1024 blurred meaning. 512 with 64 overlap worked.", createdAt: "2026-10-29", inRevision: false },
];

export const assessments: Assessment[] = [
  {
    id: "as-1", kind: "quiz", title: "Embeddings checkpoint", topic: "Embeddings", skillIds: ["embeddings"], status: "passed", score: 84, attempts: 1, minutes: 15,
    rubric: [{ label: "Concepts", score: 9, max: 10 }, { label: "Applied reasoning", score: 7, max: 10 }],
    feedback: "Strong on similarity metrics. Revisit when to normalise vectors.",
  },
  {
    id: "as-2", kind: "coding", title: "Build a semantic search endpoint", topic: "Vector databases", skillIds: ["vector-db", "fastapi"], status: "passed", score: 76, attempts: 2, minutes: 60,
    rubric: [{ label: "Correctness", score: 8, max: 10 }, { label: "Code quality", score: 7, max: 10 }, { label: "Tests", score: 6, max: 10 }],
    feedback: "All 12 automated tests pass. Index creation is not idempotent.",
  },
  {
    id: "as-3", kind: "debugging", title: "Fix a retriever returning stale chunks", topic: "RAG", skillIds: ["rag"], status: "needs_work", score: 48, attempts: 1, minutes: 40,
    rubric: [{ label: "Diagnosis", score: 4, max: 10 }, { label: "Fix", score: 5, max: 10 }],
    feedback: "You found the cache but missed that embeddings were never re-computed after updates. A revision lecture has been added.",
  },
  { id: "as-4", kind: "mcq", title: "RAG pipeline stages", topic: "RAG", skillIds: ["rag"], status: "available", attempts: 0, minutes: 10 },
  { id: "as-5", kind: "descriptive", title: "Explain grounding to a product manager", topic: "RAG", skillIds: ["rag", "communication"], status: "available", attempts: 0, minutes: 20 },
  { id: "as-6", kind: "architecture", title: "Design a document Q&A system", topic: "System design", skillIds: ["system-design", "rag"], status: "available", attempts: 0, minutes: 45 },
  { id: "as-7", kind: "coding", title: "Recall at k evaluation harness", topic: "Evaluation", skillIds: ["evaluation"], status: "locked", attempts: 0, minutes: 60 },
  { id: "as-8", kind: "project", title: "Capstone proof-of-skill", topic: "Capstone", skillIds: ["rag", "evaluation", "system-design"], status: "locked", attempts: 0, minutes: 240 },
];

export const projects: Project[] = [
  {
    id: "pj-1", title: "semantic-notes", status: "completed", evaluation: 82,
    summary: "Semantic search over personal notes with pgvector and metadata filters.",
    skillIds: ["embeddings", "vector-db", "python"],
    milestones: [{ label: "Embed notes", done: true }, { label: "pgvector index", done: true }, { label: "Search API", done: true }, { label: "README", done: true }],
    architecture: ["FastAPI", "pgvector", "Sentence Transformers"], repo: "github.com/rhea-dev/semantic-notes",
  },
  {
    id: "pj-2", title: "docs-copilot", status: "in_progress",
    summary: "Grounded Q&A over an engineering handbook, with citations and an evaluation set.",
    skillIds: ["rag", "evaluation", "fastapi"],
    milestones: [{ label: "Chunk and embed corpus", done: true }, { label: "Retriever with top-k", done: true }, { label: "Cited answers", done: false }, { label: "Golden question set", done: false }, { label: "Deploy", done: false }],
    architecture: ["FastAPI", "pgvector", "LLM API", "Ragas"], repo: "github.com/rhea-dev/docs-copilot",
  },
  {
    id: "pj-3", title: "Eval dashboard for RAG regressions", status: "recommended",
    summary: "Track recall at k and faithfulness across prompt and index changes. Covers your evaluation gap directly.",
    skillIds: ["evaluation", "testing"],
    milestones: [{ label: "Define metrics", done: false }, { label: "Run against two configs", done: false }, { label: "Chart regressions", done: false }],
    architecture: ["Python", "Ragas", "SQLite"],
  },
  {
    id: "pj-4", title: "Support ticket triage agent", status: "recommended",
    summary: "An agent that classifies and routes tickets with tool calls. Covers LLM APIs and system design together.",
    skillIds: ["llm-apis", "system-design", "docker"],
    milestones: [{ label: "Tool schema", done: false }, { label: "Routing logic", done: false }, { label: "Container and deploy", done: false }],
    architecture: ["FastAPI", "LLM tool calling", "Docker"],
  },
];

export const simulations: SimulationScenario[] = [
  {
    id: "sim-1", title: "The support bot is making things up", role: "Applied AI Engineer", stakeholder: "Priya, Engineering Manager",
    brief: "Customers report the support assistant invents refund policies. Find out why and propose a fix by end of day.",
    tasks: [
      { label: "Clarify what 'making things up' means with the stakeholder", kind: "requirements", done: true },
      { label: "Inspect retrieval logs for three failing queries", kind: "debugging", done: true },
      { label: "Propose a grounding and citation change", kind: "architecture", done: false },
      { label: "Write the incident update for the support lead", kind: "communication", done: false },
    ],
    twist: "Midway, legal asks that every answer cite a policy document.", status: "in_progress",
  },
  {
    id: "sim-2", title: "Latency budget cut in half", role: "Applied AI Engineer", stakeholder: "Dev, Product Lead",
    brief: "The search feature must answer within 1.5 seconds instead of 3. Decide what to trade.",
    tasks: [
      { label: "Profile the pipeline stages", kind: "implementation", done: true },
      { label: "Choose between caching, smaller model, or fewer chunks", kind: "architecture", done: true },
      { label: "Review a teammate's caching PR", kind: "review", done: true },
    ],
    twist: "The product lead changes the target to mobile-only traffic.", status: "completed", score: 78,
  },
  {
    id: "sim-3", title: "Onboard a new document source", role: "Applied AI Engineer", stakeholder: "Marcus, Data Engineer",
    brief: "A team wants their Confluence space searchable. Scope it, then build the ingestion.",
    tasks: [
      { label: "Gather requirements and access constraints", kind: "requirements", done: false },
      { label: "Design incremental ingestion", kind: "architecture", done: false },
      { label: "Implement and test the connector", kind: "implementation", done: false },
    ],
    twist: "Half the pages are permission-restricted.", status: "available",
  },
];

export const interviewSessions: InterviewSession[] = [
  {
    id: "iv-4", type: "technical", persona: "Direct senior engineer", date: "2026-10-27", minutes: 32,
    scores: { technical: 3, communication: 4, problemSolving: 3 },
    weaknesses: ["Evaluation metrics", "Chunking trade-offs"],
    transcript: [
      { speaker: "interviewer", text: "How would you know your RAG system got better after a change?" },
      { speaker: "you", text: "I would compare answers manually on a few questions before and after." },
      { speaker: "interviewer", text: "What if you had two hundred questions and a release every day?" },
      { speaker: "you", text: "Then I would need an automated metric, maybe recall at k on a labelled set." },
    ],
  },
  {
    id: "iv-3", type: "behavioral", persona: "Friendly hiring manager", date: "2026-10-20", minutes: 25,
    scores: { technical: 3, communication: 4, problemSolving: 4 },
    weaknesses: ["Quantifying impact"],
    transcript: [{ speaker: "interviewer", text: "Tell me about a time a system you owned failed." }],
  },
  {
    id: "iv-2", type: "system_design", persona: "Skeptical architect", date: "2026-10-13", minutes: 40,
    scores: { technical: 2, communication: 3, problemSolving: 2 },
    weaknesses: ["Evaluation metrics", "Capacity estimates", "Caching layers"],
    transcript: [{ speaker: "interviewer", text: "Design document search for ten million pages." }],
  },
  {
    id: "iv-1", type: "hr", persona: "Recruiter screen", date: "2026-10-06", minutes: 15,
    scores: { technical: 2, communication: 3, problemSolving: 3 },
    weaknesses: ["Explaining the career switch"],
    transcript: [{ speaker: "interviewer", text: "Why move from backend into AI engineering?" }],
  },
];

/** Mistakes seen more than once across sessions. */
export const weaknessMemory = [
  { weakness: "Evaluation metrics", seen: 2, lastSeen: "2026-10-27", action: "Week 4 lecture on recall at k and faithfulness" },
  { weakness: "Chunking trade-offs", seen: 1, lastSeen: "2026-10-27", action: "Revise chapter 3 of the RAG lecture" },
  { weakness: "Capacity estimates", seen: 1, lastSeen: "2026-10-13", action: "System design drill" },
];

export const readinessComponents: ReadinessComponent[] = [
  { label: "Skill evidence coverage", value: 46, basis: "6 of 13 required skills backed by an assessment or project" },
  { label: "Learning completion", value: 31, basis: "2 of 8 weekly modules complete, week 3 half done" },
  { label: "Assessment performance", value: 69, basis: "Average 69 across 3 graded assessments" },
  { label: "Project completion", value: 40, basis: "1 of 2 active projects shipped" },
  { label: "Interview performance", value: 66, basis: "Latest technical session, 3.3 of 5 average" },
];

export const readinessHistory = [
  { week: "W-1", value: 21 },
  { week: "W1", value: 27 },
  { week: "W2", value: 35 },
  { week: "W3", value: 46 },
];

export const milestones = [
  { label: "Career profile created", date: "2026-10-03", done: true },
  { label: "First skill demonstrated", date: "2026-10-11", done: true },
  { label: "First project shipped", date: "2026-10-19", done: true },
  { label: "RAG demonstrated", date: "Week 3", done: false },
  { label: "Evaluation demonstrated", date: "Week 4", done: false },
  { label: "Capstone passed", date: "Week 8", done: false },
];

export const jobs: JobOpportunity[] = [
  {
    id: "jb-1", company: "Lattice Labs", title: "Applied AI Engineer", type: "job", location: "Bengaluru", remote: true,
    match: 72, matchedSkills: ["Python", "FastAPI", "Embeddings", "Vector databases"], missingSkills: ["Evaluation"],
    eligible: true, deadline: "2026-11-14", bookmarked: true,
    why: "Their posting weights FastAPI and pgvector, both of which you have shipped. Evaluation is the one mandatory gap, and it is week 4 of your plan.",
  },
  {
    id: "jb-2", company: "Northbeam AI", title: "AI Engineer, Search", type: "job", location: "Remote, India", remote: true,
    match: 66, matchedSkills: ["Python", "Embeddings"], missingSkills: ["RAG", "LLM APIs"],
    eligible: true, deadline: "2026-11-20", bookmarked: false,
    why: "Search-heavy role that matches your embeddings evidence. Apply after week 3 when RAG is demonstrated.",
  },
  {
    id: "jb-3", company: "Corvid Systems", title: "GenAI Backend Engineer", type: "entry", location: "Pune", remote: false,
    match: 78, matchedSkills: ["Python", "FastAPI", "Docker"], missingSkills: ["LLM APIs"],
    eligible: true, deadline: "2026-11-08", bookmarked: true,
    why: "The closest adjacent role: mostly backend, with model APIs on top. Your strongest current match.",
  },
  {
    id: "jb-4", company: "Quill Health", title: "AI Engineering Intern", type: "internship", location: "Remote", remote: true,
    match: 81, matchedSkills: ["Python", "SQL", "Embeddings"], missingSkills: [],
    eligible: false, deadline: "2026-11-30", bookmarked: false,
    why: "Strong skill match, but the internship requires current student enrolment.",
  },
  {
    id: "jb-5", company: "Halden Fintech", title: "AI Automation Engineer", type: "entry", location: "Mumbai", remote: false,
    match: 69, matchedSkills: ["Python", "API integration", "FastAPI"], missingSkills: ["Tool calling"],
    eligible: true, deadline: "2026-11-18", bookmarked: false,
    why: "Fintech domain overlaps with your payments experience. Tool calling is covered in week 5.",
  },
];

export const applications: Application[] = [
  { id: "ap-1", company: "Corvid Systems", role: "GenAI Backend Engineer", stage: "interview", appliedAt: "2026-10-14", resumeVersion: "Resume v3 (AI focus)", nextStep: "Technical interview", nextDate: "2026-11-04", recruiterResponded: true },
  { id: "ap-2", company: "Lattice Labs", role: "Applied AI Engineer", stage: "screen", appliedAt: "2026-10-21", resumeVersion: "Resume v3 (AI focus)", nextStep: "Recruiter call", nextDate: "2026-11-02", recruiterResponded: true },
  { id: "ap-3", company: "Brightwater AI", role: "LLM Engineer", stage: "rejected", appliedAt: "2026-10-02", resumeVersion: "Resume v2 (backend)", recruiterResponded: true, feedback: "Looking for hands-on evaluation experience." },
  { id: "ap-4", company: "Meridian Cloud", role: "AI Platform Engineer", stage: "no_response", appliedAt: "2026-10-05", resumeVersion: "Resume v2 (backend)", nextStep: "Follow up", nextDate: "2026-11-01", recruiterResponded: false },
  { id: "ap-5", company: "Halden Fintech", role: "AI Automation Engineer", stage: "applied", appliedAt: "2026-10-28", resumeVersion: "Resume v3 (AI focus)", recruiterResponded: false },
  { id: "ap-6", company: "Orbit Analytics", role: "Applied ML Engineer", stage: "rejected", appliedAt: "2026-10-08", resumeVersion: "Resume v2 (backend)", recruiterResponded: true, feedback: "No feedback given." },
  { id: "ap-7", company: "Northbeam AI", role: "AI Engineer, Search", stage: "saved", appliedAt: null, resumeVersion: "Resume v3 (AI focus)", nextStep: "Apply after week 3", recruiterResponded: false },
];

export const resumeVariants = [
  { version: "Resume v2 (backend)", sent: 3, responses: 2, interviews: 0 },
  { version: "Resume v3 (AI focus)", sent: 3, responses: 2, interviews: 1 },
];

export const notifications: Notification[] = [
  { id: "n-1", kind: "learning", title: "Today: Weekly assignment", body: "Grounded Q&A with citations, about 90 minutes.", time: "8:00", read: false, href: "/plan" },
  { id: "n-2", kind: "interview", title: "Technical interview in 4 days", body: "Corvid Systems. A focused mock session is ready.", time: "Yesterday", read: false, href: "/interviews" },
  { id: "n-3", kind: "application", title: "Follow up with Meridian Cloud", body: "No response in 26 days. A follow-up note is drafted.", time: "Yesterday", read: false, href: "/applications" },
  { id: "n-4", kind: "recovery", title: "You missed Saturday's revision", body: "Moved to Monday, 20 minutes. Nothing else shifts.", time: "2 days ago", read: true, href: "/plan" },
  { id: "n-5", kind: "assessment", title: "Debugging challenge needs a retest", body: "Scored 48. A revision lecture on index refresh is queued.", time: "3 days ago", read: true, href: "/assessments" },
  { id: "n-6", kind: "milestone", title: "Milestone: first project shipped", body: "semantic-notes added Vector databases evidence.", time: "Oct 19", read: true, href: "/projects" },
  { id: "n-7", kind: "opportunity", title: "New 78% match: Corvid Systems", body: "GenAI Backend Engineer, deadline Nov 8.", time: "Oct 18", read: true, href: "/jobs" },
  { id: "n-8", kind: "summary", title: "Week 2 summary", body: "10 hours learned, 1 assessment passed, readiness up 8 points.", time: "Oct 18", read: true, href: "/readiness" },
];

export const assistantPrompts = [
  "Why is RAG my top priority?",
  "Move Thursday's assignment to Friday",
  "Am I ready to apply to Lattice Labs?",
  "Summarise my progress this week",
];

/** Canned replies keyed by prompt. The assistant answers from platform data. */
export const assistantReplies: Record<string, string> = {
  "Why is RAG my top priority?":
    "RAG appears in 81% of the 214 Applied AI Engineer postings analysed, and it is mandatory in 72% of them. Your evidence for it is one self-reported tutorial and a 48 on the debugging challenge, so it has the highest gap priority (92) on your map. It also unlocks evaluation in week 4.",
  "Move Thursday's assignment to Friday":
    "Done as a proposal: the grounded Q&A assignment moves to Friday, 90 minutes. Friday is outside your preferred days, so Saturday's revision shrinks to 25 minutes to keep the week at 10 hours. Approve it in your plan to apply.",
  "Am I ready to apply to Lattice Labs?":
    "You match 72% of their requirements. Python, FastAPI and vector databases are backed by evidence. Evaluation is mandatory in their posting and you have none yet. Applying after week 4 would let you attach the evaluation harness as proof.",
  "Summarise my progress this week":
    "Week 3, RAG architecture: 2 of 4 tasks done, 105 of 235 minutes. You are 38% through the lecture and have two saved questions for the Tutor. Readiness moved from 35 to 46 since last week, mostly from the semantic-notes project evidence.",
};

export const onboardingOptions = {
  stages: ["Student", "Early career", "Mid career", "Career switcher", "Returning to work"],
  industries: ["Developer tools", "Fintech", "Health tech", "E-commerce", "Education", "Climate", "Media"],
  roles: ["Applied AI Engineer", "GenAI Developer", "AI Automation Engineer", "AI Evaluation Engineer", "ML Platform Engineer"],
  skillSuggestions: ["Python", "FastAPI", "SQL", "Docker", "Testing", "Git", "REST APIs", "Communication", "Embeddings"],
  durations: ["4 weeks", "8 weeks", "12 weeks", "6 months"],
};
