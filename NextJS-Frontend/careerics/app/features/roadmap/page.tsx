"use client";

import RootLayout from "@/app/features/layout";
import { Bookmark, ChevronRight, Expand } from "lucide-react";
import { useMemo, useState } from "react";

interface RoadmapPath {
  title: string;
  category: "UI/UX" | "Frontend" | "Backend";
  skills: string[];
}

const roadmapPaths: RoadmapPath[] = [
  {
    title: "Find a new path",
    category: "UI/UX",
    skills: ["Design Fundamentals", "Figma", "User Research", "Prototyping"],
  },
  {
    title: "Become a Frontend Developer",
    category: "Frontend",
    skills: ["HTML/CSS", "JavaScript", "React", "Next.js", "TypeScript"],
  },
  {
    title: "Master Backend Development",
    category: "Backend",
    skills: ["Node.js", "Databases", "APIs", "System Design", "DevOps"],
  },
];

const DEFAULT_PATH_OPTION = "__default_path__";

export default function RoadmapPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "UI/UX" | "Frontend" | "Backend"
  >("UI/UX");
  const [selectedPathTitle, setSelectedPathTitle] = useState<string>(DEFAULT_PATH_OPTION);

  const categories: ("UI/UX" | "Frontend" | "Backend")[] = [
    "UI/UX",
    "Frontend",
    "Backend",
  ];

  const filteredPaths = useMemo(
    () => roadmapPaths.filter((path) => path.category === selectedCategory),
    [selectedCategory],
  );

  const selectedPath = useMemo(() => {
    if (selectedPathTitle === DEFAULT_PATH_OPTION) {
      return filteredPaths[0] ?? roadmapPaths[0];
    }

    const pathInCategory = filteredPaths.find((path) => path.title === selectedPathTitle);

    return pathInCategory ?? filteredPaths[0] ?? roadmapPaths[0];
  }, [filteredPaths, selectedPathTitle]);

  const showPreviewDetails = selectedPathTitle !== DEFAULT_PATH_OPTION;

  return (
    <RootLayout
      style={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        alignItems: "stretch",
        width: "100%",
        height: "100%",
      }}
    >
      <section className="flex h-full w-full flex-col gap-1.5">
        <div className="flex w-full flex-col items-start gap-2.5 px-6 pb-2 pt-6 sm:px-7 sm:pb-2 sm:pt-7 md:flex-row md:items-center md:gap-2.5">
          <label className="block w-full md:w-[14rem]" htmlFor="path-select">
            <span className="sr-only">Select roadmap path</span>
            <select
              id="path-select"
              value={selectedPathTitle}
              onChange={(event) => setSelectedPathTitle(event.target.value)}
              className="h-11 w-full rounded-full border border-[#2b5da4] bg-transparent px-5 text-[0.95rem] text-[#323232] outline-none transition-colors focus:border-[#1f467f]"
            >
              <option value={DEFAULT_PATH_OPTION}>Find a new path</option>
              {filteredPaths.map((path) => (
                <option key={path.title} value={path.title}>
                  {path.title}
                </option>
              ))}
            </select>
          </label>

          <div
            className="inline-flex flex-wrap gap-2.5"
            role="tablist"
            aria-label="Roadmap categories"
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className={`h-11 min-w-[5.8rem] rounded-[0.52rem] px-5 text-[0.95rem] font-semibold transition-all ${
                    isActive
                      ? "bg-[#d4ef9f] text-[#1f2f22]"
                      : "bg-[#214c90] text-[#eef4ff] hover:-translate-y-[1px]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="hidden h-11 w-10 items-center justify-center rounded-md text-[#214c90] md:inline-flex"
            aria-label="Next roadmap"
          >
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </div>

        <section
          className="flex-1 rounded-[0.68rem] border border-white/10 bg-[#17295c] p-6 sm:p-7"
          aria-label="Roadmap preview"
        >
          <div className="relative flex min-h-9 items-center justify-center">
            <h2 className="m-0 text-center text-[clamp(1.9rem,3.65vw,3rem)] leading-none text-[#eef4ff]">
              Roadmap Preview
            </h2>

            <div className="absolute right-0 top-0 inline-flex gap-1.5">
              <button
                type="button"
                aria-label="Expand roadmap"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#eef4ff]"
              >
                <Expand size={18} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                aria-label="Bookmark roadmap"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#eef4ff]"
              >
                <Bookmark size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {showPreviewDetails ? (
            <div className="mt-6 flex flex-col gap-4 text-[#eef4ff]">
              <span className="inline-flex w-fit rounded-full border border-white/30 px-3 py-1 text-[0.78rem] uppercase tracking-[0.08em] text-white/75">
                {selectedPath.category} path
              </span>

              <h3 className="m-0 text-[clamp(2rem,3.4vw,3rem)] leading-none text-white">
                {selectedPath.title}
              </h3>

              <div className="mt-1 flex flex-wrap gap-2.5">
                {selectedPath.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-[0.95rem] text-[#f2f6ff]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </RootLayout>
  );
}