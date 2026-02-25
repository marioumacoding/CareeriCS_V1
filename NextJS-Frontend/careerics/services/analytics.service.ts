/**
 * Example domain service: Analytics (backed by FastAPI).
 *
 * Demonstrates how a different backend is accessed through the same
 * service-layer contract.
 */

import { fastapiApi, fastapiGraphql } from "@/lib/api";
import { publicConfig } from "@/config";
import type { ApiResponse } from "@/types";

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  avgSessionMinutes: number;
}

// GraphQL query — used when NEXT_PUBLIC_ENABLE_GRAPHQL=true
const ANALYTICS_SUMMARY_QUERY = `
  query AnalyticsSummary($range: String!) {
    analyticsSummary(range: $range) {
      totalUsers
      activeUsers
      avgSessionMinutes
    }
  }
`;

export const analyticsService = {
  async getSummary(range: string): Promise<ApiResponse<AnalyticsSummary>> {
    if (publicConfig.enableGraphql) {
      const result = await fastapiGraphql.query<{ analyticsSummary: AnalyticsSummary }>({
        query: ANALYTICS_SUMMARY_QUERY,
        variables: { range },
      });

      return {
        ...result,
        data: result.data?.analyticsSummary ?? (null as unknown as AnalyticsSummary),
      };
    }

    return fastapiApi.get<AnalyticsSummary>("/analytics/summary", {
      params: { range },
    });
  },
} as const;
