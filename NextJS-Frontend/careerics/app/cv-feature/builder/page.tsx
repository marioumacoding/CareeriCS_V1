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

function splitTextLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,|;/)
    .map((line) => line.trim())
    .filter(Boolean);
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
      .map((entry) => ({
        institution: getFormValue(formData, `inst-${entry.id}`),
        qualification: getFormValue(formData, `q-${entry.id}`),
        period: getFormValue(formData, `t-${entry.id}`),
        details: getFormValue(formData, `d-${entry.id}`),
      }))
      .filter((item) => item.institution || item.qualification || item.period || item.details),
    languages: langList
      .map((entry) => ({
        language: getFormValue(formData, `ln-${entry.id}`),
        proficiency: getFormValue(formData, `lp-${entry.id}`),
      }))
      .filter((item) => item.language),
    skills: skillList
      .map((entry) => ({
        skill_name: getFormValue(formData, `sn-${entry.id}`),
        proficiency: getFormValue(formData, `sp-${entry.id}`),
      }))
      .filter((item) => item.skill_name),
    certifications: certList
      .map((entry) => ({
        title: getFormValue(formData, `cname-${entry.id}`),
        organization: getFormValue(formData, `corg-${entry.id}`),
        period: getFormValue(formData, `cdate-${entry.id}`),
        description: getFormValue(formData, `cdesc-${entry.id}`),
      }))
      .filter((item) => item.title || item.organization || item.period || item.description),
    experiences: experienceList
      .map((entry) => ({
        role: getFormValue(formData, `role-${entry.id}`),
        organization: getFormValue(formData, `org-${entry.id}`),
        period: getFormValue(formData, `tp-${entry.id}`),
        responsibilities: splitTextLines(getFormValue(formData, `resp-${entry.id}`)),
        achievements: getFormValue(formData, `ach-${entry.id}`),
        technologies: splitTextLines(getFormValue(formData, `tech-${entry.id}`)),
      }))
      .filter((item) => item.role),
    projects: projectList
      .map((entry) => ({
        role: getFormValue(formData, `prole-${entry.id}`),
        technologies: splitTextLines(getFormValue(formData, `ptech-${entry.id}`)),
        description: getFormValue(formData, `pdesc-${entry.id}`),
        achievements: getFormValue(formData, `pach-${entry.id}`),
      }))
      .filter((item) => item.role || item.description),
    references: referenceList
      .map((entry) => ({
        name: getFormValue(formData, `rn-${entry.id}`),
        role: getFormValue(formData, `rr-${entry.id}`),
        organization: getFormValue(formData, `ro-${entry.id}`),
        contact_info: getFormValue(formData, `rc-${entry.id}`),
      }))
      .filter((item) => item.name),
    awards: certList
      .map((entry) => ({
        title: getFormValue(formData, `cname-${entry.id}`),
        organization: getFormValue(formData, `corg-${entry.id}`),
        date: getFormValue(formData, `cdate-${entry.id}`),
        description: getFormValue(formData, `cdesc-${entry.id}`),
      }))
      .filter((item) => item.title),
  };
}

