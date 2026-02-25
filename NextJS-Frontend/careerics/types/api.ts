/**
 * Shared API response envelope.
 * Both .NET and FastAPI should return responses wrapped in this shape
 * (or the adapter layer normalises them).
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
