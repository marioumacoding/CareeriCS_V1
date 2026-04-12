"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LegacyFollowupQuestionRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());

    const followupText = next.get("followupText");
    if (followupText && !next.get("followup")) {
      next.set("followup", followupText);
    }

    if (!next.get("followupMode")) {
      next.set("followupMode", "1");
    }

    const query = next.toString();
    const suffix = query ? `?${query}` : "";
    router.replace(`/interview-feature/recording${suffix}`);
  }, [router, searchParams]);

  return null;
}
