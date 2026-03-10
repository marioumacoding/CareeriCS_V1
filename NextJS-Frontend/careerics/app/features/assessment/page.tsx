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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [hoveredTest, setHoveredTest] = useState<number | null>(null);

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
    marginBottom: 15,
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
    fontWeight: 700,
  }}
>
  Practice makes perfect...
</div>

<div
  style={{
    maxWidth: 1000,
    margin: "0 auto",
    padding: "30px 24px",
  }}
>

<h1
  style={{
    fontSize: 30,
    fontFamily: "var(--font-nova-square)",
    marginBottom: 20,
  }}
>
  Skill Assessment
</h1>

{/* TOP CARD */}

<div
  style={{
    background: "#1C427B",
    borderRadius: 14,
    padding: 20,
    color: "#fff",
    marginBottom: 20,
    transition: "0.2s",
  }}
>

<div
  style={{
    marginBottom: 15,
    fontSize: 20,
    fontFamily: "var(--font-nova-square)",
  }}
>
  Skills you are currently learning
</div>

<div style={{ display: "flex", alignItems: "center", gap: 10 }}>

{["HTML","CSS","UX Fundamentals","JavaScript","Figma Basics"].map((skill,i)=>(
<div
  key={i}
  style={{
    padding:"8px 16px",
    borderRadius:8,
    background:"#B9C6E3",
    color:"#000",
    fontSize:13,
    cursor:"pointer",
    transition:"0.2s",
  }}
>
{skill}
</div>
))}

<img
  src="/auth/Back Arrow.svg"
  style={{
    marginLeft:"auto",
    rotate:"180deg",
    width:18,
    cursor:"pointer",
  }}
/>

</div>
</div>

{/* BOTTOM CARDS */}

<div style={{display:"flex",gap:16}}>

{/* MORE SKILLS */}

<div
  onMouseEnter={()=>setHoveredCard(1)}
  onMouseLeave={()=>setHoveredCard(null)}
  style={{
    flex:2,
    background:"#142143",
    borderRadius:14,
    padding:16,
    color:"#fff",
    display:"flex",
    flexDirection:"column",
    transform: hoveredCard===1 ? "translateY(-5px)" : "translateY(0)",
    boxShadow: hoveredCard===1 ? "0 8px 25px rgba(0,0,0,0.4)" : "none",
    transition:"0.2s"
  }}
>

<div style={{marginBottom:10}}>More skills to test</div>

<div style={{display:"flex",flexWrap:"wrap",gap:14}}>

{[
"Problem Solving","C++","OOP Principles","C++","OOP Principles",
"Problem Solving","OOP Principles","C++","Problem Solving"
].map((skill,i)=>(
<div
key={i}
onMouseEnter={()=>setHoveredSkill(i)}
onMouseLeave={()=>setHoveredSkill(null)}
style={{
background: hoveredSkill===i ? "#2A5BA8" : "#1C427B",
padding:"15px 25px",
borderRadius:8,
fontSize:14,
cursor:"pointer",
transform: hoveredSkill===i ? "scale(1.05)" : "scale(1)",
transition:"0.15s"
}}
>
{skill}
</div>
))}

</div>

<img
src="/auth/Back Arrow.svg"
style={{
width:16,
rotate:"270deg",
marginTop:"auto",
alignSelf:"flex-end",
cursor:"pointer"
}}
/>

</div>

{/* PAST TESTS */}

<div
onMouseEnter={()=>setHoveredCard(2)}
onMouseLeave={()=>setHoveredCard(null)}
style={{
flex:1,
background:"#142143",
borderRadius:14,
padding:16,
color:"#fff",
display:"flex",
flexDirection:"column",
transform: hoveredCard===2 ? "translateY(-5px)" : "translateY(0)",
boxShadow: hoveredCard===2 ? "0 8px 25px rgba(0,0,0,0.4)" : "none",
transition:"0.2s"
}}
>

<div style={{marginBottom:10}}>Past Tests</div>

{[
{name:"Test-005",score:"80%"},
{name:"Test-004",score:"50%"},
{name:"Test-003",score:"70%"},
].map((test,i)=>(

<div
key={i}
onMouseEnter={()=>setHoveredTest(i)}
onMouseLeave={()=>setHoveredTest(null)}
style={{
background: hoveredTest===i ? "#D8E2F5" : "#E6ECF7",
borderRadius:8,
padding:8,
marginBottom:8,
display:"flex",
justifyContent:"space-between",
alignItems:"center",
cursor:"pointer",
transform: hoveredTest===i ? "scale(1.02)" : "scale(1)",
transition:"0.15s"
}}
>

<div>
<div style={{fontSize:12,color:"#000"}}>{test.name}</div>
<div style={{fontSize:10,color:"#666"}}>On UX Fundamentals</div>
</div>

<div
style={{
width:34,
height:34,
borderRadius:"50%",
border:"3px solid #B8EF46",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:10,
color:"#000"
}}
>
{test.score}
</div>

</div>

))}

<img
src="/auth/Back Arrow.svg"
style={{
width:16,
rotate:"270deg",
marginTop:"auto",
alignSelf:"flex-end",
cursor:"pointer"
}}
/>

</div>

</div>

</div>
</main>
</div>
);
}