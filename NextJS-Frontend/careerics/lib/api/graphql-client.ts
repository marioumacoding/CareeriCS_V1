/**
 * GraphQL client — thin wrapper around HttpClient for query / mutation calls.
 * Supports both .NET (Hot Chocolate / GraphQL.NET) and FastAPI (Strawberry / Ariadne).
 */

import type { ApiResponse } from "@/types";
import { HttpClient, type HttpClientConfig } from "./http-client";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface GraphQLResponse<T = unknown> {
  data: T | null;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Client
// ──────────────────────────────────────────────
export class GraphQLClient {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  async query<T = unknown>(request: GraphQLRequest): Promise<ApiResponse<T>> {
    return this.execute<T>(request);
  }

  async mutate<T = unknown>(request: GraphQLRequest): Promise<ApiResponse<T>> {
    return this.execute<T>(request);
  }

  private async execute<T>(request: GraphQLRequest): Promise<ApiResponse<T>> {
    const raw = await this.http.post<GraphQLResponse<T>>("", request, {
      noRetry: true, // GraphQL mutations should not be retried
    });

    if (!raw.success) return raw as unknown as ApiResponse<T>;

    const gql = raw.data;

    if (gql.errors?.length) {
      return {
        data: gql.data as T,
        success: false,
        message: gql.errors[0].message,
        errors: gql.errors.map((e) => ({
          code: (e.extensions?.code as string) ?? "GRAPHQL_ERROR",
          message: e.message,
        })),
      };
    }

    return {
      data: gql.data as T,
      success: true,
    };
  }
}
