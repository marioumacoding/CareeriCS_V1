import { fastapiApi } from "@/lib/api";
import type { ApiResponse, APIReport, APIReportType } from "@/types";

export const reportsService = {
  listUserReports(
    userId: string,
    reportType: APIReportType,
  ): Promise<ApiResponse<APIReport[]>> {
    return fastapiApi.get<APIReport[]>(`/reports/user/${userId}`, {
      params: { report_type: reportType },
    });
  },

  getReportDownloadUrl(reportId: string): string {
    return `/api/fastapi/reports/${reportId}/download`;
  },
} as const;
