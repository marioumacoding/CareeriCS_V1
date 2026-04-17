"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- 1. Helper: CircleScoreSVG (Dah elly hay-khaly el shakl shabah el Past Tests) ---
const CircleScoreSVG = ({ score, size = 30 }: { score: number, size?: number }) => {
  const radius = (size / 2) - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ 
      position: "relative", width: `${size + 10}px`, height: `${size + 10}px`, 
      backgroundColor: "#1A2E5A", borderRadius: "10px", 
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="rgba(212, 255, 71, 0.1)" strokeWidth="2.5"
        />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="#d4ff47" strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span style={{ 
        position: "absolute", color: "white", fontSize: "8px", 
        fontWeight: "bold", fontFamily: 'var(--font-nova-square)' 
      }}>
        {score}%
      </span>
    </div>
  );
};

// --- Card 1: CareersCard (Keep as is) ---
export const CareersCard = ({ careers, style }: any) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handleContinue = (career: any) => {
    if (!career?.href) {
      return;
    }

    router.push(career.href);
  };

  return (
    <div style={{ 
      backgroundColor: "#1C427B", borderRadius: "10px", padding: "15px 20px", color: "white", 
      display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", ...style 
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "2px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Your Careers
      </h3>
      <div style={{ display: "flex", alignItems: "center", height: "100%", gap: "10px" }}>
        <div ref={scrollRef} style={{ display: "flex", gap: "10px", height: "100%", alignItems: "center", overflowX: "auto", scrollbarWidth: "none", flex: 1, scrollBehavior: 'smooth' }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {careers.map((career: any) => (
            <div key={career.title} style={{ backgroundColor: "#142143", borderRadius: "15px", padding: "10px 15px", flex: "0 0 160px", height: "90%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", textAlign: "center" }}>
              <div style={{ position: 'relative', width: '70px', height: '45px' }}><Image src="/landing/Rectangle.svg" alt="Icon" fill style={{ objectFit: 'contain' }} /></div>
              <div style={{ fontSize: "25px", textAlign: "center", fontWeight: '400', wordWrap: 'break-word' }}>{career.title}</div>
              <p style={{ fontSize: "12px", opacity: 0.7, margin: "0", lineHeight: "1", maxWidth: "100%" }}>{career.desc}</p>
              <button
                onClick={() => handleContinue(career)}
                disabled={!career?.href}
                style={{
                  backgroundColor: "#E6FFB2",
                  color: "black",
                  border: "none",
                  padding: "6px 0",
                  borderRadius: "6px",
                  cursor: career?.href ? "pointer" : "default",
                  fontSize: "11px",
                  fontWeight: "bold",
                  width: "85%",
                  opacity: career?.href ? 1 : 0.65,
                }}
              >
                {career?.buttonLabel || "Continue"}
              </button>
            </div>
          ))}
        </div>
        <div onClick={scrollRight} style={{ cursor: "pointer", width: "30px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)" }}><Image src="/auth/Back Arrow.svg" alt="Next" width={18} height={30} /></div>
      </div>
    </div>
  );
};

// --- Card 2: Recent Activity (UPDATED SECTION ONLY) ---
export const RecentActivityCard = ({ activities, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollDown = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#142143", borderRadius: "10px", padding: "20px", color: "white", 
      display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", ...style 
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "15px", textAlign: "center", fontFamily: 'var(--font-nova-square)' }}>Recent Activity</h3>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", scrollbarWidth: "none", flexGrow: 1, scrollBehavior: 'smooth' }}>
        {activities.map((act: any, i: number) => (
          <div key={i} style={{ backgroundColor: "#c1cbe6", borderRadius: "12px", padding: "10px 15px", color: "black", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{act.id}</div>
              <div style={{ fontSize: "9px", opacity: 0.7 }}>{act.date || `On ${act.topic}`}</div>
            </div>

            {/* HENA EL TAGHYER: SVG Circle badal el border div */}
            {act.score !== undefined ? (
              <CircleScoreSVG score={act.score} size={30} />
            ) : (
              <div style={{ position: 'relative', width: "20px", height: "20px", cursor: "pointer" }}>
                 <Image src="/interview/download.svg" alt="Download" fill style={{ objectFit: 'contain' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div onClick={scrollDown} style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", cursor: "pointer", transform: "rotate(270deg)" }}><Image src="/auth/Back Arrow.svg" alt="Scroll" width={16} height={16} /></div>
    </div>
  );
};

// --- Card 3: Journey Progress (Keep as is) ---
export const JourneyProgressCard = ({ percentage = 10, style }: any) => {
  const size = 110;
  const radius = 45;
  const center = size / 2;
  const smallRadius = 9;
  const numberOfCircles = 12;
  const currentPercentage = Math.min(100, Math.max(0, percentage));
  const activeCircles = Math.round((currentPercentage / 100) * numberOfCircles);

  const generateCircles = () => {
    let circles = [];
    const angleStep = 360 / numberOfCircles;
    for (let i = 0; i < numberOfCircles; i++) {
      const angle = (i * angleStep - 180) * (Math.PI / 180); 
      const cx = center + radius * Math.cos(angle);
      const cy = center + radius * Math.sin(angle);
      let fill = i < activeCircles ? "#C5E76F" : "#2E3C56";
      circles.push(<circle key={i} cx={cx} cy={cy} r={smallRadius} fill={fill} />);
    }
    return circles;
  };

  return (
    <div style={{ backgroundColor: "#142143", borderRadius: "10px", padding: "20px", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", boxSizing: "border-box", ...style }}>
      <h3 style={{ fontSize: "18px", marginBottom: "10px", alignSelf: "flex-start", fontFamily: 'var(--font-nova-square)' }}>Journey Progress</h3>
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "white", zIndex: 1, fontFamily: 'var(--font-nova-square)' }}>{currentPercentage}%</div>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0 }}>{generateCircles()}</svg>
      </div>
    </div>
  );
};

// --- Card 4: NextPhaseCard (Keep as is) ---
export const NextPhaseCard = ({ style }: any) => (
  <div style={{ backgroundColor: "#142143", borderRadius: "10px", padding: "25px", color: "white", display: "flex", justifyContent: "space-between", height: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", pointerEvents: "none", zIndex: 0 }}><Image src="/landing/Vector.svg" alt="Path" fill style={{ objectFit: 'contain', objectPosition: 'right top' }} /></div>
    <div style={{ position: "absolute", top: '55%', right: '8%', width: "30px", height: "30px", zIndex: 1, pointerEvents: "none" }}><Image src="/landing/Ellipse 4.svg" alt="Dot" width={30} height={30} /></div>
    <div style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: "5px", zIndex: 2 }}><h3 style={{ fontSize: "20px", marginBottom: "10px", fontFamily: 'var(--font-nova-square)' }}>Next Phase</h3><p style={{ fontSize: "18px", opacity: 0.7, lineHeight: "1.4", margin: 0 }}>bla bla bla bla bla bla bla<br/>bla bla bla bla bla bla bla</p></div>
    <div style={{ width: "40%", borderLeft: "1px solid rgb(255, 255, 255)", paddingLeft: "25px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 2 }}><div style={{ color: "#4CC9F0", fontSize: "28px", fontWeight: "bold" }}>04</div><div style={{ fontSize: "18px", fontWeight: "bold" }}>Trial Round</div><div style={{ fontSize: "12px", opacity: 0.6 }}>Interview Preparation</div></div>
  </div>
);