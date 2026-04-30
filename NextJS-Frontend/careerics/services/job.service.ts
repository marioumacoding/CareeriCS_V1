import { fastapiApi } from "@/lib/api";
import type {
  APIJobApplication,
  APIJobInteraction,
  APIJobListResponse,
  APIJobPost,
  ApiResponse,
  JobApplicationStatus,
} from "@/types";

const JOB_PAGE_SIZE = 100;
const jobListCache = new Map<string, APIJobPost[]>();
const jobListPromiseCache = new Map<string, Promise<ApiResponse<APIJobPost[]>>>();

function getJobCacheKey(userId?: string | null): string {
  return userId ?? "guest";
}

function listJobsPage(
  skip: number,
  limit: number,
  userId?: string | null,
): Promise<ApiResponse<APIJobListResponse>> {
  return fastapiApi.get<APIJobListResponse>("/jobs/", {
    params: {
      skip,
      limit,
      user_id: userId ?? undefined,
    },
  });
}

function listSavedJobsPage(
  userId: string,
  skip: number,
  limit: number,
): Promise<ApiResponse<APIJobListResponse>> {
  return fastapiApi.get<APIJobListResponse>(`/jobs/user/${userId}/saved`, {
    params: {
      skip,
      limit,
    },
  });
}

function listUserApplicationsPage(
  userId: string,
  skip: number,
  limit: number,
): Promise<ApiResponse<APIJobListResponse>> {
  return fastapiApi.get<APIJobListResponse>(`/jobs/user/${userId}/applications`, {
    params: {
      skip,
      limit,
    },
  });
}

async function collectAllJobs(
  loader: (skip: number, limit: number) => Promise<ApiResponse<APIJobListResponse>>,
): Promise<ApiResponse<APIJobPost[]>> {
  let skip = 0;
  const jobsById = new Map<string, APIJobPost>();
  let total = 0;

  while (true) {
    const response = await loader(skip, JOB_PAGE_SIZE);
    if (!response.success || !response.data) {
      return {
        data: [],
        success: false,
        message: response.message ?? "Failed to load jobs",
        errors: response.errors,
      };
    }

    const page = response.data;
    for (const job of page.jobs) {
      if (!jobsById.has(job.id)) {
        jobsById.set(job.id, job);
      }
    }
    total = page.total;
    skip += page.limit;

    if (jobsById.size >= total || page.jobs.length === 0) {
      break;
    }
  }

  return {
    data: Array.from(jobsById.values()),
    success: true,
  };
}

export const jobService = {
  listJobs(params: {
    skip?: number;
    limit?: number;
    userId?: string | null;
  } = {}): Promise<ApiResponse<APIJobListResponse>> {
    const { skip = 0, limit = JOB_PAGE_SIZE, userId } = params;
    return listJobsPage(skip, limit, userId);
  },

  searchJobs(params: {
    query: string;
    skip?: number;
    limit?: number;
    userId?: string | null;
  }): Promise<ApiResponse<APIJobListResponse>> {
    const { query, skip = 0, limit = JOB_PAGE_SIZE, userId } = params;
    return fastapiApi.get<APIJobListResponse>("/jobs/search/query", {
      params: {
        query,
        skip,
        limit,
        user_id: userId ?? undefined,
      },
    });
  },

  getAllJobs(userId?: string | null, forceRefresh = false): Promise<ApiResponse<APIJobPost[]>> {
    const cacheKey = getJobCacheKey(userId);
    if (!forceRefresh && jobListCache.has(cacheKey)) {
      return Promise.resolve({
        data: jobListCache.get(cacheKey) ?? [],
        success: true,
      });
    }

    if (!forceRefresh && jobListPromiseCache.has(cacheKey)) {
      return jobListPromiseCache.get(cacheKey)!;
    }

    const pendingRequest = collectAllJobs((skip, limit) => listJobsPage(skip, limit, userId)).then((response) => {
      if (response.success) {
        jobListCache.set(cacheKey, response.data);
      }
      return response;
    }).finally(() => {
      jobListPromiseCache.delete(cacheKey);
    });

    jobListPromiseCache.set(cacheKey, pendingRequest);
    return pendingRequest;
  },

  getJobDetails(jobId: string, userId?: string | null): Promise<ApiResponse<APIJobPost>> {
    return fastapiApi.get<APIJobPost>(`/jobs/${jobId}`, {
      params: {
        user_id: userId ?? undefined,
      },
    });
  },

  markJobViewed(jobId: string, userId: string): Promise<ApiResponse<APIJobInteraction>> {
    return fastapiApi.post<APIJobInteraction>(`/jobs/${jobId}/view`, undefined, {
      params: {
        user_id: userId,
      },
    });
  },

  saveJob(jobId: string, userId: string): Promise<ApiResponse<APIJobInteraction>> {
    return fastapiApi.post<APIJobInteraction>(`/jobs/${jobId}/save`, undefined, {
      params: {
        user_id: userId,
      },
    });
  },

  unsaveJob(jobId: string, userId: string): Promise<ApiResponse<APIJobInteraction>> {
    return fastapiApi.delete<APIJobInteraction>(`/jobs/${jobId}/save`, {
      params: {
        user_id: userId,
      },
    });
  },

  applyToJob(
    jobId: string,
    userId: string,
    status: JobApplicationStatus = "applied",
  ): Promise<ApiResponse<APIJobApplication>> {
    return fastapiApi.post<APIJobApplication>(`/jobs/${jobId}/apply`, { status }, {
      params: {
        user_id: userId,
      },
    });
  },

  getSavedJobs(
    userId: string,
    params: {
      skip?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<APIJobListResponse>> {
    const { skip = 0, limit = JOB_PAGE_SIZE } = params;
    return listSavedJobsPage(userId, skip, limit);
  },

  getAllSavedJobs(userId: string): Promise<ApiResponse<APIJobPost[]>> {
    return collectAllJobs((skip, limit) => listSavedJobsPage(userId, skip, limit));
  },

  getRecentlyViewedJobs(
    userId: string,
    params: {
      skip?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<APIJobListResponse>> {
    const { skip = 0, limit = JOB_PAGE_SIZE } = params;
    return fastapiApi.get<APIJobListResponse>(`/jobs/user/${userId}/recently-viewed`, {
      params: {
        skip,
        limit,
      },
    });
  },

  getUserApplications(
    userId: string,
    params: {
      skip?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<APIJobListResponse>> {
    const { skip = 0, limit = JOB_PAGE_SIZE } = params;
    return listUserApplicationsPage(userId, skip, limit);
  },

  getAllUserApplications(userId: string): Promise<ApiResponse<APIJobPost[]>> {
    return collectAllJobs((skip, limit) => listUserApplicationsPage(userId, skip, limit));
  },

  invalidateJobList(userId?: string | null): void {
    const cacheKey = getJobCacheKey(userId);
    jobListCache.delete(cacheKey);
    jobListPromiseCache.delete(cacheKey);
  },
} as const;
