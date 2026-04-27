"use client";
import React, { use } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const BookmarkCard: React.FC = () => {
  const router = useRouter();
  return (
    <div style={{ 
      backgroundColor: "#1e2a4a", 
      borderRadius: "20px", 
      padding: "24px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between" 
    }}>
      <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
        <img 
          src="/Landing/bookmark.svg" // Ghayar el path lel icon el sa7
          alt="Bookmark"
          style={{ width: "30px", height: "30px" }} 
        />
        
        <div>
          <h3 style={{ color: "white", margin: 0, fontSize: "1.2rem", fontFamily: 'Nova Square', fontWeight: "400" }}>
            Bookmarks
          </h3>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: "5px 0", fontFamily: 'Nova Square' }}>
            All of your saved jobs are here
          </p>
        </div>
      </div>

      {/* Estekhdam el Button component bta3ak */}
      <div>
        <Button 
          variant="secondary" 
           style={{ 
          color: "black",
          borderRadius: "5px", // Radius Smooth
          fontFamily: 'Nova Square',
          width: "25%",          
          padding: "15px",
          left: "75%",
          bottom: "10px",
        }}
           onClick={() => router.push('/job-features/bookmarks')}          
        >
          Open
        </Button>
      </div>
    </div>
  );
};

export default BookmarkCard;