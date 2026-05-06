"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Interview from "@/components/ui/interview"; 
import DynamicCVForm from "@/components/ui/cv-form";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/ui/interview-card"; 
import { cvService } from "@/services";
import { useAuth } from "@/providers/auth-provider";
import { Country, State } from 'country-state-city';
import ISO6391 from 'iso-639-1';

type MultiRow = { id: number };

// ─── Validation Helpers ──────────────────────────────────────────────────────

const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email address",
  phone: (v: string) => /^\+?[\d\s\-().]{7,20}$/.test(v) ? null : "Invalid phone number",
  url: (v: string) => {
    if (!v) return null; // optional
    try { new URL(v.startsWith("http") ? v : `https://${v}`); return null; }
    catch { return "Invalid URL"; }
  },
  linkedin: (v: string) => {
    if (!v) return null;
    return /linkedin\.com\/in\/.+/.test(v) ? null : "Should be a LinkedIn profile URL";
  },
  required: (v: string) => v?.trim() ? null : "This field is required",
  name: (v: string) => {
    if (!v?.trim()) return "Full name is required";
    if (v.trim().length < 2) return "Name is too short";
    if (!/^[a-zA-Z\s\-'.]+$/.test(v.trim())) return "Name contains invalid characters";
    return null;
  },
  period: (v: string) => {
    if (!v?.trim()) return "Time period is required";
    if (v.trim().length < 4) return "Please provide a valid time period";
    return null;
  },
};

const fieldValidators: Record<string, (v: string) => string | null> = {
  name:  validators.name,
  email: validators.email,
  phone: validators.phone,
  port:  validators.url,
  link:  validators.linkedin,
};

// Dynamic key prefix validators (applied by prefix matching)
const prefixValidators: Array<{ prefix: string; fn: (v: string) => string | null }> = [
  { prefix: "t-",    fn: validators.period },   // education time period
  { prefix: "tp-",   fn: validators.period },   // experience time period
  { prefix: "cdate-",fn: validators.required }, // cert date
  { prefix: "adate-",fn: validators.required }, // award date
  { prefix: "re-",   fn: (v) => v ? validators.email(v) : null }, // ref email (optional)
];

function getFieldError(fieldId: string, value: string): string | null {
  // Check exact match
  if (fieldValidators[fieldId]) return fieldValidators[fieldId](value);
  // Check prefix match
  for (const { prefix, fn } of prefixValidators) {
    if (fieldId.startsWith(prefix)) return fn(value);
  }
  return null;
}


function splitTextLines(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(/\r?\n|,|;/).map((l) => l.trim()).filter(Boolean);
}

function getFormValue(formData: Record<string, string>, key: string): string {
  return formData[key]?.trim() ?? "";
}

function toBuilderPayload(
  formData: Record<string, string>,
  educationList: MultiRow[],
  langList: MultiRow[],
  skillList: MultiRow[],
  certList: MultiRow[],
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
      .map((e) => ({
        title: getFormValue(formData, `cname-${e.id}`),
        organization: getFormValue(formData, `corg-${e.id}`),
        period: getFormValue(formData, `cdate-${e.id}`),
        description: getFormValue(formData, `cdesc-${e.id}`),
      }))
      .filter((i) => i.title || i.organization || i.period || i.description),
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
      .map((e) => ({
        role: getFormValue(formData, `prole-${e.id}`),
        technologies: splitTextLines(getFormValue(formData, `ptech-${e.id}`)),
        description: getFormValue(formData, `pdesc-${e.id}`),
        achievements: getFormValue(formData, `pach-${e.id}`),
      }))
      .filter((i) => i.role || i.description),
    references: referenceList
      .map((e) => ({
        name: getFormValue(formData, `rn-${e.id}`),
        role: getFormValue(formData, `rr-${e.id}`),
        organization: getFormValue(formData, `ro-${e.id}`),
        contact_info: getFormValue(formData, `rc-${e.id}`),
      }))
      .filter((i) => i.name),
    awards: [],
  };
}


function FieldError({ message }: { message: string }) {
  return (
    <span style={{
      display: "block",
      color: "#ff6b6b",
      fontSize: "11px",
      marginTop: "4px",
      marginLeft: "2px",
      fontWeight: 500,
      letterSpacing: "0.02em",
    }}>
      ⚠ {message}
    </span>
  );
}



