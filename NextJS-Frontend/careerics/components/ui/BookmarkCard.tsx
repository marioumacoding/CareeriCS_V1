"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface BookmarkCardProps {
  description?: string;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  description = "All of your saved jobs are here",
}) => {
  const router = useRouter();
  return (
    <div style={{
      backgroundColor: "var(--dark-blue)",
      borderRadius: "4vh",
      paddingInline: "2.4rem",
      height: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems:"center",
      paddingBlock:"1rem"
    }}>

      <img
        src="/global/bookmark.svg" // Ghayar el path lel icon el sa7
        alt="Bookmark"
        style={{ width: "3rem"}}
      />

      <div>
        <h3 style={{ color: "white", margin: 0, fontSize: "1.2rem", fontFamily: 'Nova Square', fontWeight: "400" }}>
          Bookmarks
        </h3>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: "5px 0", fontFamily: 'Nova Square' }}>
          {description}
        </p>
      </div>

      {/* Estekhdam el Button component bta3ak */}
      <Button
        variant="primary-inverted"
        style={{
          borderRadius: "2vh",
          fontFamily: 'Nova Square',
          marginTop: "auto",
          paddingInline: "3rem",
          paddingBlock: "1rem",
          flex: "0"
        }}
        onClick={() => router.push('/job-features/bookmarks')}
      >
        Open
      </Button>
    </div>
  );
};

export default BookmarkCard;