export default function CVBuilderPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeStepId, setActiveStepId] = useState(1); // El Step elly zahra f el Form
  const [expandedStepId, setExpandedStepId] = useState<number>(1); // El Step elly expanded f el Sidebar
  const [isBuilding, setIsBuilding] = useState(false); 
  const [isFinished, setIsFinished] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [buildError, setBuildError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("generated-cv.pdf");
  const [isOpeningDrive, setIsOpeningDrive] = useState(false);

  // --- Multi-Entry States ---
  const [educationList, setEducationList] = useState([{ id: Date.now() }]);
  const [langList, setLangList] = useState([{ id: Date.now() }]); 
  const [skillList, setSkillList] = useState([{ id: Date.now() }]); 
  const [certList, setCertList] = useState([{ id: Date.now() }]); 
  const [experienceList, setExperienceList] = useState([{ id: Date.now() }]); 
  const [projectList, setProjectList] = useState([{ id: Date.now() }]); 
  const [referenceList, setReferenceList] = useState([{ id: Date.now() }]);

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const cvSteps = [
    { id: 1, title: "Personal Details", text: "Name, Job Title, Portfolio, Summary..." },
    { id: 2, title: "Education", text: "Institution, Qualification, Period, Details." },
    { id: 3, title: "Languages & Skills", text: "Highlight your key strengths" },
    { id: 4, title: "Certificates & Awards", text: "Title, Organization, Date, Description..." },
    { id: 5, title: "Experience", text: "Add your previous job roles" },
    { id: 6, title: "Projects", text: "Showcase your work" },
    { id: 7, title: "References", text: "Professional vouchers" }
  ];

  // Logic el validation ashan el zorar y-unlock
const isStepComplete = (stepId: number = expandedStepId) => {
  let fieldsToVerify: string[] = [];

  switch (stepId) {
    case 1: 
      fieldsToVerify = ['name', 'job', 'country', 'city', 'phone', 'email']; 
      break;
    case 2: 
      fieldsToVerify = educationList.flatMap(edu => [`inst-${edu.id}`, `q-${edu.id}`, `t-${edu.id}`]); 
      break;
    case 3: 
      fieldsToVerify = [
        ...langList.flatMap(l => [`ln-${l.id}`, `lp-${l.id}`]), 
        ...skillList.flatMap(s => [`sn-${s.id}`, `sp-${s.id}`])
      ]; 
      break;
    case 4: 
      fieldsToVerify = [
        ...certList.flatMap(c => [`cname-${c.id}`, `corg-${c.id}`, `cdate-${c.id}`]),
        ...awardList.flatMap(a => [`aname-${a.id}`, `aorg-${a.id}`, `adate-${a.id}`])
      ]; 
      break;
    case 5: 
      fieldsToVerify = experienceList.flatMap(e => [`role-${e.id}`, `org-${e.id}`, `tp-${e.id}`, `resp-${e.id}`]); 
      break;
    case 6: 
      fieldsToVerify = projectList.flatMap(p => [`prole-${p.id}`, `pdesc-${p.id}`]); 
      break;
    case 7: 
      fieldsToVerify = referenceList.flatMap(r => [`rn-${r.id}`, `rc-${r.id}`]); 
      break;
  }

  // Law el step mesh 1 we mafihash data (fadia tamaman), ben-considerha complete (le2anha optional)
  if (stepId !== 1 && fieldsToVerify.length === 0) {
    return true; 
  }

  // Check en kol field f el step de malyan we mesh fadi
  return fieldsToVerify.every(id => 
    formData[id] && formData[id].toString().trim() !== ""
  );
};

const isFormValid = () => {
  const allSteps = [1, 2, 3, 4, 5, 6, 7];
  return allSteps.every(step => isStepComplete(step));
};

  const addEntry = (list: MultiRow[], setList: React.Dispatch<React.SetStateAction<MultiRow[]>>) =>
    setList([...list, { id: Date.now() }]);
  const removeEntry = (
    id: number,
    list: MultiRow[],
    setList: React.Dispatch<React.SetStateAction<MultiRow[]>>,
  ) => {
    if (list.length > 1) setList(list.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (isAuthLoading) {
      setBuildError("Checking your session. Please try again in a moment.");
      return;
    }

    if (!user?.id) {
      setBuildError("Please sign in first to build your CV.");
      return;
    }

    setIsBuilding(true);
    setBuildError(null);

    try {
      const payload = toBuilderPayload(
        formData,
        educationList,
        langList,
        skillList,
        certList,
        experienceList,
        projectList,
        referenceList,
      );

      const pdfBlob = await cvService.buildCV(user.id, payload);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setDownloadName(`${(getFormValue(formData, "name") || "careerics").replace(/\s+/g, "_")}_CV.pdf`);
      setIsFinished(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to build CV. Please try again.";
      setBuildError(message);
    } finally {
      setIsBuilding(false);
    }
  };

  // Sidebar Click: Expand details ONLY, don't change the form page
  const handleSidebarClick = (id: number) => {
    if (!isBuilding && !isFinished) {
      setExpandedStepId(id);
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

    window.setTimeout(() => {
      setIsOpeningDrive(false);
    }, 1400);
  };


// 1. Get the country object
const selectedCountry = Country.getAllCountries().find(
  (c) => c.name === formData['country']
);

// 2. Get the STATES 
const stateOptions = selectedCountry?.isoCode 
  ? (State.getStatesOfCountry(selectedCountry.isoCode) || []).map(state => state.name)
  : [];

  // Get all language names 
const ALL_LANGUAGES = ISO6391.getAllNames().sort(); 

// Proficiency levels 
const PROFICIENCY_LEVELS = [
  "Native", 
  "Professional Working", 
  "Full Professional", 
  "Limited Working", 
  "Elementary"
];
const [awardList, setAwardList] = useState<MultiRow[]>([{ id: Date.now() }]);

const [sidebarExpandedId, setSidebarExpandedId] = useState(1);

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
      
      <div className="scroll-area" style={{ 
        width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", paddingLeft: "10vw", 
        height: "100%", overflowY: "auto", scrollbarWidth: "none", paddingTop: "6vw", paddingBottom: "1vw" ,gap: "1vh"
      }}>

        {isBuilding ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", textAlign: "center" }}>
            <h2 style={{ color: "white", fontSize: "28px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Building your CV...</h2>
            <img src="/cv/cv.svg" alt="Building CV" style={{ width: "220px" }} />
          </div>
        ) : isFinished ? (
          <div style={{ padding: "20px", width: "100%" }}>
            <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Ready to see your CV?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", width: "100%" }}>
              <InterviewCard
                questionTitle=""
                videoBoxStyle={{ background: 'rgba(255, 255, 255, 0.41)', width: '100%', height: '300px', borderRadius: '40px' }}
                videoContent={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px', padding: '50px', height: '100%' }}>
                    <div style={{ width: '180px', height: '240px', backgroundColor: 'white', borderRadius: '25px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <button style={{ backgroundColor: '#d4ff47', color: '#1a1a1a', border: 'none', padding: '14px 40px', borderRadius: '12px', fontWeight: 'bold', width: '240px' }}>Download</button>
                    </div>
                  </div>
                } 
              />
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ color: "white", fontSize: "2.5rem", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>
              {cvSteps.find(s => s.id === expandedStepId)?.title}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>


              {expandedStepId === 1 && (
                <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                  { id: 'name', type: 'text', placeholder: 'Full Name' },
                  { id: 'row1', type: 'row', fields: [{ id: 'job', type: 'text', placeholder: 'Job Title' }, { id: 'port', type: 'text', placeholder: 'Portfolio (Optional)' }]},
                  { id: 'sum', type: 'textarea', placeholder: 'Summary' },
                  { id: 'loc-row', type: 'row', fields: [
                { 
                    id: 'country', 
                    type: 'select', 
                    placeholder: 'Country', 
                    options: Country.getAllCountries().map(c => c.name) 
                  },
                  { 
                    id: 'city', 
                    type: 'select', 
                    placeholder: 'State', 
                  options: stateOptions
                  }
                  ]},
                  { id: 'phone', type: 'text', placeholder: 'Phone Number' }, 
                  { id: 'email', type: 'email', placeholder: 'Email Address' }, 
                  { id: 'link', type: 'text', placeholder: 'Linkedin Profile' },
                ]} />
              )}

              {expandedStepId === 2 && (
                <>
                  {educationList.map((edu, index) => (
                    <div key={edu.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                      <span style={{ color: "white", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                        { id: `inst-${edu.id}`, type: 'text', placeholder: "Institution's name" },
                        { id: `r-${edu.id}`, type: 'row', fields: [{ id: `q-${edu.id}`, type: 'select', placeholder: 'Qualification', options: ["Bachelor's", "Master's", "PhD", "Diploma"] }, { id: `t-${edu.id}`, type: 'text', placeholder: 'Time period' }]},
                      ]} /></div>
                      <button onClick={() => removeEntry(edu.id, educationList, setEducationList)}><img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)', cursor: 'pointer' }} /></button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(educationList, setEducationList)} style={{ color: "#d4ff47", background: "none", border: "none" }}>+ Add another degree</button>
                </>
              )}

                {/* --- STEP 3: LANGUAGES & SKILLS --- */}
{expandedStepId === 3 && (
  <>
    {/* Languages Section */}
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ minWidth: "20px" }}></div> {/* Gap l-makan el numbering */}
      <div style={{ flex: 1 }}>
        {langList.map((lang, index) => (
          <div key={lang.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
            <div style={{ flex: 1 }}>
              <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `lrow-${lang.id}`, type: 'row', fields: [{ id: `ln-${lang.id}`, type: 'select', placeholder: 'Language', options: ALL_LANGUAGES }, { id: `lp-${lang.id}`, type: 'select', placeholder: 'Proficiency', options: PROFICIENCY_LEVELS }] }]} />
            </div>
            <button onClick={() => removeEntry(lang.id, langList, setLangList)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
            </button>
          </div>
        ))}
        <button onClick={() => addEntry(langList, setLangList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", marginBottom: "30px" }}>
          + Add language
        </button>
      </div>
    </div>

    {/* Skills Section */}
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ minWidth: "20px" }}></div>
      <div style={{ flex: 1 }}>
        {skillList.map((skill, index) => (
          <div key={skill.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
            <div style={{ flex: 1 }}>
              <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `srow-${skill.id}`, type: 'row', fields: [{ id: `sn-${skill.id}`, type: 'text', placeholder: 'Skill' }, { id: `sp-${skill.id}`, type: 'select', placeholder: 'Level', options: ["Beginner", "Intermediate", "Advanced", "Expert"] }] }]} />
            </div>
            <button onClick={() => removeEntry(skill.id, skillList, setSkillList)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
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

{/* --- STEP 4: CERTIFICATES & AWARDS --- */}
{expandedStepId === 4 && (
  <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
    
    {/* Certificates Section */}
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ minWidth: "20px" }}></div> {/* Spacer 3ashan el alignment */}
      <div style={{ flex: 1 }}>
        {certList.map((cert, index) => (
          <div key={cert.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
            <div style={{ flex: 1 }}>
              <DynamicCVForm 
                values={formData} 
                onChange={handleInputChange} 
                fields={[
                  { id: `cname-${cert.id}`, type: 'text', placeholder: 'Certificate Title' },
                  { id: `cd-${cert.id}`, type: 'row', fields: [{ id: `corg-${cert.id}`, type: 'text', placeholder: 'Organization' }, { id: `cdate-${cert.id}`, type: 'text', placeholder: 'Date' }] }
                ]} 
              />
            </div>
            <button onClick={() => removeEntry(cert.id, certList, setCertList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
              <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
            </button>
          </div>
        ))}
        <button onClick={() => addEntry(certList, setCertList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
          + Add certificate
        </button>
      </div>
    </div>


    {/* Awards Section */}
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ minWidth: "20px" }}></div>
      <div style={{ flex: 1 }}>
        {awardList.map((award, index) => (
          <div key={award.id} style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "flex-start" }}>
            <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
            <div style={{ flex: 1 }}>
              <DynamicCVForm 
                values={formData} 
                onChange={handleInputChange} 
                fields={[
                  { id: `aname-${award.id}`, type: 'text', placeholder: 'Award Title' },
                  { id: `ad-${award.id}`, type: 'row', fields: [{ id: `aorg-${award.id}`, type: 'text', placeholder: 'Issuer / Organization' }, { id: `adate-${award.id}`, type: 'text', placeholder: 'Year' }] }
                ]} 
              />
            </div>
            <button onClick={() => removeEntry(award.id, awardList, setAwardList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
              <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
            </button>
          </div>
        ))}
        <button onClick={() => addEntry(awardList, setAwardList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
          + Add award
        </button>
      </div>
    </div>

  </div>
)}

{/* --- STEP 5: EXPERIENCE --- */}
{expandedStepId === 5 && (
  <div style={{ display: "flex", gap: "20px" }}>
    <div style={{ minWidth: "20px" }}></div>
    <div style={{ flex: 1 }}>
      {experienceList.map((exp, index) => (
        <div key={exp.id} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
          <div style={{ flex: 1 }}>
            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `role-${exp.id}`, type: 'text', placeholder: "Role" }, { id: `row-${exp.id}`, type: 'row', fields: [{ id: `org-${exp.id}`, type: 'text', placeholder: 'Organization' }, { id: `tp-${exp.id}`, type: 'text', placeholder: 'Time Period' }] }, { id: `resp-${exp.id}`, type: 'textarea', placeholder: 'Responsibilities' }]} />
          </div>
          <button onClick={() => removeEntry(exp.id, experienceList, setExperienceList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
            <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
          </button>
        </div>
      ))}
      <button onClick={() => addEntry(experienceList, setExperienceList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
        + Add experience
      </button>
    </div>
  </div>
)}

{/* --- STEP 6: PROJECTS --- */}
{expandedStepId === 6 && (
  <div style={{ display: "flex", gap: "20px" }}>
    <div style={{ minWidth: "20px" }}></div>
    <div style={{ flex: 1 }}>
      {projectList.map((proj, index) => (
        <div key={proj.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
          <div style={{ flex: 1 }}>
            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `pname-${proj.id}`, type: 'text', placeholder: 'Project Name' }, { id: `prole-${proj.id}`, type: 'text', placeholder: 'Your Role' }, { id: `ptech-${proj.id}`, type: 'text', placeholder: 'Technologies Used' }, { id: `pdesc-${proj.id}`, type: 'textarea', placeholder: 'Description' }, { id: `pach-${proj.id}`, type: 'textarea', placeholder: 'Key Achievements' }]} />
          </div>
          <button onClick={() => removeEntry(proj.id, projectList, setProjectList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
            <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
          </button>
        </div>
      ))}
      <button onClick={() => addEntry(projectList, setProjectList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
        + Add project
      </button>
    </div>
  </div>
)}

{/* --- STEP 7: REFERENCES --- */}
{expandedStepId === 7 && (
  <div style={{ display: "flex", gap: "20px" }}>
    <div style={{ minWidth: "20px" }}></div>
    <div style={{ flex: 1 }}>
      {referenceList.map((ref, index) => (
        <div key={ref.id} style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <span style={{ color: "white", opacity: 0.7, marginTop: "12px", minWidth: "20px" }}>{index + 1}.</span>
          <div style={{ flex: 1 }}>
            <DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `ref-row1-${ref.id}`, type: 'row', fields: [{ id: `rn-${ref.id}`, type: 'text', placeholder: 'Name' }, { id: `rj-${ref.id}`, type: 'text', placeholder: 'Role' }] }, { id: `rc-${ref.id}`, type: 'text', placeholder: 'Organization' }, { id: `ref-row2-${ref.id}`, type: 'row', fields: [{ id: `re-${ref.id}`, type: 'text', placeholder: 'Email Address' }, { id: `rp-${ref.id}`, type: 'text', placeholder: 'Phone Number' }] }]} />
          </div>
          <button onClick={() => removeEntry(ref.id, referenceList, setReferenceList)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>
            <img src="/cv/trash 3.svg" style={{ width: '20px', filter: 'invert(0.7)' }} />
          </button>
        </div>
      ))}
      <button onClick={() => addEntry(referenceList, setReferenceList)} style={{ color: "#d4ff47", background: "none", border: "none", cursor: "pointer" }}>
        + Add reference
      </button>
    </div>
  </div>
)}
            </div>

            {/* NEXT BUTTON - RIGHT ALIGNED & SMALLER */}
            <div style={{ 
              marginTop: "3vh", 
              width: "100%", 
              justifyContent: "flex-end" 
            }}>
              <Button 
                onClick={() => {
                  if (expandedStepId === 7) {
                    if (isFormValid()) {
                      handleSubmit();
                    } else {
                      alert("Please complete all mandatory fields in all steps before building your CV.");
                    }
                  } else {
                    const next = expandedStepId + 1;
                    if (next > activeStepId) setActiveStepId(next);
                    setExpandedStepId(next);
                    setSidebarExpandedId(next);
                  }
                }}
                // El validation logic
                disabled={expandedStepId === 7 ? !isFormValid() : !isStepComplete()}
                style={{ 
                 width: "160px",
                  minWidth: "100px",
                  left: "40vw",
                  height: "45px",
                  borderRadius: "12px",
                  alignSelf: "flex-end",
                  backgroundColor: "#bfff4f",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "14px",
                  border: "none",
                  opacity: (expandedStepId === 7 ? isFormValid() : isStepComplete()) ? 1 : 0.5,
                  cursor: (expandedStepId === 7 ? isFormValid() : isStepComplete()) ? "pointer" : "not-allowed",
                  transition: "opacity 0.3s ease" // Dashan el shakl yeb2a an3am
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