function ValidatedField({
  id,
  value,
  touched,
  children,
}: {
  id: string;
  value: string;
  touched: boolean;
  children: React.ReactNode;
}) {
  const error = touched ? getFieldError(id, value) : null;
  return (
    <div>
      {children}
      {error && <FieldError message={error} />}
    </div>
  );
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
  const [downloadName, setDownloadName] = useState("generated-cv.pdf");
  const [isOpeningDrive, setIsOpeningDrive] = useState(false);

  // Track which fields have been touched (blurred or "Next" attempted)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  // Track whether the user tried to go "Next" on the current step
  const [attemptedNext, setAttemptedNext] = useState(false);

  const [educationList, setEducationList] = useState([{ id: Date.now() }]);
  const [langList, setLangList] = useState([{ id: Date.now() }]);
  const [skillList, setSkillList] = useState([{ id: Date.now() }]);
  const [certList, setCertList] = useState([{ id: Date.now() }]);
  const [experienceList, setExperienceList] = useState([{ id: Date.now() }]);
  const [projectList, setProjectList] = useState([{ id: Date.now() }]);
  const [referenceList, setReferenceList] = useState([{ id: Date.now() }]);
  const [awardList, setAwardList] = useState<MultiRow[]>([{ id: Date.now() }]);
  const [sidebarExpandedId, setSidebarExpandedId] = useState(1);

  const markFieldTouched = (id: string) =>
    setTouchedFields((prev) => new Set(prev).add(id));

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    markFieldTouched(id);
  };

  const showError = (id: string): string | null => {
    if (!attemptedNext && !touchedFields.has(id)) return null;
    return getFieldError(id, formData[id] ?? "");
  };

  useEffect(() => {
    return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); };
  }, [downloadUrl]);

  useEffect(() => {
    setAttemptedNext(false);
  }, [expandedStepId]);

  const cvSteps = [
    { id: 1, title: "Personal Details", text: "Name, Job Title, Portfolio, Summary..." },
    { id: 2, title: "Education", text: "Institution, Qualification, Period, Details." },
    { id: 3, title: "Languages & Skills", text: "Highlight your key strengths" },
    { id: 4, title: "Certificates & Awards", text: "Title, Organization, Date, Description..." },
    { id: 5, title: "Experience", text: "Add your previous job roles" },
    { id: 6, title: "Projects", text: "Showcase your work" },
    { id: 7, title: "References", text: "Professional vouchers" },
  ];


  const hasFormatError = (ids: string[]) =>
    ids.some((id) => getFieldError(id, formData[id] ?? "") !== null);

  const isStepComplete = (stepId: number = expandedStepId): boolean => {
    switch (stepId) {
      case 1:
        return (
          ["name", "job", "country", "city", "phone", "email"].every(
            (id) => formData[id]?.trim()
          ) && !hasFormatError(["name", "email", "phone", "port", "link"])
        );
      case 2:
        return educationList.every(
          (e) => formData[`inst-${e.id}`]?.trim() && formData[`q-${e.id}`]?.trim() && formData[`t-${e.id}`]?.trim()
        );
      case 3:
        return (
          langList.every((l) => formData[`ln-${l.id}`]?.trim() && formData[`lp-${l.id}`]?.trim()) &&
          skillList.every((s) => formData[`sn-${s.id}`]?.trim() && formData[`sp-${s.id}`]?.trim())
        );
      case 4:
      case 5:
      case 6:
      case 7:
        return true; // Optional steps — always allow proceeding
      default:
        return true;
    }
  };

  const touchCurrentStep = () => {
    const ids: string[] = [];
    switch (expandedStepId) {
      case 1: ids.push("name", "job", "country", "city", "phone", "email", "port", "link"); break;
      case 2: educationList.forEach((e) => ids.push(`inst-${e.id}`, `q-${e.id}`, `t-${e.id}`)); break;
      case 3:
        langList.forEach((l) => ids.push(`ln-${l.id}`, `lp-${l.id}`));
        skillList.forEach((s) => ids.push(`sn-${s.id}`, `sp-${s.id}`));
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        break; // Optional — no forced touching
    }
    setTouchedFields((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next; });
    setAttemptedNext(true);
  };

  const isFormValid = () => [1, 2, 3].every((s) => isStepComplete(s)); // Steps 4-7 are optional

  const addEntry = (list: MultiRow[], setList: React.Dispatch<React.SetStateAction<MultiRow[]>>) =>
    setList([...list, { id: Date.now() }]);
  const removeEntry = (id: number, list: MultiRow[], setList: React.Dispatch<React.SetStateAction<MultiRow[]>>) => {
    if (list.length > 1) setList(list.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (isAuthLoading) { setBuildError("Checking your session. Please try again."); return; }
    if (!user?.id) { setBuildError("Please sign in first to build your CV."); return; }
    setIsBuilding(true);
    setBuildError(null);
    try {
      const payload = toBuilderPayload(formData, educationList, langList, skillList, certList, experienceList, projectList, referenceList);
      const pdfBlob = await cvService.buildCV(user.id, payload);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setDownloadName(`${(getFormValue(formData, "name") || "careerics").replace(/\s+/g, "_")}_CV.pdf`);
      setIsFinished(true);
    } catch (error) {
      setBuildError(error instanceof Error ? error.message : "Failed to build CV. Please try again.");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSidebarClick = (id: number) => {
    if (!isBuilding && !isFinished) setExpandedStepId(id);
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

  const selectedCountry = Country.getAllCountries().find((c) => c.name === formData["country"]);
  const stateOptions = selectedCountry?.isoCode
    ? (State.getStatesOfCountry(selectedCountry.isoCode) || []).map((s) => s.name)
    : [];
  const ALL_LANGUAGES = ISO6391.getAllNames().sort();
  const PROFICIENCY_LEVELS = ["Native", "Professional Working", "Full Professional", "Limited Working", "Elementary"];

  // ── Error style helper ───────────────────────────────────────────────────────
  const errorStyle = (id: string): React.CSSProperties => {
    const err = showError(id);
    return err ? { outline: "1.5px solid #ff6b6b", borderRadius: "8px" } : {};
  };

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
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div className="scroll-area" style={{ width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", paddingLeft: "10vw", height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingTop: "6vw", paddingBottom: "1vw", gap: "1vh" }}>

          {isBuilding ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "28px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Building your CV...</h2>
              <img src="/interview/analyzing.svg" alt="Building CV" style={{ width: "220px" }} />
            </div>
          ) : isFinished ? (
            <div style={{ padding: "20px", width: "100%" }}>
              <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Ready to see your CV?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", width: "100%" }}>
                <InterviewCard
                  questionTitle=""
                  videoBoxStyle={{ background: "rgba(255,255,255,0.41)", width: "100%", height: "300px", borderRadius: "40px" }}
                  videoContent={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "50px", padding: "50px", height: "100%" }}>
                      <div style={{ width: "180px", height: "240px", backgroundColor: "white", borderRadius: "25px" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <button style={{ backgroundColor: "#d4ff47", color: "#1a1a1a", border: "none", padding: "14px 40px", borderRadius: "12px", fontWeight: "bold", width: "240px" }}>Download</button>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ color: "white", fontSize: "2.5rem", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>
                {cvSteps.find((s) => s.id === expandedStepId)?.title}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* ── STEP 1: PERSONAL DETAILS ─────────────────────────────── */}
                {expandedStepId === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                      { id: "name", type: "text", placeholder: "Full Name" },
                      { id: "row1", type: "row", fields: [{ id: "job", type: "text", placeholder: "Job Title" }, { id: "port", type: "text", placeholder: "Portfolio (Optional)" }] },
                      { id: "sum", type: "textarea", placeholder: "Summary" },
                      { id: "loc-row", type: "row", fields: [
                        { id: "country", type: "select", placeholder: "Country", options: Country.getAllCountries().map((c) => c.name) },
                        { id: "city", type: "select", placeholder: "City", options: stateOptions },
                      ]},
                      { id: "phone", type: "text", placeholder: "Phone Number" },
                      { id: "email", type: "email", placeholder: "Email Address" },
                      { id: "link", type: "text", placeholder: "LinkedIn Profile" },
                    ]} />
                    {/* Inline errors for step 1 */}
                    {showError("name") && <FieldError message={showError("name")!} />}
                    {showError("port") && <FieldError message={showError("port")!} />}
                    {showError("phone") && <FieldError message={showError("phone")!} />}
                    {showError("email") && <FieldError message={showError("email")!} />}
                    {showError("link") && <FieldError message={showError("link")!} />}
                  </div>
                )}

                {/* ── STEP 2: EDUCATION ─────────────────────────────────────── */}
                {expandedStepId === 2 && (
                  <>
                    {educationList.map((edu, index) => (
                      <div key={edu.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <span style={{ color: "white", opacity: 0.7 }}>{index + 1}.</span>
                        <div style={{ flex: 1 }}>
                          <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                            { id: `inst-${edu.id}`, type: "text", placeholder: "Institution's name" },
                            { id: `r-${edu.id}`, type: "row", fields: [
                              { id: `q-${edu.id}`, type: "select", placeholder: "Qualification", options: ["Bachelor's", "Master's", "PhD", "Diploma"] },
                              { id: `t-${edu.id}`, type: "text", placeholder: "Time period (e.g. 2020 – 2024)" },
                            ]},
                          ]} />
                          {showError(`t-${edu.id}`) && <FieldError message={showError(`t-${edu.id}`)!} />}
                        </div>
                        <button onClick={() => removeEntry(edu.id, educationList, setEducationList)}>
                          <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)", cursor: "pointer" }} />
                        </button>
                      </div>
                    ))}
                    <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", paddingLeft: "35px" }}>
                      <button onClick={() => addEntry(educationList, setEducationList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500", padding: 0 }}>
                        + Add another degree
                      </button>
                    </div>
                  </>
                )}

                {/* ── STEP 3: LANGUAGES & SKILLS ───────────────────────────── */}
                {expandedStepId === 3 && (
                  <>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {langList.map((lang, index) => (
                          <div key={lang.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `lrow-${lang.id}`, type: "row", fields: [{ id: `ln-${lang.id}`, type: "select", placeholder: "Language", options: ALL_LANGUAGES }, { id: `lp-${lang.id}`, type: "select", placeholder: "Proficiency", options: PROFICIENCY_LEVELS }] }]} />
                            </div>
                            <button onClick={() => removeEntry(lang.id, langList, setLangList)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                              <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addEntry(langList, setLangList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", marginBottom: "30px" }}>
                          + Add language
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ minWidth: "20px" }} />
                      <div style={{ flex: 1 }}>
                        {skillList.map((skill, index) => (
                          <div key={skill.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                            <div style={{ flex: 1 }}>
                              <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `srow-${skill.id}`, type: "row", fields: [{ id: `sn-${skill.id}`, type: "text", placeholder: "Skill" }, { id: `sp-${skill.id}`, type: "select", placeholder: "Level", options: ["Beginner", "Intermediate", "Advanced", "Expert"] }] }]} />
                            </div>
                            <button onClick={() => removeEntry(skill.id, skillList, setSkillList)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                              <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addEntry(skillList, setSkillList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
                          + Add skill
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── STEP 4: CERTIFICATES & AWARDS ────────────────────────── */}
                {expandedStepId === 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <h3 style={{ color: "white", fontSize: "18px", marginLeft: "40px", marginBottom: "5px", opacity: 0.9 }}>Certificates</h3>
                      <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{ minWidth: "20px" }} />
                        <div style={{ flex: 1 }}>
                          {certList.map((cert, index) => (
                            <div key={cert.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
                              <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                              <div style={{ flex: 1 }}>
                                <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                                  { id: `cname-${cert.id}`, type: "text", placeholder: "Certificate Title" },
                                  { id: `cd-${cert.id}`, type: "row", fields: [{ id: `corg-${cert.id}`, type: "text", placeholder: "Organization" }, { id: `cdate-${cert.id}`, type: "text", placeholder: "Date (e.g. Jan 2023)" }] },
                                ]} />
                                {showError(`cdate-${cert.id}`) && <FieldError message={showError(`cdate-${cert.id}`)!} />}
                              </div>
                              <button onClick={() => removeEntry(cert.id, certList, setCertList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
                                <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addEntry(certList, setCertList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px", paddingLeft: "40px" }}>
                            + Add certificate
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <h3 style={{ color: "white", fontSize: "18px", marginLeft: "40px", marginBottom: "5px", opacity: 0.9 }}>Awards</h3>
                      <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{ minWidth: "20px" }} />
                        <div style={{ flex: 1 }}>
                          {awardList.map((award, index) => (
                            <div key={award.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
                              <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                              <div style={{ flex: 1 }}>
                                <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                                  { id: `aname-${award.id}`, type: "text", placeholder: "Award Title" },
                                  { id: `ad-${award.id}`, type: "row", fields: [{ id: `aorg-${award.id}`, type: "text", placeholder: "Issuer / Organization" }, { id: `adate-${award.id}`, type: "text", placeholder: "Year (e.g. 2023)" }] },
                                ]} />
                                {showError(`adate-${award.id}`) && <FieldError message={showError(`adate-${award.id}`)!} />}
                              </div>
                              <button onClick={() => removeEntry(award.id, awardList, setAwardList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
                                <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addEntry(awardList, setAwardList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px", paddingLeft: "40px" }}>
                            + Add award
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: EXPERIENCE ───────────────────────────────────── */}
                {expandedStepId === 5 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {experienceList.map((exp, index) => (
                        <div key={exp.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                              { id: `role-${exp.id}`, type: "text", placeholder: "Role" },
                              { id: `row-${exp.id}`, type: "row", fields: [{ id: `org-${exp.id}`, type: "text", placeholder: "Organization" }, { id: `tp-${exp.id}`, type: "text", placeholder: "Time Period (e.g. 2021 – Present)" }] },
                              { id: `resp-${exp.id}`, type: "textarea", placeholder: "Responsibilities" },
                            ]} />
                            {showError(`tp-${exp.id}`) && <FieldError message={showError(`tp-${exp.id}`)!} />}
                          </div>
                          <button onClick={() => removeEntry(exp.id, experienceList, setExperienceList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
                            <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addEntry(experienceList, setExperienceList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
                        + Add experience
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 6: PROJECTS ─────────────────────────────────────── */}
                {expandedStepId === 6 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {projectList.map((proj, index) => (
                        <div key={proj.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                              { id: `pname-${proj.id}`, type: "text", placeholder: "Project Name" },
                              { id: `prole-${proj.id}`, type: "text", placeholder: "Your Role" },
                              { id: `ptech-${proj.id}`, type: "text", placeholder: "Technologies Used" },
                              { id: `pdesc-${proj.id}`, type: "textarea", placeholder: "Description" },
                              { id: `pach-${proj.id}`, type: "textarea", placeholder: "Key Achievements" },
                            ]} />
                          </div>
                          <button onClick={() => removeEntry(proj.id, projectList, setProjectList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
                            <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addEntry(projectList, setProjectList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
                        + Add project
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 7: REFERENCES ───────────────────────────────────── */}
                {expandedStepId === 7 && (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ minWidth: "20px" }} />
                    <div style={{ flex: 1 }}>
                      {referenceList.map((ref, index) => (
                        <div key={ref.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                              { id: `rn-${ref.id}`, type: "text", placeholder: "Name" },
                              { id: `rj-${ref.id}`, type: "text", placeholder: "Role" },
                              { id: `rc-${ref.id}`, type: "text", placeholder: "Organization" },
                              { id: `re-${ref.id}`, type: "email", placeholder: "Email Address (Optional)" },
                              { id: `rp-${ref.id}`, type: "text", placeholder: "Phone Number (Optional)" },
                            ]} />
                            {/* Inline errors for reference email and phone */}
                            {showError(`re-${ref.id}`) && <FieldError message={showError(`re-${ref.id}`)!} />}
                            {formData[`rp-${ref.id}`] && validators.phone(formData[`rp-${ref.id}`]) && attemptedNext && (
                              <FieldError message={validators.phone(formData[`rp-${ref.id}`])!} />
                            )}
                          </div>
                          <button onClick={() => removeEntry(ref.id, referenceList, setReferenceList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
                            <img src="/cv/trash.svg" style={{ width: "20px", filter: "invert(0.7)" }} />
                          </button>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "40px" }}>
                        <button onClick={() => addEntry(referenceList, setReferenceList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
                          + Add reference
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── NEXT / BUILD BUTTON ───────────────────────────────────── */}
              <div style={{ marginTop: "3vh", width: "30%", position: "relative", display: "flex", justifyContent: "flex-end", left: "30vw" }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    touchCurrentStep();
                    if (expandedStepId === 7) {
                      if (isFormValid()) {
                        handleSubmit();
                      }
                      // errors are now shown inline — no alert needed
                    } else {
                      if (isStepComplete()) {
                        const next = expandedStepId + 1;
                        if (next > activeStepId) setActiveStepId(next);
                        setExpandedStepId(next);
                        setSidebarExpandedId(next);
                      }
                    }
                  }}
                  disabled={expandedStepId === 7 ? !isFormValid() : !isStepComplete()}
                  style={{
                    width: "160px",
                    minWidth: "100px",
                    height: "45px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    opacity: (expandedStepId === 7 ? isFormValid() : isStepComplete()) ? 1 : 0.5,
                    cursor: (expandedStepId === 7 ? isFormValid() : isStepComplete()) ? "pointer" : "not-allowed",
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {expandedStepId === 7 ? "Build CV" : "Next Step"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Interview>
  );
}