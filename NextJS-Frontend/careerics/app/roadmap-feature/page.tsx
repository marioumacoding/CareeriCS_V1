"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoadmapProgress from "@/components/ui/roadmapProgress";
import { StepFlow } from "@/components/ui/roadmap-flow";
import StepCheckbox from "@/components/ui/roadmapStepCheckbox";

type Skill = {
  text: string;
  checked: boolean;
};

type Section = {
  id: string;
  title: string;
  href: string;
  skills: Skill[];
};

export default function RoadmapFeaturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoadmap = searchParams.get("roadmap") || "frontend";
  const initialStep = searchParams.get("step");

  const roadmapMap: Record<string, Section[]> = {
    frontend: [
      {
        id: "html",
        title: "HTML",
        href: "/roadmap-feature/html",
        skills: [
          { text: "Learn tags", checked: true },
          { text: "Semantic HTML", checked: false },
          { text: "Forms", checked: false },
        ],
      },
      {
        id: "css",
        title: "CSS",
        href: "/roadmap-feature/css",
        skills: [
          { text: "Selectors", checked: true },
          { text: "Flexbox", checked: false },
          { text: "Grid", checked: false },
        ],
      },
      {
        id: "js",
        title: "JavaScript",
        href: "/roadmap-feature/js",
        skills: [
          { text: "Variables", checked: true },
          { text: "Functions", checked: false },
          { text: "Async/Await", checked: false },
        ],
      },
      {
        id: "react",
        title: "React",
        href: "/roadmap-feature/react",
        skills: [
          { text: "Components", checked: false },
          { text: "Hooks", checked: false },
          { text: "State", checked: false },
        ],
      },
      {
        id: "next",
        title: "Next.js",
        href: "/roadmap-feature/next",
        skills: [
          { text: "Routing", checked: false },
          { text: "SSR", checked: false },
          { text: "API Routes", checked: false },
        ],
      },
    ],

    backend: [
      {
        id: "internet",
        title: "Internet Basics",
        href: "/roadmap-feature/internet",
        skills: [
          { text: "HTTP", checked: false },
          { text: "DNS", checked: false },
          { text: "Hosting", checked: false },
        ],
      },
      {
        id: "node",
        title: "Node.js",
        href: "/roadmap-feature/node",
        skills: [
          { text: "Runtime", checked: false },
          { text: "Modules", checked: false },
          { text: "FS API", checked: false },
        ],
      },
      {
        id: "apis",
        title: "APIs",
        href: "/roadmap-feature/apis",
        skills: [
          { text: "REST", checked: false },
          { text: "Auth", checked: false },
          { text: "CRUD", checked: false },
        ],
      },
    ],
  };

  const roadmap = useMemo(() => {
    return roadmapMap[initialRoadmap] || roadmapMap.frontend;
  }, [initialRoadmap]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [data, setData] = useState<Section[]>(roadmap);

  const selectedSection = data[selectedIndex];

  // reset when roadmap changes
  useEffect(() => {
    setData(roadmap);
    setSelectedIndex(0);
  }, [roadmap]);

  // STEP 1: URL → STATE sync
  useEffect(() => {
    if (!initialStep) return;

    const index = data.findIndex((s) => s.id === initialStep);

    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [initialStep, data]);

  // STEP 2: STATE → URL sync
  useEffect(() => {
    const section = data[selectedIndex];
    if (!section) return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("roadmap", initialRoadmap);
    params.set("step", section.id);

    router.replace(`?${params.toString()}`);
  }, [selectedIndex, data, initialRoadmap]);

  const toggleSkill = (skillIndex: number) => {
    setData((prev) =>
      prev.map((section, sIndex) => {
        if (sIndex !== selectedIndex) return section;

        return {
          ...section,
          skills: section.skills.map((skill, i) =>
            i === skillIndex
              ? { ...skill, checked: !skill.checked }
              : skill
          ),
        };
      })
    );
  };

  const steps = data.map((s) => ({
    label: s.title,
    href: s.href,
  }));

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "1rem",
        flexDirection: "column",
        overflow: "clip",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "2rem",
          color: "white",
          marginBottom: "1rem",
        }}
      >
        {initialRoadmap} Roadmap
      </h1>

      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          flex: 1,
        }}
      >
        {/* Left Panel */}
        <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <RoadmapProgress text="Sections Completed" done="3" total="10" />
            <RoadmapProgress text="Total Steps Completed" done="3" total="10" />
            <RoadmapProgress text="Current Steps Completed" done="3" total="10" />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            <StepFlow
              steps={steps}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              isNavigatable={false}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem 2rem",
            backgroundColor: "#636771",
            borderRadius: "4vh",
            width: "30%",
            marginLeft: "2rem",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1rem" }}>
            {selectedSection.title}
          </h2>

          <div
            style={{
              height: "0.1rem",
              backgroundColor: "white",
              width: "100%",
              marginBottom: "1rem",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            {selectedSection.skills.map((skill, index) => (
              <StepCheckbox
                key={index}
                text={skill.text}
                isChecked={skill.checked}
                onToggle={() => toggleSkill(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}