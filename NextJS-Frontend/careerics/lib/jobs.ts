import type {
  APIJobPost,
  JobFilterOption,
  JobUiModel,
} from "@/types";

const SELECTED_JOB_STORAGE_KEY = "careerics:selected-job-id";

function getPrimaryLocation(location: string | null | undefined): string {
  if (!location) {
    return "Unknown";
  }

  const [primarySegment] = location.split(",");
  return primarySegment.trim() || location.trim();
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export function buildJobDetailsHref(jobId: string): string {
  return `/job-features/details?jobId=${encodeURIComponent(jobId)}`;
}

export function readSelectedJobIdFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("jobId");
}

export function replaceSelectedJobIdInUrl(jobId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const currentJobId = url.searchParams.get("jobId");

  if ((jobId && currentJobId === jobId) || (!jobId && !currentJobId)) {
    return;
  }

  if (jobId) {
    url.searchParams.set("jobId", jobId);
  } else {
    url.searchParams.delete("jobId");
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

export function persistSelectedJobId(jobId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELECTED_JOB_STORAGE_KEY, jobId);
}

export function clearPersistedSelectedJobId(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SELECTED_JOB_STORAGE_KEY);
}

export function readPersistedSelectedJobId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SELECTED_JOB_STORAGE_KEY);
}

export function mapApiJobToUiModel(job: APIJobPost): JobUiModel {
  const tags = [
    job.employment_type,
    job.work_type,
    job.career_level,
  ].filter((value): value is string => Boolean(value && value.trim()));

  if (job.match_percentage !== null && job.match_percentage !== undefined && tags.length < 4) {
    tags.push(`${Math.round(job.match_percentage)}% Match`);
  }

  return {
    id: job.id,
    title: job.job_title,
    company: job.company_name?.trim() || "Company not specified",
    location: job.location?.trim() || "Location not specified",
    country: job.location_country?.trim() || null,
    city: job.location_city?.trim() || null,
    locationFilterValue: job.location_city?.trim() || job.location_country?.trim() || getPrimaryLocation(job.location),
    salary: normalizeOptionalText(job.salary),
    tags,
    description: job.description_about_role?.trim() || "No role description provided yet.",
    responsibilities: job.description_key_responsibilities?.trim() || undefined,
    requirements: job.description_requirements?.trim() || undefined,
    niceToHave: job.description_nice_to_have?.trim() || undefined,
    skills: job.skills.length ? job.skills.join(", ") : undefined,
    skillList: job.skills,
    jobUrl: job.job_url,
    source: job.source,
    postedDate: job.posted_date,
    employmentType: job.employment_type,
    workType: job.work_type,
    careerLevel: job.career_level,
    matchPercentage: job.match_percentage,
    isSaved: job.is_saved,
    // Do not treat a "saved" application_status as a blocked application state
    // so bookmarking does not prevent the user from applying. Map "saved" to null.
    applicationStatus: job.application_status === "saved" ? null : job.application_status,
    savedAt: job.saved_at,
    viewedAt: job.viewed_at,
    appliedAt: job.applied_at,
  };
}

export function mergeSelectedFilterOptions(
  options: JobFilterOption[],
  selectedValues: string[],
): JobFilterOption[] {
  const mergedOptions = new Map(options.map((option) => [option.id, option]));

  for (const selectedValue of selectedValues) {
    if (!mergedOptions.has(selectedValue)) {
      mergedOptions.set(selectedValue, {
        id: selectedValue,
        title: selectedValue,
        count: 0,
      });
    }
  }

  return Array.from(mergedOptions.values()).sort((left, right) => {
    const leftCount = left.count ?? 0;
    const rightCount = right.count ?? 0;
    if (rightCount !== leftCount) {
      return rightCount - leftCount;
    }

    return left.title.localeCompare(right.title);
  });
}

export function formatFilterTriggerLabel(
  placeholder: string,
  selectedValues: string[],
  options: JobFilterOption[],
): string {
  if (!selectedValues.length) {
    return placeholder;
  }

  if (selectedValues.length === 1) {
    const selectedValue = selectedValues[0];
    return options.find((option) => option.id === selectedValue)?.title ?? selectedValue;
  }

  return `${placeholder} (${selectedValues.length})`;
}
