"use client";

import { useMemo, useState } from "react";
import CustomDropdown from "@/components/ui/dropdown-menu";
import { StepFlow } from "@/components/ui/roadmap-flow";

export default function RoadmapPage() {
  const DEFAULT_PATH_OPTION = "__default_path__";
  const MAX_BOOKMARKS = 3;

  const options = useMemo(() => {
    return [
      { id: DEFAULT_PATH_OPTION, title: "Find a new path" },
      { id: "frontend", title: "Frontend Developer" },
      { id: "backend", title: "Backend Developer" },
      { id: "ai", title: "AI Engineer" },
      { id: "mobile", title: "Mobile Developer" },
    ];
  }, []);

  const [selectedRoadmapId, setSelectedRoadmapId] =
    useState<string>(DEFAULT_PATH_OPTION);

  const [bookmarkedRoadmaps, setBookmarkedRoadmaps] =
    useState<{ id: string; title: string }[]>([]);

  const onRoadmapChange = (roadmapId: string) => {
    setSelectedRoadmapId(roadmapId);
  };

  const selectedRoadmap = useMemo(() => {
    return options.find(
      (o) => o.id === selectedRoadmapId
    );
  }, [selectedRoadmapId, options]);

  const handleBookmark = () => {
    if (
      !selectedRoadmap ||
      selectedRoadmap.id === DEFAULT_PATH_OPTION
    ) {
      return;
    }

    const exists = bookmarkedRoadmaps.some(
      (b) => b.id === selectedRoadmap.id
    );

    if (exists) {
      setBookmarkedRoadmaps((prev) =>
        prev.filter((b) => b.id !== selectedRoadmap.id)
      );
      return;
    }

    if (bookmarkedRoadmaps.length >= MAX_BOOKMARKS) {
      console.warn("Max 3 bookmarks allowed");
      return;
    }

    setBookmarkedRoadmaps((prev) => [
      ...prev,
      selectedRoadmap,
    ]);
  };

  const nodes = [
    "Step 1", "Step 2", "Step 3", "Step 4",
    "Step 5", "Step 6", "Step 7", "Step 8",
    "Step 9", "Step 10", "Step 11", "Step 12", "jj"
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Row */}
      <div
        style={{
          height: "fit-content",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          marginRight: "auto",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <CustomDropdown
          value={selectedRoadmapId}
          options={options}
          placeholder="Find a new path"
          onChange={onRoadmapChange}
        />

        {/* Bookmarked Display */}
        {bookmarkedRoadmaps.length > 0 ? (
          bookmarkedRoadmaps.map((b) => (
            <div
              key={b.id}
              style={{
                fontFamily: "var(--font-nova-square)",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor:
                  selectedRoadmapId === b.id
                    ? "var(--hover-green)"
                    : "var(--medium-blue)",
                color:
                  selectedRoadmapId === b.id
                    ? "black"
                    : "white",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
              onClick={() => setSelectedRoadmapId(b.id)}
            >
              {b.title}
            </div>
          ))
        ) : (
          <span
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            No bookmarks
          </span>
        )}
      </div>

      {/* Roadmap Panel */}
      <div
  style={{
    width: "100%",
    flex: 1,              
    minHeight: 0,        
    borderRadius: "4vh",
    backgroundColor: "var(--dark-blue)",
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    overflow: "hidden",  // locks panel boundary
  }}
>
        {/* Header */}
        <div
          style={{
            display: "flex",
            height: "fit-content",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom:"1rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.2rem",
              color: "white",
            }}
          >
            {selectedRoadmap?.title} Roadmap
          </h1>

          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <img
              src={"/roadmap/fullscreen.svg"}
              style={{
                height: "1.5rem",
                cursor: "pointer",
              }}
            />

            <img
              src={"/roadmap/bookmark.svg"}
              style={{
                height: "1.5rem",
                cursor: "pointer",
              }}
              onClick={handleBookmark}
            />
          </div>
        </div>

        {/*Roadmap*/}
        <div
          style={{
            width: "100%",
            height: "100%",
            paddingInline: "2rem",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
            <div>
              <StepFlow steps={nodes} />
            </div>
        </div>
      </div>
    </div>
  );
}