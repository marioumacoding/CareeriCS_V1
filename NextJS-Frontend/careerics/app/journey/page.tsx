"use client";

import JourneyTree from "@/components/ui/journey-tree";

export default function JourneyPage() {
  return (
    <JourneyTree
      current={3}
      maxReached={5}
      renderContent={() => (
        <div>
          {/* your page content */}
        </div>
      )}
    />
  );
}