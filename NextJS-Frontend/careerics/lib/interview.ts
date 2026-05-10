const BEHAVIORAL_INTERVIEW_TYPE = "HR";

export function isBehavioralInterviewType(value: string | null | undefined): boolean {
  return (value || "").trim().toLowerCase() === "hr";
}

export function normalizeInterviewType(value: string | null | undefined): string {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return BEHAVIORAL_INTERVIEW_TYPE;
  }

  if (isBehavioralInterviewType(trimmed)) {
    return BEHAVIORAL_INTERVIEW_TYPE;
  }

  return trimmed;
}

export function getTechnicalInterviewTypes(types: string[]): string[] {
  return types.filter((type) => !isBehavioralInterviewType(type));
}

export function buildInterviewRecordingRoute(interviewType: string, sessionId: string | null): string {
  const params = new URLSearchParams({
    type: normalizeInterviewType(interviewType),
    q: "1",
  });

  if (sessionId) {
    params.set("sessionId", sessionId);
  }

  return `/interview-feature/recording?${params.toString()}`;
}

export function buildInterviewSessionName(interviewType: string): string {
  const normalizedType = normalizeInterviewType(interviewType);
  if (isBehavioralInterviewType(normalizedType)) {
    return "Behavioral Mock Interview";
  }

  return `${normalizedType} Technical Mock Interview`;
}

export function formatInterviewArchiveDate(value?: string | null): string {
  const parsed = new Date(value || "");
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString();
}
