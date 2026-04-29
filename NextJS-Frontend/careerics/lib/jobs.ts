import type {
  APIJobPost,
  JobFilterOption,
  JobFilters,
  JobSortOption,
  JobUiModel,
} from "@/types";

const SELECTED_JOB_STORAGE_KEY = "careerics:selected-job-id";
const DEFAULT_SALARY_LABEL = "Not specified";

function getPrimaryLocation(location: string | null | undefined): string {
  if (!location) {
    return "Unknown";
  }

  const [primarySegment] = location.split(",");
  return primarySegment.trim() || location.trim();
}

function parseSortableDate(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildJobDetailsHref(jobId: string): string {
  return `/job-features/details?jobId=${encodeURIComponent(jobId)}`;
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
    locationFilterValue: getPrimaryLocation(job.location),
    salary: DEFAULT_SALARY_LABEL,
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

export function buildFilterOptions(
  values: Array<string | null | undefined>,
  title: string,
): JobFilterOption[] {
  const uniqueValues = Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  return [
    { id: "all", title },
    ...uniqueValues.map((value) => ({ id: value, title: value })),
  ];
}

export function filterJobs(jobs: JobUiModel[], filters: JobFilters): JobUiModel[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesSearch = !normalizedQuery
      || job.title.toLowerCase().includes(normalizedQuery)
      || job.company.toLowerCase().includes(normalizedQuery)
      || job.location.toLowerCase().includes(normalizedQuery)
      || job.skillList.some((skill) => skill.toLowerCase().includes(normalizedQuery));

    const matchesLocation = filters.location === "all"
      || job.locationFilterValue === filters.location;

    const matchesType = filters.jobType === "all"
      || job.employmentType === filters.jobType;

    const matchesLevel = filters.level === "all"
      || job.careerLevel === filters.level;

    return matchesSearch && matchesLocation && matchesType && matchesLevel;
  });
}

export function sortJobs(jobs: JobUiModel[], sortOption: JobSortOption): JobUiModel[] {
  const nextJobs = [...jobs];

  if (sortOption === "date") {
    return nextJobs.sort((left, right) => {
      const rightDate = parseSortableDate(right.postedDate) || parseSortableDate(right.appliedAt);
      const leftDate = parseSortableDate(left.postedDate) || parseSortableDate(left.appliedAt);
      return rightDate - leftDate;
    });
  }

  if (sortOption === "match") {
    return nextJobs.sort((left, right) => {
      const rightMatch = right.matchPercentage ?? -1;
      const leftMatch = left.matchPercentage ?? -1;
      if (rightMatch !== leftMatch) {
        return rightMatch - leftMatch;
      }

      const rightDate = parseSortableDate(right.postedDate);
      const leftDate = parseSortableDate(left.postedDate);
      return rightDate - leftDate;
    });
  }

  return nextJobs;
}

export function getApplicationButtonLabel(job: JobUiModel): string {
  switch (job.applicationStatus) {
    case "applied":
      return "Applied";
    case "interview":
      return "Interview Stage";
    case "offer":
      return "Offer Received";
    case "rejected":
      return "Rejected";
    default:
      return "Apply";
  }
}
