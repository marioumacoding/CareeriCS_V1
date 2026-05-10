"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Country, State } from "country-state-city";
import ISO6391 from "iso-639-1";

import { useAuth } from "@/providers/auth-provider";
import { cvService } from "@/services";
import type { CVProfile } from "@/types";
import { Button } from "@/components/ui/button";
import DynamicCVForm from "@/components/ui/cv-form";
import Interview from "@/components/ui/interview";
import InterviewCard from "@/components/ui/interview-card";
import { PdfPreviewFrame } from "@/components/ui/pdf-preview-frame";

type MultiRow = { id: number };

type BuilderPrefillState = {
  formData: Record<string, string>;
  educationList: MultiRow[];
  langList: MultiRow[];
  skillList: MultiRow[];
  certList: MultiRow[];
  awardList: MultiRow[];
  experienceList: MultiRow[];
  projectList: MultiRow[];
  referenceList: MultiRow[];
};

let rowSequence = 0;

function createRowId(): number {
  rowSequence += 1;
  return Date.now() + rowSequence;
}

function createRow(): MultiRow {
  return { id: createRowId() };
}

function withFallbackRow(rows: MultiRow[]): MultiRow[] {
  return rows.length ? rows : [createRow()];
}

function splitTextLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinTextLines(values?: string[] | null): string {
  return (values ?? []).filter(Boolean).join("\n");
}

function getFormValue(formData: Record<string, string>, key: string): string {
  return formData[key]?.trim() ?? "";
}

function toSafePdfFileName(label: string, fallback: string): string {
  const normalized = label
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return `${normalized || fallback}.pdf`;
}

function buildPrefillState(profile: CVProfile): BuilderPrefillState {
  const formData: Record<string, string> = {
    name: profile.full_name ?? "",
    job: profile.professional_title ?? "",
    port: profile.portfolio ?? "",
    sum: profile.summary ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    link: profile.linkedin ?? "",
  };

  const educationList = withFallbackRow(
    profile.education.map((entry) => {
      const id = createRowId();
      formData[`inst-${id}`] = entry.institution ?? "";
      formData[`q-${id}`] = entry.qualification ?? "";
      formData[`t-${id}`] = entry.period ?? "";
      formData[`d-${id}`] = entry.details ?? "";
      return { id };
    }),
  );

  const langList = withFallbackRow(
    profile.languages.map((entry) => {
      const id = createRowId();
      formData[`ln-${id}`] = entry.language ?? "";
      formData[`lp-${id}`] = entry.proficiency ?? "";
      return { id };
    }),
  );

  const skillList = withFallbackRow(
    profile.skills
      .filter((entry) => entry.isCV && entry.skill?.skill_name)
      .map((entry) => {
        const id = createRowId();
        formData[`sn-${id}`] = entry.skill?.skill_name ?? "";
        formData[`sp-${id}`] = entry.proficiency ?? "";
        return { id };
      }),
  );

  const certList = withFallbackRow(
    profile.certifications.map((entry) => {
      const id = createRowId();
      formData[`cname-${id}`] = entry.title ?? "";
      formData[`corg-${id}`] = entry.organization ?? "";
      formData[`cdate-${id}`] = entry.period ?? "";
      return { id };
    }),
  );

  const awardList = withFallbackRow(
    profile.awards.map((entry) => {
      const id = createRowId();
      formData[`aname-${id}`] = entry.title ?? "";
      formData[`aorg-${id}`] = entry.organization ?? "";
      formData[`adate-${id}`] = entry.date ?? "";
      formData[`adesc-${id}`] = entry.description ?? "";
      return { id };
    }),
  );

  const experienceList = withFallbackRow(
    profile.experiences.map((entry) => {
      const id = createRowId();
      formData[`role-${id}`] = entry.role ?? "";
      formData[`org-${id}`] = entry.organization ?? "";
      formData[`tp-${id}`] = entry.period ?? "";
      formData[`resp-${id}`] = joinTextLines(entry.responsibilities);
      formData[`ach-${id}`] = entry.achievements ?? "";
      return { id };
    }),
  );

  const projectList = withFallbackRow(
    profile.projects.map((entry) => {
      const id = createRowId();
      formData[`pname-${id}`] = entry.title ?? "";
      formData[`prole-${id}`] = entry.role ?? "";
      formData[`ptech-${id}`] = joinTextLines(entry.technologies);
      formData[`pdesc-${id}`] = entry.description ?? "";
      formData[`pach-${id}`] = entry.achievements ?? "";
      return { id };
    }),
  );

  const referenceList = withFallbackRow(
    profile.references.map((entry) => {
      const id = createRowId();
      formData[`rn-${id}`] = entry.name ?? "";
      formData[`rr-${id}`] = entry.role ?? "";
      formData[`ro-${id}`] = entry.organization ?? "";
      formData[`rc-${id}`] = entry.contact_info ?? "";
      return { id };
    }),
  );

  return {
    formData,
    educationList,
    langList,
    skillList,
    certList,
    awardList,
    experienceList,
    projectList,
    referenceList,
  };
}

