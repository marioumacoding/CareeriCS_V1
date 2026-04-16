"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; 

export default function HobbiesGrid() {
  const [step, setStep] = useState(0);

  const [hobbies, setHobbies] = useState<string[]>([
    "Hoby 1", "Hob 2", "Hobbbbbby 3", "Hobby 4",
    "Hobby 5", "Hobbyy 6", "Hobby 7", "Hobby 8",
    "Hobby 5", "Hobbyy 6", "Hobby 7", "Hobby 8",
    "Hobby 5", "Hobbyy 6", "Hobby 7", "Hobby 8",
    "Hobby 9", "Hobbyyy 10", "Hobbbby 11",
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
      
      <h1 style={{
        color: "white", 
        fontSize: "4.5vh",
        fontFamily: "var(--font-nova-square)",
        marginBottom: "4vh",
        textAlign: "center"
      }}>
        {title}
      </h1>

      {/* Gray Container */}
      <div style={{
        backgroundColor: "#B0B0B0", 
        borderRadius: "5vh", 
        width: "70%",         
        maxWidth: "1200vw",  
        minHeight: "60vh",   
        padding: "6vh 2vw",
        display: "flex", 
        flexWrap: "wrap",
        gap: "3vh 2vw", 
        justifyContent: "center", 
        alignItems: "center",       
        alignContent: "flex-start",   
        boxSizing: "border-box",
      }}>
        {currentItems.map((item, idx) => {
          const isSelected = selectedItems.includes(item);
          return (
            <div
              key={idx}
              onClick={() => toggleItem(item)}
              style={{
                padding: "1vh 3vw", 
                borderRadius: "1.5vh",
                fontSize: "3vh",   
                fontWeight: "800", 
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: isSelected ? "#E6FFB2" : "#1C427B",
                color: isSelected ? "#000" : "white",
                width: "fit-content", 
                whiteSpace: "nowrap",
                textAlign: "center",
                userSelect: "none",
                flexGrow: 1, 
                maxWidth: "25vw" 
              }}
            >
              {item}
            </div>
          );
        })}

        <div 
          onClick={handleAddMore}
          style={{
            padding: "2vh 2.5vw", 
            borderRadius: "1.5vh",
            fontSize: "2.2vh", 
            fontWeight: "600", 
            backgroundColor: "#6B7280", 
            color: "white",
            width: "fit-content", 
            whiteSpace: "nowrap",
            textAlign: "center",
            cursor: "pointer",
            userSelect: "none",
            flexGrow: 0 
          }}
        >
          + More
        </div>
      </div>

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