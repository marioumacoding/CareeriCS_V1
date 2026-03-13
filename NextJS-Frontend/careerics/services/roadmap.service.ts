import { dotnetApi } from "@/lib/api";
import type {
  ApiResponse,
  RoadmapCatalogItem,
  RoadmapCompletionResponse,
  RoadmapDocument,
  RoadmapNodeContent,
} from "@/types";

export const roadmapCatalog: RoadmapCatalogItem[] = [
  {
    slug: "data-analyst",
    title: "Data Analyst",
    description:
      "A guided path across data fundamentals, analytics workflows, SQL, dashboards, and decision-ready communication.",
    level: "Beginner to intermediate",
    estimatedDuration: "10 to 14 weeks",
    focusAreas: ["SQL", "Statistics", "Visualization", "Python", "Business storytelling"],
  },
];

export const roadmapService = {
  getCatalog(): RoadmapCatalogItem[] {
    return roadmapCatalog;
  },

  getRoadmap(
    roadmapSlug: string,
    userId?: string,
  ): Promise<ApiResponse<RoadmapDocument>> {
    return dotnetApi.get<RoadmapDocument>(`/roadmaps/${roadmapSlug}`, {
      params: { userId },
    });
  },

  getNodeContent(
    roadmapSlug: string,
    nodeSlug: string,
  ): Promise<ApiResponse<RoadmapNodeContent>> {
    return dotnetApi.get<RoadmapNodeContent>(`/roadmaps/${roadmapSlug}/node/${nodeSlug}`);
  },

  completeNode(
    roadmapSlug: string,
    nodeId: string,
    userId: string,
  ): Promise<ApiResponse<RoadmapCompletionResponse>> {
    return dotnetApi.post<RoadmapCompletionResponse>(
      `/roadmaps/${roadmapSlug}/node/${nodeId}/complete`,
      undefined,
      { params: { userId } },
    );
  },
} as const;