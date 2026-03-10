"use client";
import React, { useState } from "react";

export default function Page() {

  const navItems = [
    { text: "Roadmap", image: "/sidebar/Roadmap.svg" },
    { text: "Courses", image: "/sidebar/Course.svg" },
    { text: "Skill Assessment", image: "/sidebar/skill.svg" },
    { text: "CV Crafting", image: "/sidebar/CV.svg" },
    { text: "Mock Interview", image: "/sidebar/Interview.svg" },
    { text: "Job Applications", image: "/sidebar/Job.svg" },
  ];

  const [hoveredNav, setHoveredNav] = useState<number | string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [hoveredDownload, setHoveredDownload] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#000",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >

{/* SIDEBAR */}

<aside
  style={{
    width: "220px",
    backgroundColor: "#000",
    padding: "45px 16px",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  }}
>

<div
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom:10,
    marginLeft: "1rem",
    fontFamily: "var(--font-nova-square)",
  }}
>
  CareeriCS
</div>

{/* SEARCH */}

<div style={{ marginBottom: 20, position: "relative" }}>
  <input
    type="text"
    placeholder="search"
    style={{
      width: "80%",
      padding: "10px 14px",
      backgroundColor: "transparent",
      border: "2px solid #666",
      borderRadius: 20,
      color: "#fff",
      fontSize: 14,
    }}
  />

  <span
    style={{
      position: "absolute",
      right: 30,
      top: 13,
      color: "#666",
    }}
  >
    🔍
  </span>
</div>

<nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>

  <div
    style={{
      padding: "12px 16px",
      borderRadius: 8,
      fontSize: 14,
      color: hoveredNav === "home" ? "#000" : "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      backgroundColor: hoveredNav === "home" ? "#B8EF46" : "transparent",
    }}
    onMouseEnter={() => setHoveredNav("home")}
    onMouseLeave={() => setHoveredNav(null)}
  >
    <img src="/sidebar/Home.svg" style={{ width: 20 }} />
    Home
  </div>

  {navItems.map((item, i) => (
    <div
      key={i}
      style={{
        padding: "12px 16px",
        color: hoveredNav === i ? "#000" : "#ACB2D2",
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: hoveredNav === i ? "#B8EF46" : "transparent",
        borderRadius: 6,
      }}
      onMouseEnter={() => setHoveredNav(i)}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <img src={item.image} style={{ width: 20 }} />
      {item.text}
    </div>
  ))}

</nav>

{/* PROFILE */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTop: "1px solid #333",
  }}
>
  <div
    style={{
      width: 40,
      height: 40,
      backgroundColor: "#4a5faa",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      color: "#CCFF00",
    }}
  >
    J
  </div>

  <div>
    <div style={{ fontWeight: "bold", fontSize: 14 }}>John Doe</div>
    <div style={{ fontSize: 12, color: "#999" }}>Student</div>
  </div>
</div>

</aside>

{/* MAIN */}

<main
  style={{
    flex: 1,
    height: "calc(100vh - 40px)",
    margin: "20px",
    position: "relative",
    backgroundImage: "url('/interview/Page bg.svg')",
    backgroundSize: "cover",
    borderRadius: 24,
  }}
>

<div
  style={{
    position: "absolute",
    top: 0,
    right: 0,
    width: "55%",
    padding: 10,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    fontFamily: "var(--font-nova-square)",  
    fontWeight: 300,
  }}
>
  Practice makes perfect...
</div>

<div
  style={{
    maxWidth: 1000,
    margin: "0 auto",
    padding: "10px 10px",
    display: "flex",
    flexDirection: "column",
  }}
>

<h1
  style={{
    fontSize: 30,
    fontFamily: "var(--font-nova-square)",
    marginBottom: 15,
    fontWeight: "400",
  }}
>
  Interview Mock-ups
</h1>

{/* CARD GRID */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "300px 300px 300px",
    justifyContent: "center",
    gap: 20,
  }}
>

{/* Behavioral Card */}

<div
  style={{
    background: "#15254B",
    borderRadius: 20,
    padding: 30,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  }}
>

<div style={{ display: "flex", alignItems: "center", gap: 16 }}>

