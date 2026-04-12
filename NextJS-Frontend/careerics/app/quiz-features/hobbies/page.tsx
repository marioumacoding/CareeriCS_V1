"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; 

export default function HobbiesGrid() {
  // 1. State lel step (0 = Hobbies, 1 = Activities)
  const [step, setStep] = useState(0);

  const [hobbies, setHobbies] = useState<string[]>([
    "Hobby 1", "Hobby 2", "Hobby 3", "Hobby 4",
    "Hobby 5", "Hobby 6", "Hobby 7", "Hobby 8",
    "Hobby 9", "Hobby 10", "Hobby 11", "Hobby 12"
  ]);

  const [activities, setActivities] = useState<string[]>([
    "Coding", "Design", "Gaming", "Reading",
    "Running", "Writing", "Cooking", "Swimming",
    "Cycling", "Hiking", "Yoga", "Music"
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const currentItems = step === 0 ? hobbies : activities;
  const title = step === 0 ? "Choose Your Favorite Hobbies" : "Choose Your Favorite Activities";

  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(h => h !== item) : [...prev, item]
    );
  };

  const handleAddMore = () => {
    const nextId = currentItems.length + 1;
    if (step === 0) {
      setHobbies(prev => [...prev, `Hobby ${nextId}`, `Hobby ${nextId + 1}`]);
    } else {
      setActivities(prev => [...prev, `Activity ${nextId}`, `Activity ${nextId + 1}`]);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      setSelectedItems([]); 
    } else {
      console.log("Final Selection:", selectedItems);
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "100%", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      padding: "2vh 2vw",
      boxSizing: "border-box"
    }}>
      
      {/* Dynamic Title */}
      <h1 style={{
        color: "white", 
        fontSize: "4.5vh",
        fontFamily: "var(--font-nova-square)",
        marginBottom: "4vh",
        textAlign: "center"
      }}>
        {title}
      </h1>

      {/*  Gray Container  */}
      <div style={{
        backgroundColor: "#B0B0B0", 
        borderRadius: "5vh", 
        width: "70%",        
        maxWidth: "1200vw",  
        minHeight: "60vh",   
        padding: "6vh 4vw", 
        display: "flex", 
        flexWrap: "wrap",
        gap: "1vw", 
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
      }}>
        {currentItems.map((item, idx) => {
          const isSelected = selectedItems.includes(item);
          return (
            <div
              key={idx}
              onClick={() => toggleItem(item)}
              style={{
                padding: "2.5vh 3vw", 
                borderRadius: "1.5vh",
                fontSize: "2.5vh",   
                fontWeight: "800", 
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: isSelected ? "#E6FFB2" : "#1C427B",
                color: isSelected ? "#000" : "white",
                minWidth: "12vw", 
                textAlign: "center",
                userSelect: "none"
              }}
            >
              {item}
            </div>
          );
        })}

        <div 
          onClick={handleAddMore}
          style={{
            padding: "2vh 3vw", 
            borderRadius: "1.5vh",
            fontSize: "2.2vh", 
            fontWeight: "600", 
            backgroundColor: "#6B7280", 
            color: "white",
            minWidth: "10vw", 
            textAlign: "center",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          + More
        </div>
      </div>

     {/* 3. Next Button Section - Same Style */}
      <div style={{ 
        width: "20%",            
        display: "flex", 
        justifyContent: "flex-end", 
        marginTop: "1vh",
        marginLeft: "auto",      
        marginRight: "0%",
        transform: "translateY(5vh)"
        }}>
        <Button 
          onClick={handleNext}
          style={{
            backgroundColor: "#B8EF46", 
            color: "#000", 
            padding: "2.5vh 4vw",   
            borderRadius: "1.2vh", 
            fontSize: "2.5vh",
            fontWeight: "bold",
            height: "auto",
          }}
        >
          {step === 0 ? "Next" : "Finish"}
        </Button>
      </div>
    </div>
  );
}