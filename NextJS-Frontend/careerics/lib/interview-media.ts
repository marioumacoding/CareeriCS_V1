const FASTAPI_PROXY_PREFIX = "/api/fastapi";

export type InterviewAudioKind = "questions" | "followups";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function resolveFastApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api";
  const trimmed = configured.replace(/\/+$/, "");

  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }

  if (trimmed.endsWith("/graphql")) {
    return trimmed.slice(0, -8);
  }

  return trimmed;
}

function toProxyPath(value: string, kind: InterviewAudioKind): string {
  if (isAbsoluteUrl(value)) {
    return value;
  }

  if (value.startsWith(`${FASTAPI_PROXY_PREFIX}/`)) {
    return value;
  }

  if (value.startsWith("/audio/")) {
    return `${FASTAPI_PROXY_PREFIX}${value}`;
  }

  if (value.startsWith("audio/")) {
    return `${FASTAPI_PROXY_PREFIX}/${value}`;
  }

  if (value.startsWith("/")) {
    return `${FASTAPI_PROXY_PREFIX}${value}`;
  }

  return `${FASTAPI_PROXY_PREFIX}/audio/${kind}/${value}`;
}

function toDirectPath(value: string, kind: InterviewAudioKind): string {
  if (value.startsWith("/api/fastapi/")) {
    return value.replace("/api/fastapi", "");
  }

  if (value.startsWith("/audio/")) {
    return value;
  }

  if (value.startsWith("audio/")) {
    return `/${value}`;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/audio/${kind}/${value}`;
}

export function buildInterviewAudioCandidates(
  rawValue: string | null | undefined,
  kind: InterviewAudioKind,
): string[] {
  if (!rawValue) {
    return [];
  }

  const value = rawValue.trim();
  if (!value) {
    return [];
  }

  const candidates: string[] = [];
  const proxyCandidate = toProxyPath(value, kind);
  if (proxyCandidate) {
    candidates.push(proxyCandidate);
  }

  if (isAbsoluteUrl(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/api/fastapi/")) {
        const directPath = parsed.pathname.replace("/api/fastapi", "");
        candidates.push(`${resolveFastApiOrigin()}${directPath}${parsed.search}`);
      }
    } catch {
      // Keep the absolute candidate only.
    }
  } else {
    const directPath = toDirectPath(value, kind);
    candidates.push(`${resolveFastApiOrigin()}${directPath}`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

export function normalizeInterviewAudioUrl(
  rawValue: string | null | undefined,
  kind: InterviewAudioKind,
): string {
  const candidates = buildInterviewAudioCandidates(rawValue, kind);
  return candidates[0] || "";
}