<img src="/interview/brain.svg" style={{ width: 55 }} />

<div style={{ width: 1.5, height: 100, background: "#6B7AA6" }} />

<div style={{ fontSize: 20, fontFamily: "var(--font-nova-square)" }}>
Behavioral <br /> Mock Interview
</div>

</div>

<p style={{ fontSize: 13, color: "#ACB2D2", marginTop: 22 }}>
Practice answering the most common interview questions and improve how
you present yourself and your skills.
</p>

<div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
<button
style={{
background: hoveredButton === 1 ? "#EEFFCB" : "#B8EF46",
border: "none",
borderRadius: 10,
padding: "10px 50px",
fontSize: 15,
fontWeight: 600,
cursor: "pointer",
transform: hoveredButton === 1 ? "scale(1.05)" : "scale(1)",
transition: "all 0.2s ease"
}}
onMouseEnter={() => setHoveredButton(1)}
onMouseLeave={() => setHoveredButton(null)}
>
Start
</button>
</div>

</div>

{/* Technical Card */}

<div
style={{
background: "#15254B",
borderRadius: 20,
padding: 30,
color: "#fff"
}}
>

<div style={{ display: "flex", alignItems: "center", gap: 16 }}>

<img src="/interview/brain (1).svg" style={{ width: 55 }} />

<div style={{ width: 1.5, height: 100, background: "#6B7AA6" }} />

<div style={{ fontSize: 20, fontFamily: "var(--font-nova-square)" }}>
Technical <br /> Mock Interview
</div>

</div>

<p style={{ fontSize: 13, color: "#ACB2D2", marginTop: 22 }}>
Test your technical knowledge and problem solving skills with questions
designed to mirror real interviews.
</p>

<div style={{ display: "flex", justifyContent: "center", marginTop: 32   }}>
<button
style={{
background: hoveredButton === 2 ? "#EEFFCB" : "#B8EF46",
border: "none",
borderRadius: 10,
padding: "10px 50px",
fontSize: 15,
fontWeight: 600,
cursor: "pointer",
transform: hoveredButton === 2 ? "scale(1.05)" : "scale(1)",
transition: "all 0.2s ease"
}}
onMouseEnter={() => setHoveredButton(2)}
onMouseLeave={() => setHoveredButton(null)}
>
Start
</button>
</div>

</div>

{/* Archive */}

<div
style={{
background: "#15254B",
borderRadius: 16,
padding: 20
}}
>

<div style={{ textAlign: "center", marginBottom: 20, color: "#fff", fontSize: 20, fontFamily: "var(--font-nova-square)" }}>
Interviews Archive
</div>

{["Tech-003","Tech-002","Tech-001"].map((test,i)=>(
<div
key={i}
style={{
background:"#D7DCEB",
borderRadius:10,
padding:"18px 15px",
marginBottom:10,
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>
<div>{test}</div>
<div style={{fontSize:11,color:"#555"}}>
created on 5/3/2026
</div>
</div>

<img
src="/interview/download.svg"
style={{
width:16,
cursor:"pointer",
opacity:hoveredDownload===i?0.7:1,
transform:hoveredDownload===i?"scale(1.2)":"scale(1)",
transition:"all 0.2s ease"
}}
onMouseEnter={()=>setHoveredDownload(i)}
onMouseLeave={()=>setHoveredDownload(null)}
/>



</div>
))}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 8,
    cursor: "pointer",

  }}
>
  <img src="/auth/Back Arrow.svg" style={{ width: 20, rotate: "270deg" }} />
</div>
</div>

</div>

{/* TIP */}

<div
style={{
marginTop:25,
background:"#284B87",
borderRadius:14,
padding:20,
display:"flex",
alignItems:"center",
gap:18,
color:"#fff"
}}
>

<img src="/interview/Interview Tip.svg" style={{width:40}}/>

<div>
<div style={{fontSize:16,marginBottom:4}}>
Tip of the day
</div>

<div style={{fontSize:13,color:"#C8D1F0"}}>
Research the company and interviewers before your interview so you get
a better understanding of the company’s goals and show how you fit.
</div>

</div>

</div>

</div>
</main>
</div>
);
}
