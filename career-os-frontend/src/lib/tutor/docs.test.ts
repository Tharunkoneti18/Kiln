import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../../");

describe("Tutor handoff docs", () => {
  it("documents local run commands and environment variables", () => {
    const readme = readFileSync(resolve(root, "README.md"), "utf8");
    expect(readme).toContain("npm install");
    expect(readme).toContain("npm run dev");
    expect(readme).toContain("NEXT_PUBLIC_TUTOR_API_BASE_URL");
    expect(readme).toContain("localStorage");
  });

  it("documents Part A progress and event API routes", () => {
    const integration = readFileSync(resolve(root, "docs/tutor-part-a-integration.md"), "utf8");
    expect(integration).toContain("GET /api/v1/lessons/{id}/progress");
    expect(integration).toContain("PUT /api/v1/lessons/{id}/progress");
    expect(integration).toContain("POST /api/v1/learning-events");
    expect(integration).toContain("Idempotency-Key");
  });
});
