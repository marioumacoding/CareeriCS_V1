"use client";
import { useState } from "react";
import RootLayout from "@/app/features/layout";
import { CurrentCoursesCard, FieldsDiscoverCard, CompletedCoursesCard } from "@/components/ui/courseCards";

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState('HTML Beginner');
  const [selectedField, setSelectedField] = useState('Problem Solving');

  // 1. Raw Data for Current Courses
  const [currentCourses, setCurrentCourses] = useState([
    { title: "HTML Beginner", provider: "Top Courses" },
    { title: "Javascript Advanced", provider: "Top Courses" },
    { title: "Figma Fundamentals", provider: "Top Courses" },
    { title: "Node.js Basics", provider: "Udemy" },
    { title: "UX Fundamentals", provider: "Udemy" },
  ]);

  // 2. State for Completed Courses
  const [completedCourses, setCompletedCourses] = useState([
    { title: "UX Fundamentals", provider: "Udemy" },
    { title: "Node.js Basics", provider: "Udemy" },
  ]);

  const fields = ["Intro to programming", "Problem Solving", "Frontend", "Backend", "Data Science", "Mobile Apps", "IT", "Cyber Security", "UI/UX", "AI"];

  // This maps through current courses and checks if they exist in the completed list.
  const dynamicCurrentCourses = currentCourses.map(course => ({
    ...course,
    completed: completedCourses.some(completed => completed.title === course.title)
  }));

  return (
    
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)", 
          gridTemplateRows: "repeat(6,1fr)", 
          gridColumnGap: "25px",
          gridRowGap: "20px",
          height: "100%", 
          width: "100%",
          padding:"40px"
        }}
      >
        <CurrentCoursesCard 
          // Use the dynamic array here
          courses={dynamicCurrentCourses}
          selected={selectedCourse}
          onSelect={setSelectedCourse}
          style={{ gridArea: "1 / 1 / 3 / 7" }}
        />

        <FieldsDiscoverCard 
          fields={fields}
          selected={selectedField}
          onSelect={setSelectedField}
          style={{ gridArea: "3 / 1 / 7 / 5"}}
        />

        <CompletedCoursesCard 
          courses={completedCourses}
          style={{ gridArea: "3 / 5 / 7 / 7 " }}
        />
      </div>
  );
}