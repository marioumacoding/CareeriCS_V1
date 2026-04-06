import type {
  RoadmapCompletionStatus,
  RoadmapSectionRead,
  RoadmapStepRead,
} from "@/types";

import { statusChipClass } from "../utils";

interface StepResourcePanelProps {
  section: RoadmapSectionRead | null;
  step: RoadmapStepRead | null;
  status: RoadmapCompletionStatus;
}

function getResourceDisplay(
  resource: RoadmapStepRead["resources"][number],
): { title: string; url: string | null; type: string } {
  const title = typeof resource.title === "string" && resource.title.trim().length
    ? resource.title
    : "Resource";

  const url = typeof resource.url === "string" && resource.url.trim().length
    ? resource.url
    : null;

  const type = typeof resource.resourceType === "string" && resource.resourceType.trim().length
    ? resource.resourceType
    : "resource";

  return { title, url, type };
}

export default function StepResourcePanel({ section, step, status }: StepResourcePanelProps) {
  if (!step) {
    return (
      <section className="rounded-2xl border border-white/15 bg-[#0f1f4d]/60 p-4 text-[#dbe5ff]">
        <h3 className="m-0 text-[1rem]">Step details</h3>
        <p className="m-0 mt-2 text-[0.88rem] text-white/80">
          Select a step node to see its resources and description.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-[#0f1f4d]/60 p-4 text-[#eef4ff]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-[1.06rem]">{step.title}</h3>
        <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.07em] ${statusChipClass(status)}`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <p className="m-0 mt-1.5 text-[0.78rem] uppercase tracking-[0.07em] text-white/70">
        {section?.title ?? "Section"}
      </p>

      <p className="m-0 mt-3 text-[0.9rem] text-white/90">
        {step.description?.trim() || "No step description is available yet."}
      </p>

      <div className="mt-4 space-y-2">
        <p className="m-0 text-[0.8rem] uppercase tracking-[0.07em] text-white/70">Resources</p>

        {step.resources.length ? (
          <ul className="m-0 space-y-2 p-0">
            {step.resources.map((resource, index) => {
              const display = getResourceDisplay(resource);

              return (
                <li
                  key={`${display.title}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.86rem]"
                >
                  <p className="m-0 text-[0.72rem] uppercase tracking-[0.06em] text-white/70">
                    {display.type}
                  </p>

                  {display.url ? (
                    <a
                      href={display.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-[#b8ef46] underline decoration-transparent transition hover:decoration-current"
                    >
                      {display.title}
                    </a>
                  ) : (
                    <p className="m-0 mt-1 text-white/95">{display.title}</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="m-0 rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-[0.88rem] text-white/80">
            No resources attached to this step.
          </p>
        )}
      </div>
    </section>
  );
}