function profileHasStoredCvData(profile: CVProfile): boolean {
  return Boolean(
    profile.full_name ||
      profile.professional_title ||
      profile.summary ||
      profile.portfolio ||
      profile.country ||
      profile.city ||
      profile.phone ||
      profile.email ||
      profile.linkedin ||
      profile.skills.length ||
      profile.experiences.length ||
      profile.education.length ||
      profile.certifications.length ||
      profile.projects.length ||
      profile.languages.length ||
      profile.awards.length ||
      profile.references.length,
  );
}

function rowHasAnyValue(formData: Record<string, string>, fieldIds: string[]): boolean {
  return fieldIds.some((fieldId) => getFormValue(formData, fieldId) !== "");
}

function rowHasRequiredValues(formData: Record<string, string>, requiredFieldIds: string[]): boolean {
  return requiredFieldIds.every((fieldId) => getFormValue(formData, fieldId) !== "");
}

function optionalRowsAreValid(
  formData: Record<string, string>,
  rows: MultiRow[],
  getAllFields: (row: MultiRow) => string[],
  getRequiredFields: (row: MultiRow) => string[],
): boolean {
  return rows.every((row) => {
    const allFieldIds = getAllFields(row);
    if (!rowHasAnyValue(formData, allFieldIds)) {
      return true;
    }

    return rowHasRequiredValues(formData, getRequiredFields(row));
  });
}

