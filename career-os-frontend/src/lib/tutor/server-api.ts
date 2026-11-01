import { z } from "zod";
import { parseLessonManifest } from "./manifest";
import lessonFixture from "../../../content/lessons/sql-foundations.v1.json";

const lesson = parseLessonManifest(lessonFixture);
const maxBodyBytes = 64 * 1024;

export type TutorUser = { id: string; accessToken: string };

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function decodeSessionCookie(rawValue: string): string | null {
  let value = rawValue;
  try { value = decodeURIComponent(value); } catch { return null; }
  if (value.startsWith("base64-")) {
    try {
      const encoded = value.slice(7).replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      value = new TextDecoder().decode(bytes);
    } catch { return null; }
  }
  if (value.split(".").length === 3) return value;
  try {
    const session: unknown = JSON.parse(value);
    if (Array.isArray(session) && typeof session[0] === "string") return session[0];
    if (session && typeof session === "object" && "access_token" in session && typeof session.access_token === "string") return session.access_token;
  } catch { return null; }
  return null;
}

function accessTokenFromRequest(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    return match?.[1] ?? null;
  }

  const projectRef = process.env.SUPABASE_URL?.match(/^https?:\/\/([a-z0-9]+)\.supabase\.co\/?$/i)?.[1];
  const cookiePairs = (request.headers.get("cookie") ?? "").split(";").map((part) => {
    const separator = part.indexOf("=");
    return separator < 0 ? null : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()] as const;
  }).filter((pair): pair is readonly [string, string] => pair !== null);

  const directToken = cookiePairs.find(([name]) => name === "sb-access-token")?.[1];
  if (directToken) return decodeSessionCookie(directToken);
  if (!projectRef) return null;

  const cookieName = `sb-${projectRef}-auth-token`;
  const chunks = cookiePairs
    .map(([name, value]) => {
      if (name === cookieName) return { index: -1, value };
      if (!name.startsWith(`${cookieName}.`)) return null;
      const suffix = name.slice(cookieName.length + 1);
      return /^\d+$/.test(suffix) ? { index: Number(suffix), value } : null;
    })
    .filter((chunk): chunk is { index: number; value: string } => chunk !== null)
    .sort((left, right) => left.index - right.index);
  if (!chunks.length) return null;
  const numberedChunks = chunks.filter((chunk) => chunk.index >= 0);
  return decodeSessionCookie((numberedChunks.length ? numberedChunks : chunks).map((chunk) => chunk.value).join(""));
}

export async function requireTutorUser(request: Request): Promise<TutorUser | Response> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return jsonResponse({ error: "Tutor API is not configured." }, 503);

  const accessToken = accessTokenFromRequest(request);
  if (!accessToken) return jsonResponse({ error: "Authentication required." }, 401);

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401 || response.status === 403) return jsonResponse({ error: "Authentication required." }, 401);
    if (!response.ok) return jsonResponse({ error: "Authentication service is unavailable." }, 503);
    const user: unknown = await response.json();
    if (!user || typeof user !== "object" || !("id" in user) || typeof user.id !== "string" || !z.string().uuid().safeParse(user.id).success) {
      return jsonResponse({ error: "Authentication service returned an invalid user." }, 503);
    }
    return { id: user.id, accessToken };
  } catch {
    return jsonResponse({ error: "Authentication service is unavailable." }, 503);
  }
}

export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (origin || fetchSite === "same-origin" || request.headers.has("authorization")) return true;
  return !request.headers.has("cookie");
}

export function bodyTooLarge(request: Request): boolean {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  return Number.isFinite(contentLength) && contentLength > maxBodyBytes;
}

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return null;
    return JSON.parse(raw) as unknown;
  } catch { return null; }
}

export function supabaseRestUrl(path: string): string | null {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  return supabaseUrl ? `${supabaseUrl}/rest/v1/${path}` : null;
}

export function supabaseRestHeaders(user: TutorUser, extra: HeadersInit = {}): Headers {
  const headers = new Headers(extra);
  headers.set("apikey", process.env.SUPABASE_PUBLISHABLE_KEY ?? "");
  headers.set("Authorization", `Bearer ${user.accessToken}`);
  headers.set("Accept", "application/json");
  return headers;
}

export function getTutorLesson() { return lesson; }
