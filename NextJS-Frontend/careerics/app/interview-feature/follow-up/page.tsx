"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LegacyFollowUpRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const suffix = query ? `?${query}` : "";
    router.replace(`/interview-feature/analyzing${suffix}`);
  }, [router, searchParams]);

  return null;
}