function toBuilderPayload(
  formData: Record<string, string>,
  educationList: MultiRow[],
  langList: MultiRow[],
  skillList: MultiRow[],
  certList: MultiRow[],
  awardList: MultiRow[],
  experienceList: MultiRow[],
  projectList: MultiRow[],
  referenceList: MultiRow[],
): Record<string, unknown> {
  return {
    full_name: getFormValue(formData, "name"),
    professional_title: getFormValue(formData, "job"),
    portfolio: getFormValue(formData, "port"),
    summary: getFormValue(formData, "sum"),
    country: getFormValue(formData, "country"),
    city: getFormValue(formData, "city"),
    phone: getFormValue(formData, "phone"),
    email: getFormValue(formData, "email"),
    linkedin: getFormValue(formData, "link"),
    education: educationList
      .map((e) => ({
        institution: getFormValue(formData, `inst-${e.id}`),
        qualification: getFormValue(formData, `q-${e.id}`),
        period: getFormValue(formData, `t-${e.id}`),
        details: getFormValue(formData, `d-${e.id}`),
      }))
      .filter((i) => i.institution || i.qualification || i.period || i.details),
    languages: langList
      .map((e) => ({ language: getFormValue(formData, `ln-${e.id}`), proficiency: getFormValue(formData, `lp-${e.id}`) }))
      .filter((i) => i.language),
    skills: skillList
      .map((e) => ({ skill_name: getFormValue(formData, `sn-${e.id}`), proficiency: getFormValue(formData, `sp-${e.id}`) }))
      .filter((i) => i.skill_name),
    certifications: certList
      .map((entry) => ({
        title: getFormValue(formData, `cname-${entry.id}`),
        organization: getFormValue(formData, `corg-${entry.id}`),
        period: getFormValue(formData, `cdate-${entry.id}`),
      }))
      .filter((item) => item.title || item.organization || item.period),
    experiences: experienceList
      .map((e) => ({
        role: getFormValue(formData, `role-${e.id}`),
        organization: getFormValue(formData, `org-${e.id}`),
        period: getFormValue(formData, `tp-${e.id}`),
        responsibilities: splitTextLines(getFormValue(formData, `resp-${e.id}`)),
        achievements: getFormValue(formData, `ach-${e.id}`),
        technologies: splitTextLines(getFormValue(formData, `tech-${e.id}`)),
      }))
      .filter((i) => i.role),
    projects: projectList
      .map((entry) => ({
        title: getFormValue(formData, `pname-${entry.id}`),
        role: getFormValue(formData, `prole-${entry.id}`),
        technologies: splitTextLines(getFormValue(formData, `ptech-${entry.id}`)),
        description: getFormValue(formData, `pdesc-${entry.id}`),
        achievements: getFormValue(formData, `pach-${entry.id}`),
      }))
      .filter((item) => item.title || item.role || item.description),
    references: referenceList
      .map((e) => ({
        name: getFormValue(formData, `rn-${e.id}`),
        role: getFormValue(formData, `rr-${e.id}`),
        organization: getFormValue(formData, `ro-${e.id}`),
        contact_info: getFormValue(formData, `rc-${e.id}`),
      }))
      .filter((item) => item.name || item.role || item.organization || item.contact_info),
    awards: awardList
      .map((entry) => ({
        title: getFormValue(formData, `aname-${entry.id}`),
        organization: getFormValue(formData, `aorg-${entry.id}`),
        date: getFormValue(formData, `adate-${entry.id}`),
        description: getFormValue(formData, `adesc-${entry.id}`),
      }))
      .filter((item) => item.title || item.organization || item.date || item.description),
  };
}


