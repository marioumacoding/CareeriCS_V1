"use client";
import React, { useRef } from 'react';
import Image from 'next/image';

// --- Card 1: Your Careers (With Horizontal Scroll Logic) ---
export const CareersCard = ({ careers, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
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
        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          style={{ 
            display: "flex", 
            gap: "10px", 
            height: "100%", 
            alignItems: "center", 
            overflowX: "auto", 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            flex: 1,
            scrollBehavior: 'smooth'
          }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {careers.map((career: any) => (
            <div key={career.title} style={{ 
              backgroundColor: "#142143", borderRadius: "15px", padding: "10px 15px", 
              flex: "0 0 160px", 
              height: "90%", display: "flex", flexDirection: "column", 
              alignItems: "center", justifyContent: "space-evenly", textAlign: "center"
            }}>
              <div style={{ position: 'relative', width: '45px', height: '45px' }}>
                <Image src="/landing/Rectangle 98.svg" alt="Career Icon" fill style={{ objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: "25px", textAlign: "center", fontWeight: '400', wordWrap: 'break-word' }}>{career.title}</div>
              <p style={{ fontSize: "9px", opacity: 0.7, margin: "0", lineHeight: "1.2", maxWidth: "90%" }}>
                {career.desc}
              </p>
              <button style={{ 
                backgroundColor: "#E6FFB2", color: "black", border: "none", padding: "6px 0", 
                borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "bold", width: "85%" 
              }}>Continue</button>
            </div>
          ))}
        </div>

        {/* Sidebar Arrow - Now Scrolls Right on Click */}
        <div 
          onClick={scrollRight}
          style={{ 
            cursor: "pointer", 
            width: "30px", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            transform: "rotate(180deg)"
          }}>
          <Image src="/auth/Back Arrow.svg" alt="Next" width={18} height={30} />
        </div>
      </div>
    </div>
  );
};

// --- Card 2: Recent Activity (With Vertical Scroll Logic) ---
export const RecentActivityCard = ({ activities, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#142143", borderRadius: "10px", padding: "20px", color: "white", 
      display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", ...style 
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "15px", textAlign: "center", fontFamily: 'var(--font-nova-square)' }}>Recent Activity</h3>
      
      <div 
        ref={scrollRef}
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px", 
          overflowY: "auto", 
          scrollbarWidth: "none", 
          flexGrow: 1,
          scrollBehavior: 'smooth'
        }}>
        {activities.map((act: any, i: number) => (
          <div key={i} style={{ 
            backgroundColor: "#c1cbe6", borderRadius: "12px", padding: "10px 15px", color: "black",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{act.id}</div>
              <div style={{ fontSize: "9px", opacity: 0.7 }}>{act.date || `On ${act.topic}`}</div>
            </div>
            {act.score ? (
              <div style={{ width: "25px", height: "25px", borderRadius: "50%", border: "2px solid #1C427B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "bold" }}>{act.score}%</div>
            ) : (
              <div style={{ position: 'relative', width: "20px", height: "20px", cursor: "pointer" }}>
                 <Image src="/interview/download.svg" alt="Download" fill style={{ objectFit: 'contain' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll Down Arrow - Now Scrolls Down on Click */}
      <div 
        onClick={scrollDown}
        style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", cursor: "pointer" , transform: "rotate(270deg)"}}
      >
        <Image src="/auth/Back Arrow.svg" alt="Scroll Down" width={16} height={16} />
      </div>
    </div>
  );
};

// --- Card 3 & 4 (Keep them as is) ---
export const JourneyProgressCard = ({ percentage, style }: any) => (
  <div style={{ 
    backgroundColor: "#142143", borderRadius: "10px", padding: "20px", color: "white", 
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", boxSizing: "border-box", ...style 
  }}>
    <h3 style={{ fontSize: "18px", marginBottom: "10px", alignSelf: "flex-start", fontFamily: 'var(--font-nova-square)' }}>Journey Progress</h3>
    <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
       <div style={{ fontSize: "20px", fontWeight: "bold", zIndex: 1 }}>{percentage}%</div>
       <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/landing/Union.svg" alt="Progress Path" fill style={{ objectFit: 'contain', opacity: 0.8 }} />
       </div>
    </div>
  </div>
);

export const NextPhaseCard = ({ style }: any) => (
  <div style={{ 
    backgroundColor: "#142143", borderRadius: "10px", padding: "25px", color: "white", 
    display: "flex", justifyContent: "space-between", height: "100%", boxSizing: "border-box",
    position: "relative", overflow: "hidden", ...style 
  }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      <Image src="/landing/Vector.svg" alt="Phase Path" fill style={{ objectFit: 'contain', objectPosition: 'right top' }} />
    </div>
    <div style={{ position: "absolute", top: '55%', right: '8%', width: "30px", height: "30px", zIndex: 1, pointerEvents: "none" }}>
      <Image src="/landing/Ellipse 4.svg" alt="Status Dot" width={30} height={30} />
    </div>
    <div style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: "5px", zIndex: 2 }}>
      <h3 style={{ fontSize: "20px", marginBottom: "10px", fontFamily: 'var(--font-nova-square)' }}>Next Phase</h3>
      <p style={{ fontSize: "18px", opacity: 0.7, lineHeight: "1.4", margin: 0 }}>
        bla bla bla bla bla bla bla<br/>
        bla bla bla bla bla bla bla
      </p>
    </div>
    <div style={{ width: "40%", borderLeft: "1px solid rgb(255, 255, 255)", paddingLeft: "25px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 2 }}>
      <div style={{ color: "#4CC9F0", fontSize: "28px", fontWeight: "bold" }}>04</div>
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>Trial Round</div>
      <div style={{ fontSize: "12px", opacity: 0.6 }}>Interview Preparation</div>
    </div>
  </div>
);