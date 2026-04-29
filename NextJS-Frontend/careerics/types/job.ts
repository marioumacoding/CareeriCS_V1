import type { ApiResponse } from "./api";

export type JobApplicationStatus = "applied" | "interview" | "offer" | "rejected" | "saved";

export interface APIJobPost {
  id: string;
  job_title: string;
  company_name: string | null;
  job_url: string | null;
  source: string | null;
  location: string | null;
  posted_date: string | null;
  career_level: string | null;
  work_type: string | null;
  employment_type: string | null;
  description_about_role: string | null;
  description_key_responsibilities: string | null;
  description_requirements: string | null;
  description_nice_to_have: string | null;
  created_at: string | null;
  updated_at: string | null;
  skills: string[];
  match_percentage: number | null;
  is_saved: boolean;
  saved_at: string | null;
  viewed_at: string | null;
  view_count: number;
  last_interaction_at: string | null;
  application_status: JobApplicationStatus | null;
  applied_at: string | null;
}

export interface APIJobListResponse {
  query?: string | null;
  total: number;
  skip: number;
  limit: number;
  jobs: APIJobPost[];
}

export interface APIJobInteraction {
  id: string;
  job_post_id: string;
  user_id: string;
  viewed_at: string | null;
  is_saved: boolean;
  saved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface APIJobApplication {
  id: string;
  job_post_id: string;
  user_id: string;
  status: JobApplicationStatus;
  applied_at: string | null;
  updated_at: string;
}

export interface JobUiModel {
  id: string;
  title: string;
  company: string;
  location: string;
  locationFilterValue: string;
  salary: string;
  tags: string[];
  description: string;
  responsibilities?: string;
  requirements?: string;
  niceToHave?: string;
  skills?: string;
  skillList: string[];
  jobUrl?: string | null;
  source?: string | null;
  postedDate?: string | null;
  employmentType?: string | null;
  workType?: string | null;
  careerLevel?: string | null;
  matchPercentage?: number | null;
  isSaved: boolean;
  applicationStatus?: JobApplicationStatus | null;
  savedAt?: string | null;
  viewedAt?: string | null;
  appliedAt?: string | null;
}

export interface JobFilterOption {
  id: string;
  title: string;
}

export type JobSortOption = "relevance" | "date" | "match";

export interface JobFilters {
  searchQuery: string;
  location: string;
  jobType: string;
  level: string;
}

export type JobApiResponse<T> = Promise<ApiResponse<T>>;