export default function CVBuilderPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [activeStepId, setActiveStepId] = useState(1);
  const [expandedStepId, setExpandedStepId] = useState<number>(1);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [buildError, setBuildError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("careerics_CV.pdf");
  const [isOpeningDrive, setIsOpeningDrive] = useState(false);
  const [isPrefillingProfile, setIsPrefillingProfile] = useState(false);

  const [educationList, setEducationList] = useState<MultiRow[]>(() => [createRow()]);
  const [langList, setLangList] = useState<MultiRow[]>(() => [createRow()]);
  const [skillList, setSkillList] = useState<MultiRow[]>(() => [createRow()]);
  const [certList, setCertList] = useState<MultiRow[]>(() => [createRow()]);
  const [awardList, setAwardList] = useState<MultiRow[]>(() => [createRow()]);
  const [experienceList, setExperienceList] = useState<MultiRow[]>(() => [createRow()]);
  const [projectList, setProjectList] = useState<MultiRow[]>(() => [createRow()]);
  const [referenceList, setReferenceList] = useState<MultiRow[]>(() => [createRow()]);
  const [sidebarExpandedId, setSidebarExpandedId] = useState(1);

  const hasUserEditedRef = useRef(false);
  const isHydratingProfileRef = useRef(false);
  const loadedProfileUserIdRef = useRef<string | null>(null);

  const markFormDirty = () => {
    if (!isHydratingProfileRef.current) {
      hasUserEditedRef.current = true;
    }
  };

  const handleInputChange = (id: string, value: string) => {
    markFormDirty();
    setFormData((previous) => ({ ...previous, [id]: value }));
  };

  const addEntry = (
    list: MultiRow[],
    setList: React.Dispatch<React.SetStateAction<MultiRow[]>>,
  ) => {
    markFormDirty();
    setList([...list, createRow()]);
  };

  const removeEntry = (
    id: number,
    list: MultiRow[],
    setList: React.Dispatch<React.SetStateAction<MultiRow[]>>,
  ) => {
    if (list.length <= 1) {
      return;
    }

    markFormDirty();
    setList(list.filter((item) => item.id !== id));
  };

  useEffect(() => {
    return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); };
  }, [downloadUrl]);

  useEffect(() => {
    loadedProfileUserIdRef.current = null;
    hasUserEditedRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    let alive = true;

    const loadSavedProfile = async () => {
      if (isAuthLoading || !user?.id || loadedProfileUserIdRef.current === user.id) {
        return;
      }

      loadedProfileUserIdRef.current = user.id;
      setIsPrefillingProfile(true);

      try {
        const response = await cvService.getProfile(user.id);
        if (!alive || !response.success || !response.data || hasUserEditedRef.current) {
          return;
        }

        if (!profileHasStoredCvData(response.data)) {
          return;
        }

        const nextState = buildPrefillState(response.data);
        isHydratingProfileRef.current = true;

        setFormData(nextState.formData);
        setEducationList(nextState.educationList);
        setLangList(nextState.langList);
        setSkillList(nextState.skillList);
        setCertList(nextState.certList);
        setAwardList(nextState.awardList);
        setExperienceList(nextState.experienceList);
        setProjectList(nextState.projectList);
        setReferenceList(nextState.referenceList);
      } finally {
        isHydratingProfileRef.current = false;
        if (alive) {
          setIsPrefillingProfile(false);
        }
      }
    };

    void loadSavedProfile();

    return () => {
      alive = false;
    };
  }, [isAuthLoading, user?.id]);

  const cvSteps = [
    { id: 1, title: "Personal Details", text: "Name, Job Title, Portfolio, Summary..." },
    { id: 2, title: "Education", text: "Institution, Qualification, Period, Details." },
    { id: 3, title: "Languages & Skills", text: "Highlight your key strengths" },
    { id: 4, title: "Certificates & Awards", text: "Title, Organization, Date, Description..." },
    { id: 5, title: "Experience", text: "Add your previous job roles" },
    { id: 6, title: "Projects", text: "Showcase your work" },
    { id: 7, title: "References", text: "Professional vouchers" },
  ];

  const isStepComplete = (stepId: number = expandedStepId) => {
    switch (stepId) {
      case 1:
        return rowHasRequiredValues(formData, ["name", "job", "country", "city", "phone", "email"]);
      case 2:
        return optionalRowsAreValid(
          formData,
          educationList,
          (entry) => [`inst-${entry.id}`, `q-${entry.id}`, `t-${entry.id}`, `d-${entry.id}`],
          (entry) => [`inst-${entry.id}`, `q-${entry.id}`, `t-${entry.id}`],
        );
      case 3:
        return (
          optionalRowsAreValid(
            formData,
            langList,
            (entry) => [`ln-${entry.id}`, `lp-${entry.id}`],
            (entry) => [`ln-${entry.id}`, `lp-${entry.id}`],
          ) &&
          optionalRowsAreValid(
            formData,
            skillList,
            (entry) => [`sn-${entry.id}`, `sp-${entry.id}`],
            (entry) => [`sn-${entry.id}`, `sp-${entry.id}`],
          )
        );
      case 4:
        return (
          optionalRowsAreValid(
            formData,
            certList,
            (entry) => [`cname-${entry.id}`, `corg-${entry.id}`, `cdate-${entry.id}`],
            (entry) => [`cname-${entry.id}`, `corg-${entry.id}`, `cdate-${entry.id}`],
          ) &&
          optionalRowsAreValid(
            formData,
            awardList,
            (entry) => [`aname-${entry.id}`, `aorg-${entry.id}`, `adate-${entry.id}`, `adesc-${entry.id}`],
            (entry) => [`aname-${entry.id}`, `aorg-${entry.id}`, `adate-${entry.id}`],
          )
        );
      case 5:
        return optionalRowsAreValid(
          formData,
          experienceList,
          (entry) => [`role-${entry.id}`, `org-${entry.id}`, `tp-${entry.id}`, `resp-${entry.id}`, `ach-${entry.id}`],
          (entry) => [`role-${entry.id}`, `org-${entry.id}`, `tp-${entry.id}`, `resp-${entry.id}`],
        );
      case 6:
        return optionalRowsAreValid(
          formData,
          projectList,
          (entry) => [`pname-${entry.id}`, `prole-${entry.id}`, `ptech-${entry.id}`, `pdesc-${entry.id}`, `pach-${entry.id}`],
          (entry) => [`prole-${entry.id}`, `pdesc-${entry.id}`],
        );
      case 7:
        return optionalRowsAreValid(
          formData,
          referenceList,
          (entry) => [`rn-${entry.id}`, `rr-${entry.id}`, `ro-${entry.id}`, `rc-${entry.id}`],
          (entry) => [`rn-${entry.id}`, `rc-${entry.id}`],
        );
      default:
        return false;
    }
  };

  const isFormValid = () => {
    const allSteps = [1, 2, 3, 4, 5, 6, 7];
    return allSteps.every((step) => isStepComplete(step));
  };

  const handleSubmit = async () => {
    if (isAuthLoading) { setBuildError("Checking your session. Please try again."); return; }
    if (!user?.id) { setBuildError("Please sign in first to build your CV."); return; }
    setIsBuilding(true);
    setIsFinished(false);
    setBuildError(null);
    try {
      const payload = toBuilderPayload(
        formData,
        educationList,
        langList,
        skillList,
        certList,
        awardList,
        experienceList,
        projectList,
        referenceList,
      );

      const pdfBlob = await cvService.buildCV(user.id, payload);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setDownloadName(
        toSafePdfFileName(`${getFormValue(formData, "name") || "careerics"}_CV`, "careerics_CV"),
      );
      setIsFinished(true);
    } catch (error) {
      setBuildError(error instanceof Error ? error.message : "Failed to build CV. Please try again.");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleGoogleDriveQuickOpen = () => {
    if (isOpeningDrive) return;
    setIsOpeningDrive(true);
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      link.click();
    }
    window.open("https://drive.google.com/drive/my-drive", "_blank", "noopener,noreferrer");
    window.setTimeout(() => setIsOpeningDrive(false), 1400);
  };

  const selectedCountry = Country.getAllCountries().find(
    (country) => country.name === formData["country"],
  );

  const stateOptions = selectedCountry?.isoCode
    ? (State.getStatesOfCountry(selectedCountry.isoCode) || []).map((state) => state.name)
    : [];

  const ALL_LANGUAGES = ISO6391.getAllNames().sort();
  const PROFICIENCY_LEVELS = [
    "Native",
    "Professional Working",
    "Full Professional",
    "Limited Working",
    "Elementary",
  ];

  return (
    <Interview
      key={activeStepId}
      title="CV/Resume Form"
      questions={cvSteps}
      currentActiveId={sidebarExpandedId}
      onQuestionClick={(id) => {
        setSidebarExpandedId(id);
        setExpandedStepId(id);
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="scroll-area"
          style={{
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            paddingLeft: "10vw",
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "none",
            paddingTop: "6vw",
            paddingBottom: "1vw",
            gap: "1vh",
          }}
        >
          {isBuilding ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "80%",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontFamily: "var(--font-nova-square)",
                  marginBottom: "10px",
                }}
              >
                Building your CV...
              </h2>
              <img src="/interview/analyzing.svg" alt="Building CV" style={{ width: "220px" }} />
            </div>
          ) : isFinished ? (
            <div style={{ padding: "20px", width: "100%" }}>
              <h2
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontFamily: "var(--font-nova-square)",
                  marginBottom: "10px",
                }}
              >
                Ready to see your CV?
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <InterviewCard
                  questionTitle=""
                  videoBoxStyle={{
                    background: "rgba(255, 255, 255, 0.41)",
                    width: "100%",
                    minHeight: "360px",
                    borderRadius: "40px",
                  }}
                  videoContent={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "24px",
                        padding: "28px",
                        minHeight: "360px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          width: "min(38vw, 220px)",
                          height: "min(52vw, 300px)",
                          minWidth: "160px",
                          minHeight: "220px",
                          borderRadius: "25px",
                          flexShrink: 0,
                          boxShadow: "0 18px 42px rgba(0,0,0,0.2)",
                          overflow: "hidden",
                        }}
                      >
                        <PdfPreviewFrame
                          src={downloadUrl}
                          title="Generated CV preview"
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <a
                          href={downloadUrl ?? "#"}
                          download={downloadName}
                          style={{
                            backgroundColor: "#d4ff47",
                            color: "#1a1a1a",
                            border: "none",
                            padding: "14px 40px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            width: "240px",
                            textAlign: "center",
                            textDecoration: "none",
                            pointerEvents: downloadUrl ? "auto" : "none",
                            opacity: downloadUrl ? 1 : 0.5,
                          }}
                        >
                          Download CV
                        </a>
                        <span style={{ color: "white", textAlign: "center", opacity: 0.6 }}>or</span>
                        <button
                          type="button"
                          onClick={handleGoogleDriveQuickOpen}
                          disabled={isOpeningDrive}
                          style={{
                            backgroundColor: "white",
                            color: "#1a1a1a",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "240px",
                            justifyContent: "center",
                            cursor: isOpeningDrive ? "default" : "pointer",
                            opacity: isOpeningDrive ? 0.7 : 1,
                          }}
                        >
                          <img src="/global/drive.svg" style={{ width: "18px" }} alt="Drive" />
                          {isOpeningDrive ? "Opening Drive..." : "Google Drive"}
                        </button>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <h2
                style={{
                  color: "white",
                  fontSize: "2.5rem",
                  fontFamily: "var(--font-nova-square)",
                  marginBottom: "10px",
                }}
              >
                {cvSteps.find((step) => step.id === expandedStepId)?.title}
              </h2>

              {isPrefillingProfile ? (
                <p
                  style={{
                    color: "#D7E3FF",
                    fontFamily: "var(--font-jura)",
                    marginTop: 0,
                  }}
                >
                  Loading your latest saved CV data...
                </p>
              ) : null}

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {expandedStepId === 1 && (
                  <DynamicCVForm
                    values={formData}
                    onChange={handleInputChange}
                    fields={[
                      { id: "name", type: "text", placeholder: "Full Name" },
                      {
                        id: "row1",
                        type: "row",
                        fields: [
                          { id: "job", type: "text", placeholder: "Job Title" },
                          { id: "port", type: "text", placeholder: "Portfolio (Optional)" },
                        ],
                      },
                      { id: "sum", type: "textarea", placeholder: "Summary" },
                      {
                        id: "loc-row",
                        type: "row",
                        fields: [
                          {
                            id: "country",
                            type: "select",
                            placeholder: "Country",
                            options: Country.getAllCountries().map((country) => country.name),
                          },
                          {
                            id: "city",
                            type: "select",
                            placeholder: "City",
                            options: stateOptions,
                          },
                        ],
                      },
                      { id: "phone", type: "text", placeholder: "Phone Number" },
                      { id: "email", type: "email", placeholder: "Email Address" },
                      { id: "link", type: "text", placeholder: "Linkedin Profile" },
                    ]}
                  />
                )}

                {expandedStepId === 2 && (
                  <>
                    {educationList.map((entry, index) => (
                      <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <span style={{ color: "white", opacity: 0.7 }}>{index + 1}.</span>
                        <div style={{ flex: 1 }}>
                          <DynamicCVForm
                            values={formData}
                            onChange={handleInputChange}
                            fields={[
                              { id: `inst-${entry.id}`, type: "text", placeholder: "Institution's name" },
                              {
                                id: `r-${entry.id}`,
                                type: "row",
                                fields: [
                                  {
                                    id: `q-${entry.id}`,
                                    type: "select",
                                    placeholder: "Qualification",
                                    options: ["Bachelor's", "Master's", "PhD", "Diploma"],
                                  },
                                  { id: `t-${entry.id}`, type: "text", placeholder: "Time period" },
                                ],
                              },
                            ]}
                          />
                        </div>
                        <button type="button" onClick={() => removeEntry(entry.id, educationList, setEducationList)}>
                          <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)", cursor: "pointer" }} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addEntry(educationList, setEducationList)}
                      style={{ color: "#d4ff47", background: "none", border: "none" }}
                    >
                      + Add another degree
                    </button>
                  </>
                )}

                {expandedStepId === 3 && (
                  <>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {langList.map((entry, index) => (
                          <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm
                                values={formData}
                                onChange={handleInputChange}
                                fields={[
                                  {
                                    id: `lrow-${entry.id}`,
                                    type: "row",
                                    fields: [
                                      { id: `ln-${entry.id}`, type: "select", placeholder: "Language", options: ALL_LANGUAGES },
                                      { id: `lp-${entry.id}`, type: "select", placeholder: "Proficiency", options: PROFICIENCY_LEVELS },
                                    ],
                                  },
                                ]}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id, langList, setLangList)}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEntry(langList, setLangList)}
                          style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", marginBottom: "30px" }}
                        >
                          + Add language
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {skillList.map((entry, index) => (
                          <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm
                                values={formData}
                                onChange={handleInputChange}
                                fields={[
                                  {
                                    id: `srow-${entry.id}`,
                                    type: "row",
                                    fields: [
                                      { id: `sn-${entry.id}`, type: "text", placeholder: "Skill" },
                                      { id: `sp-${entry.id}`, type: "select", placeholder: "Level", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
                                    ],
                                  },
                                ]}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id, skillList, setSkillList)}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEntry(skillList, setSkillList)}
                          style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}
                        >
                          + Add skill
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {expandedStepId === 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {certList.map((entry, index) => (
                          <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm
                                values={formData}
                                onChange={handleInputChange}
                                fields={[
                                  { id: `cname-${entry.id}`, type: "text", placeholder: "Certificate Title" },
                                  {
                                    id: `cd-${entry.id}`,
                                    type: "row",
                                    fields: [
                                      { id: `corg-${entry.id}`, type: "text", placeholder: "Organization" },
                                      { id: `cdate-${entry.id}`, type: "text", placeholder: "Date" },
                                    ],
                                  },
                                ]}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id, certList, setCertList)}
                              style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}
                            >
                              <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEntry(certList, setCertList)}
                          style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                        >
                          + Add certificate
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {awardList.map((entry, index) => (
                          <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm
                                values={formData}
                                onChange={handleInputChange}
                                fields={[
                                  { id: `aname-${entry.id}`, type: "text", placeholder: "Award Title" },
                                  {
                                    id: `ad-${entry.id}`,
                                    type: "row",
                                    fields: [
                                      { id: `aorg-${entry.id}`, type: "text", placeholder: "Issuer / Organization" },
                                      { id: `adate-${entry.id}`, type: "text", placeholder: "Year" },
                                    ],
                                  },
                                ]}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id, awardList, setAwardList)}
                              style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}
                            >
                              <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEntry(awardList, setAwardList)}
                          style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                        >
                          + Add award
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {expandedStepId === 5 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {experienceList.map((entry, index) => (
                        <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm
                              values={formData}
                              onChange={handleInputChange}
                              fields={[
                                { id: `role-${entry.id}`, type: "text", placeholder: "Role" },
                                {
                                  id: `row-${entry.id}`,
                                  type: "row",
                                  fields: [
                                    { id: `org-${entry.id}`, type: "text", placeholder: "Organization" },
                                    { id: `tp-${entry.id}`, type: "text", placeholder: "Time Period" },
                                  ],
                                },
                                { id: `resp-${entry.id}`, type: "textarea", placeholder: "Responsibilities" },
                              ]}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id, experienceList, setExperienceList)}
                            style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}
                          >
                            <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEntry(experienceList, setExperienceList)}
                        style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}
                      >
                        + Add experience
                      </button>
                    </div>
                  </div>
                )}

                {expandedStepId === 6 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {projectList.map((entry, index) => (
                        <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm
                              values={formData}
                              onChange={handleInputChange}
                              fields={[
                                { id: `pname-${entry.id}`, type: "text", placeholder: "Project Name" },
                                { id: `prole-${entry.id}`, type: "text", placeholder: "Your Role" },
                                { id: `ptech-${entry.id}`, type: "text", placeholder: "Technologies Used" },
                                { id: `pdesc-${entry.id}`, type: "textarea", placeholder: "Description" },
                                { id: `pach-${entry.id}`, type: "textarea", placeholder: "Key Achievements" },
                              ]}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id, projectList, setProjectList)}
                            style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}
                          >
                            <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEntry(projectList, setProjectList)}
                        style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}
                      >
                        + Add project
                      </button>
                    </div>
                  </div>
                )}

                {expandedStepId === 7 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {referenceList.map((entry, index) => (
                        <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm
                              values={formData}
                              onChange={handleInputChange}
                              fields={[
                                {
                                  id: `ref-row1-${entry.id}`,
                                  type: "row",
                                  fields: [
                                    { id: `rn-${entry.id}`, type: "text", placeholder: "Name" },
                                    { id: `rr-${entry.id}`, type: "text", placeholder: "Role" },
                                  ],
                                },
                                {
                                  id: `ref-row2-${entry.id}`,
                                  type: "row",
                                  fields: [
                                    { id: `ro-${entry.id}`, type: "text", placeholder: "Organization" },
                                    { id: `rc-${entry.id}`, type: "text", placeholder: "Contact Info" },
                                  ],
                                },
                              ]}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id, referenceList, setReferenceList)}
                            style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}
                          >
                            <img src="/cv/trash.svg" alt="" aria-hidden="true" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEntry(referenceList, setReferenceList)}
                        style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}
                      >
                        + Add reference
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {buildError ? (
                <p
                  style={{
                    color: "#FFD3D3",
                    fontFamily: "var(--font-jura)",
                    marginTop: "20px",
                    marginBottom: 0,
                  }}
                >
                  {buildError}
                </p>
              ) : null}

              <div
                style={{
                  marginTop: "3vh",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  position: "sticky",
                  bottom: 0,
                  paddingTop: "20px",
                  paddingBottom: "12px",
                  zIndex: 5,
                }}
              >
                <Button
                  onClick={() => {
                    if (expandedStepId === 7) {
                      if (isFormValid()) {
                        void handleSubmit();
                      } else {
                        alert("Please complete all mandatory fields before building your CV.");
                      }
                    } else {
                      const next = expandedStepId + 1;
                      if (next > activeStepId) setActiveStepId(next);
                      setExpandedStepId(next);
                      setSidebarExpandedId(next);
                    }
                  }}
                  disabled={
                    isBuilding ||
                    (expandedStepId === 7 ? !isFormValid() : !isStepComplete())
                  }
                  isLoading={isBuilding}
                  style={{
                    width: "160px",
                    minWidth: "100px",
                    height: "45px",
                    flex: "none",
                    borderRadius: "12px",
                    backgroundColor: "#bfff4f",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "14px",
                    border: "none",
                    opacity:
                      isBuilding
                        ? 0.7
                        : expandedStepId === 7
                          ? (isFormValid() ? 1 : 0.5)
                          : isStepComplete()
                            ? 1
                            : 0.5,
                    cursor:
                      isBuilding
                        ? "default"
                        : expandedStepId === 7
                          ? (isFormValid() ? "pointer" : "not-allowed")
                          : isStepComplete()
                            ? "pointer"
                            : "not-allowed",
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {expandedStepId === 7 ? (isBuilding ? "Building..." : "Build CV") : "Next"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Interview>
  );
}
