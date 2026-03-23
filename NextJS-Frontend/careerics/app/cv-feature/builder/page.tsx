"use client";
import React, { useState, useEffect } from 'react';
import Interview from "@/components/ui/interview"; 
import DynamicCVForm, { FormField } from "@/components/ui/cv-form";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/ui/interview-card"; 

export default function CVBuilderPage() {
  const [activeStepId, setActiveStepId] = useState(1); // El Step elly zahra f el Form
  const [expandedStepId, setExpandedStepId] = useState<number>(1); // El Step elly expanded f el Sidebar
  const [isBuilding, setIsBuilding] = useState(false); 
  const [isFinished, setIsFinished] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    if (isBuilding) {
      const timer = setTimeout(() => {
        setIsBuilding(false);
        setIsFinished(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isBuilding]);

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
  const isStepComplete = () => {
    let fieldsToVerify: string[] = [];
    switch (activeStepId) {
      case 1: fieldsToVerify = ['name', 'job', 'port', 'sum', 'country', 'city', 'phone', 'email', 'link']; break;
      case 2: fieldsToVerify = educationList.flatMap(edu => [`inst-${edu.id}`, `q-${edu.id}`, `t-${edu.id}`, `d-${edu.id}`]); break;
      case 3: fieldsToVerify = [...langList.flatMap(l => [`ln-${l.id}`, `lp-${l.id}`]), ...skillList.flatMap(s => [`sn-${s.id}`, `sp-${s.id}`])]; break;
      case 4: fieldsToVerify = certList.flatMap(c => [`cname-${c.id}`, `corg-${c.id}`, `cdate-${c.id}`, `cdesc-${c.id}`]); break;
      case 5: fieldsToVerify = experienceList.flatMap(e => [`role-${e.id}`, `org-${e.id}`, `tp-${e.id}`, `tech-${e.id}`, `resp-${e.id}`, `ach-${e.id}`]); break;
      case 6: fieldsToVerify = projectList.flatMap(p => [`prole-${p.id}`, `ptech-${p.id}`, `pdesc-${p.id}`, `pach-${p.id}`]); break;
      case 7: fieldsToVerify = referenceList.flatMap(r => [`rn-${r.id}`, `rr-${r.id}`, `ro-${r.id}`, `rc-${r.id}`]); break;
    }
    return fieldsToVerify.every(id => formData[id] && formData[id].trim() !== "");
  };

  const addEntry = (list: any[], setList: Function) => setList([...list, { id: Date.now() }]);
  const removeEntry = (id: number, list: any[], setList: Function) => {
    if (list.length > 1) setList(list.filter(item => item.id !== id));
  };

  const handleSubmit = () => setIsBuilding(true);

  // Sidebar Click: Expand details ONLY, don't change the form page
  const handleSidebarClick = (id: number) => {
    if (!isBuilding && !isFinished) {
      setExpandedStepId(id);
    }
  };

  return (
    <Interview 
      questions={cvSteps}
      currentActiveId={expandedStepId} // Sidebar lights up based on expand logic
      unlockedStepId={activeStepId}    // Steps only unlock when form moves forward
      onQuestionClick={handleSidebarClick}
      closeIconSrc="/auth/close.svg" 
    >
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden", scrollbarWidth: "none" }}>
        <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "20px", paddingLeft:"50px", paddingTop:"5px", height: "100%", overflowY: "auto", scrollbarWidth: "none" }}>

          {isBuilding ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "28px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Our Model is building your CV,</h2>
              <p style={{ color: "white", fontSize: "20px", opacity: 0.8, marginBottom: "40px" }}>Give us a moment</p>
              <img src="/images/cv-building-abstract.png" alt="Building CV" style={{ width: "300px", height: "auto" }} />
            </div>
          ) : isFinished ? (
            <div style={{ padding: "20px", width: "100%" }}>
               <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Ready to see your CV?</h2>
               <div style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", width: "100%" }}>
                <InterviewCard
                  questionTitle=""
                  videoBoxStyle={{ background: 'rgba(255, 255, 255, 0.41)', width: '80%', height: '300px', borderRadius: '40px' }}
                  videoContent={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '30px', height: '100%' }}>
                    <div style={{ width: '180px', height: '240px', backgroundColor: 'white', borderRadius: '25px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <button style={{ backgroundColor: '#d4ff47', color: '#1a1a1a', border: 'none', padding: '14px 40px', borderRadius: '12px', fontWeight: 'bold', width: '240px' }}>Download</button>
                    </div>
                  </div>}
                />
                <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "center" }}>
                  <Button onClick={() => { setIsFinished(false); setActiveStepId(1); setFormData({}); setExpandedStepId(1); }} style={{ backgroundColor: "#bfff4f", color: "black", width: "140px", height: "36px", fontSize: "13px", borderRadius: "12px" }}>Build another CV</Button>
                  <Button style={{ backgroundColor: "#334155", color: "white", width: "140px", height: "36px", fontSize: "13px", borderRadius: "12px" }}>Go back to home</Button>
                </div>
               </div>
            </div>
          ) : (
            <>
              {activeStepId === 1 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "20px" }}>Personal Details</h2>
                  <DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                    { id: 'name', type: 'text', placeholder: 'Full Name' },
                    { id: 'row1', type: 'row', fields: [{ id: 'job', type: 'text', placeholder: 'Job Title' }, { id: 'port', type: 'text', placeholder: 'Portfolio' }]},
                    { id: 'sum', type: 'textarea', placeholder: 'Summary' },
                    { id: 'row2', type: 'row', fields: [{ id: 'country', type: 'select', placeholder: 'Country', options: ['Egypt', 'USA'] }, { id: 'city', type: 'select', placeholder: 'City', options: ['Cairo', 'NY'] }]},
                    { id: 'phone', type: 'text', placeholder: 'Phone Number' }, { id: 'email', type: 'email', placeholder: 'Email' }, { id: 'link', type: 'text', placeholder: 'Linkedin' },
                  ]} />
                </>
              )}

              {activeStepId === 2 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "20px" }}>Education</h2>
                  {educationList.map((edu, index) => (
                    <div key={edu.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "15px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                        { id: `inst-${edu.id}`, type: 'text', placeholder: "Institution's name" },
                        { id: `r-${edu.id}`, type: 'row', fields: [{ id: `q-${edu.id}`, type: 'select', placeholder: 'Qualification', options: ['Bachelors'] }, { id: `t-${edu.id}`, type: 'text', placeholder: 'Time period' }] },
                        { id: `d-${edu.id}`, type: 'text', placeholder: 'Details' }
                      ]} /></div>
                      <button onClick={() => removeEntry(edu.id, educationList, setEducationList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(educationList, setEducationList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another degree</button>
                </>
              )}

              {activeStepId === 3 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Languages & Skills</h2>
                  {langList.map((lang, index) => (
                    <div key={lang.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `lrow-${lang.id}`, type: 'row', fields: [{ id: `ln-${lang.id}`, type: 'select', placeholder: 'Language', options: ['English', 'Arabic'] }, { id: `lp-${lang.id}`, type: 'select', placeholder: 'Proficiency', options: ['Beginner', 'Fluent'] }] }]} /></div>
                      <button onClick={() => removeEntry(lang.id, langList, setLangList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <h3 style={{ color: "white", fontSize: "24px", marginTop: "20px" }}>Skills</h3>
                  {skillList.map((skill, index) => (
                    <div key={skill.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[{ id: `srow-${skill.id}`, type: 'row', fields: [{ id: `sn-${skill.id}`, type: 'text', placeholder: 'Skill' }, { id: `sp-${skill.id}`, type: 'select', placeholder: 'Proficiency', options: ['Expert', 'Intermediate'] }] }]} /></div>
                      <button onClick={() => removeEntry(skill.id, skillList, setSkillList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(skillList, setSkillList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another skill</button>
                </>
              )}

              {activeStepId === 4 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Certificates & Awards</h2>
                  {certList.map((cert, index) => (
                    <div key={cert.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "15px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                          { id: `cname-${cert.id}`, type: 'text', placeholder: 'Title' },
                          { id: `crow-${cert.id}`, type: 'row', fields: [{ id: `corg-${cert.id}`, type: 'text', placeholder: 'Organization' }, { id: `cdate-${cert.id}`, type: 'text', placeholder: 'Date' }]},
                          { id: `cdesc-${cert.id}`, type: 'textarea', placeholder: 'Description' }
                        ]} /></div>
                      <button onClick={() => removeEntry(cert.id, certList, setCertList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(certList, setCertList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another certificate</button>
                </>
              )}

              {activeStepId === 5 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Experiences</h2>
                  {experienceList.map((exp, index) => (
                    <div key={exp.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "15px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                          { id: `role-${exp.id}`, type: 'text', placeholder: "Role" },
                          { id: `row-${exp.id}`, type: 'row', fields: [{ id: `org-${exp.id}`, type: 'text', placeholder: 'Organization' }, { id: `tp-${exp.id}`, type: 'text', placeholder: 'Time Period' }] },
                          { id: `tech-${exp.id}`, type: 'text', placeholder: 'Technologies Used' },
                          { id: `resp-${exp.id}`, type: 'textarea', placeholder: 'Responsibilities' },
                          { id: `ach-${exp.id}`, type: 'textarea', placeholder: 'Achievements' }
                        ]} /></div>
                      <button onClick={() => removeEntry(exp.id, experienceList, setExperienceList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(experienceList, setExperienceList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another experience</button>
                </>
              )}

              {activeStepId === 6 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Projects</h2>
                  {projectList.map((proj, index) => (
                    <div key={proj.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "15px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                          { id: `prole-${proj.id}`, type: 'text', placeholder: "Role" },
                          { id: `ptech-${proj.id}`, type: 'text', placeholder: 'Technologies Used' },
                          { id: `pdesc-${proj.id}`, type: 'textarea', placeholder: 'Description' },
                          { id: `pach-${proj.id}`, type: 'textarea', placeholder: 'Achievements' }
                        ]} /></div>
                      <button onClick={() => removeEntry(proj.id, projectList, setProjectList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(projectList, setProjectList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another project</button>
                </>
              )}

              {activeStepId === 7 && (
                <>
                  <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>References</h2>
                  {referenceList.map((ref, index) => (
                    <div key={ref.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "15px" }}>
                      <span style={{ color: "white", marginTop: "12px", opacity: 0.7 }}>{index + 1}.</span>
                      <div style={{ flex: 1 }}><DynamicCVForm values={formData} onChange={handleInputChange} fields={[
                          { id: `ref-r1-${ref.id}`, type: 'row', fields: [{ id: `rn-${ref.id}`, type: 'text', placeholder: 'Name' }, { id: `rr-${ref.id}`, type: 'text', placeholder: 'Role' }] },
                          { id: `ro-${ref.id}`, type: 'text', placeholder: 'Organization' },
                          { id: `rc-${ref.id}`, type: 'text', placeholder: 'Contact Information' }
                        ]} /></div>
                      <button onClick={() => removeEntry(ref.id, referenceList, setReferenceList)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => addEntry(referenceList, setReferenceList)} style={{ color: "white", background: "none", border: "none", cursor: "pointer", textAlign: "left", paddingLeft: "35px" }}>+ Add another reference</button>
                </>
              )}
            </>
          )}
        </div>

        {!isBuilding && !isFinished && (
          <div style={{ position: "relative", bottom: "30px", right: "-300px", zIndex: 100 }}>
            <Button 
              onClick={() => {
                if (activeStepId === 7) {
                  handleSubmit();
                } else {
                  const nextStep = activeStepId + 1;
                  setActiveStepId(nextStep);    // Move to next Form
                  setExpandedStepId(nextStep); // Expand new Step in sidebar
                }
              }}
              disabled={!isStepComplete()}
              style={{ 
                width: "180px", height: "48px", borderRadius: "15px", 
                backgroundColor: "#bfff4f", color: "black", fontWeight: "bold",
                opacity: isStepComplete() ? 1 : 0.5,
                cursor: isStepComplete() ? "pointer" : "not-allowed"
              }}
            >
              {activeStepId === 7 ? "Build CV" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </Interview>
  );
}