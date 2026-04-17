import { fastapiApi } from "@/lib/api";
import type { ApiResponse, APISkill } from "@/types";

export const skillsService = {
  listSkills(): Promise<ApiResponse<APISkill[]>> {
    return fastapiApi.get<APISkill[]>("/skills/");
  },
} as const;
