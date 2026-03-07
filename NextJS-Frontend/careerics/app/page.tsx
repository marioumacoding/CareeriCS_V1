"use client";
import React from "react";

export default function LandingPage() {
  // Updated with your provided paths and corresponding text content
  const featureImages = [
    { 
      id: "quiz", 
      area: "quiz", 
      src: "/landing/Career Quiz Card.svg",
      title: "Career Quiz",
      desc: "Career confusion? We don't know her. Discover where you'll thrive with our 5-minute Quiz."
    },
    { 
      id: "cvb", 
      area: "cvb", 
      src: "/landing/CV Builder Card.svg",
      title: "CV Builder",
      desc: "Never had a CV before and not sure how to make one? Build a professional, ATS-friendly CV in minutes. No guesswork—Just results."
    },
    { 
      id: "cve", 
      area: "cve", 
      src: "/landing/CV Enhancer Card.svg",
      title: "CV Enhancer",
      desc: "Already have a CV but it's not getting you anywhere? We'll optimize it to get you recruiters attention."
    },
    { 
      id: "rdm", 
      area: "rdm", 
      src: "/landing/Roadmap Card.svg",
      title: "Roadmap Generation",
      desc: "Confused about your next steps? Get a clear map towards your dream role. We'll tell you exactly what to learn and how."
    },
    { 
      id: "crs", 
      area: "crs", 
      src: "/landing/Courses Card.svg",
      title: "Courses",
      desc: "Learn skills that companies are actually hiring for."
    },
    { 
      id: "skl", 
      area: "skl", 
      src: "/landing/Skill Assessment Card.svg",
      title: "Skill Assessment",
      desc: "Find out where you truly stand. Identify strengths, uncover gaps, and know what to improve. Make progress with precision."
    },
    { 
      id: "hr", 
      area: "hr", 
      src: "/landing/Interview Card.svg", // Reusing path as per your list
      title: "HR Interview",
      desc: "Practice smart answers to the impossible question."
    },
    { 
      id: "tech", 
      area: "tech", 
      src: "/landing/Interview Card.svg", // Reusing path as per your list
      title: "Tech Interview",
      desc: "Explain your thinking clearly even under pressure."
    },
    { 
      id: "jobs", 
      area: "jobs", 
      src: "/landing/Job Applicator Card.svg",
      title: "Job Applicator",
      desc: "Job hunting shouldn't feel like a full time job. Careeri CS will look for you and give you only the best matches saving you the hustle."
    },
  ];

  return (
    <div style={{ 
      backgroundColor: "#000", 
      color: "#fff", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif", 
      overflowX: "hidden" 
    }}>
      
      {/* 1. NAVIGATION BAR */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "30px 6%", 
        maxWidth: "1400px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 30
      }}>
        <div style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-1px" }}>
          CareeriCS
        </div>
        <nav style={{ display: "flex", gap: "45px", fontSize: "16px", fontWeight: "500" }}>
          <a href="#" style={{ color: "#fff", textDecoration: "none", opacity: 0.8 }}>Home</a>
          <a href="#" style={{ color: "#fff", textDecoration: "none", opacity: 0.8 }}>Toolkit</a>
          <a href="#" style={{ color: "#fff", textDecoration: "none", opacity: 0.8 }}>Journey Flow</a>
        </nav>
        <button style={{ 
          padding: "10px 35px", 
          borderRadius: "20px", 
          border: "none", 
          fontWeight: "bold", 
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#000",
          transition: "0.2s"
        }}>
          Sign In
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ 
        height: "90vh", 
        display: "flex", 
        alignItems: "flex-end", 
        padding: "0 8% 10vh 8%", 
        position: "relative",
        maxWidth: "1600px",
        margin: "0 auto"
      }}>
        
        <h1 style={{ 
          position: "absolute",
          top: "5%", 
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(50px, 20vw, 150px)", 
          margin: "0", 
          color: "rgba(255, 255, 255, 0.15)", 
          zIndex: 1,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          fontWeight: "900",
          letterSpacing: "15px",
          fontFamily: "var(--font-nova-square)",
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          WebkitBackgroundClip: 'text', 
        }}>
          CareeriCS
        </h1>

        <div style={{ 
          flex: 1.5, 
          zIndex: 10, 
          position: "relative",
          marginBottom: "20px" 
        }}>
          <p style={{ 
            maxWidth: "380px", 
            fontSize: "18px", 
            lineHeight: "1.6", 
            color: "#fff", 
            marginBottom: "35px",
            opacity: 0.9
          }}>
            Not sure where to go or how to start? Just graduated and you feel lost? CareeriCS got your back.
          </p>
          
          <button style={{ 
            backgroundColor: "#B8EF46", 
            color: "#000", 
            padding: "18px 55px", 
            border: "none", 
            borderRadius: "30px", 
            fontWeight: "bold", 
            cursor: "pointer",
            fontSize: "20px",
          }}>
            Register
          </button>
        </div>

        <div style={{ 
          flex: 4, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-end", 
          position: "relative",
          height: "100%",
          marginRight: "50px"
        }}>
          <div style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(0,80,255,0.15) 0%, rgba(0,0,0,0) 70%)",
            bottom: "0",
            zIndex: 2
          }} />

          <img 
            src="/landing/Robot+blue.svg" 
            alt="AI Robot" 
            style={{ 
              width: "auto", 
              height: "100%", 
              maxWidth: "1100px", 
              position: "relative",
              zIndex: 5,
              objectFit: "contain"
            }} 
          />

          <div style={{
            position: "absolute",
            right: "-5%",
            bottom: "40%", 
            zIndex: 10,
            display: "flex",
            alignItems: "center"
          }}>
            <div style={{ width: "100px", height: "1px", backgroundColor: "rgba(255,255,255,0.4)", marginRight: "15px" }} />
            <span style={{ 
                fontSize: "14px", 
                letterSpacing: "3px", 
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                fontWeight: "600",
                color: "rgba(255,255,255,0.7)"
            }}>Your Guide To Success</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID WITH TEXT OVERLAYS */}
      <section style={{ padding: "120px 5%", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "80px", fontWeight: "500" }}>
          Choose from our various features
        </h2>

        <div style={{
          display: "grid",
          maxWidth: "1250px",
          margin: "0 auto",
          gap: "24px",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "200px",
          gridTemplateAreas: `
            "quiz quiz cvb cve"
            "rdm crs cvb cve"
            "rdm skl hr jobs"
            "rdm skl tech jobs"
          `
        }}>
          {featureImages.map((img) => (
            <div 
              key={img.id} 
              style={{ 
                gridArea: img.area, 
                borderRadius: "24px", 
                overflow: "hidden", 
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative", // Needed for absolute text overlay
                textAlign: "left"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.borderColor = "rgba(184, 239, 70, 0.5)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Card Image Base */}
              <img 
                src={img.src} 
                alt={img.id}
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />

              {/* Text Content Overlay */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                padding: "25px 30px",
                pointerEvents: "none", // Allows clicks to pass through to the card container
                display: "flex",
                flexDirection: "column",
                zIndex: 2
              }}>
                <h3 style={{ 
                  fontSize: "20px", 
                  fontWeight: "700", 
                  marginBottom: "10px",
                  fontFamily: "var(--font-nova-square)" 
                }}>
                  {img.title}
                </h3>
                <p style={{ 
                  fontSize: "13px", 
                  lineHeight: "1.5", 
                  opacity: 0.8,
                  maxWidth: "90%",
                  textAlign: "left", 
                }}>
                  {img.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ROADMAP SECTION */}
      <section style={{ padding: "100px 5% 150px 5%", textAlign: "center" }}>
        <h3 style={{ fontSize: "28px", marginBottom: "70px", fontWeight: "400", opacity: 0.8 }}>
          Follow your personalized career journey
        </h3>
        <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
          <img 
            src="/landing/Journey+text.svg" 
            alt="Career Journey Roadmap" 
            style={{ width: "100%", height: "auto" }} 
          />
        </div>
      </section>
    </div>
  );
}