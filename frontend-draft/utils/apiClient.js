import axios from "axios";

export class ApiError extends Error {
  constructor(message, { code, status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === "object" && payload.success === true) {
      return payload.data;
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status;
    const payload = error?.response?.data;
    if (payload && typeof payload === "object" && payload.success === false) {
      const apiError = new ApiError(payload.error?.message || "API Error", {
        code: payload.error?.code,
        status,
        details: payload.error?.details,
      });
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  }
);

