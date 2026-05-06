import React, { useRef } from 'react';

interface Job {
  id: number;
  title: string;
  company: string;
}

const RecentlyViewedCard: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  // 1. Ref 3ashan n-emsak el scroll container
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Function el scroll
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      backgroundColor: "var(--dark-blue)", 
      borderRadius: "30px", 
      padding: "24px", 
      height: "120%", 
      display: "flex", 
      flexDirection: "column",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden" ,
      width: "122%",
      left: "-23%",
    }}>
      <h3 style={{ 
        color: "white", 
        fontFamily: 'Nova Square', 
        fontSize: "1.3rem", 
        marginBottom: "15px",
        marginTop: 0,
        textAlign: "center"
      }}>
        Recently viewed
      </h3>

      {/* 3. Pass el ref hena */}
      <div 
        ref={scrollRef}
        style={{ 
          display: "flex", 
          gap: "15px", 
          alignItems: "center", 
          width: "100%",
          overflowX: "auto", 
          scrollbarWidth: "none", 
          msOverflowStyle: "none",
          paddingRight: "40px" 
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {jobs.map((job) => (
          <div key={job.id} style={{ 
            backgroundColor: "#c1cbe6", 
            borderRadius: "15px", 
            padding: "10px 20px", 
            minWidth: "180px", 
            flexShrink: 0,
          }}>
            <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "black", fontFamily: 'Nova Square' }}>
              {job.title}
            </div>
            <div style={{ fontSize: "0.8rem", color: "black", marginTop: "5px" }}>
              - {job.company}
            </div>
          </div>
        ))}
      </div>

      <div 
        onClick={scrollRight}
        style={{ 
          position: "absolute",
          right: "-3px",
          top: "55%",
          transform: "translateY(-50%)",
          color: "white", 
          fontSize: "24px", 
          cursor: "pointer",
          padding: "10px",
          zIndex: 10,
          userSelect: "none"
        }}>
        ❯
      </div>
    </div>
  );
};

export default RecentlyViewedCard;