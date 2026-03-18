"use client";
import { useState } from "react";
import RootLayout from "@/app/features/layout";
import { CurrentCoursesCard, FieldsDiscoverCard, CompletedCoursesCard } from "@/components/ui/courseCards";

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState('HTML Beginner');
  const [selectedField, setSelectedField] = useState('Problem Solving');

  const currentCourses = [
    { title: "HTML Beginner", provider: "Top Courses" },
    { title: "Javascript Advanced", provider: "Top Courses" },
    { title: "Figma Fundamentals", provider: "Top Courses" },
    { title: "Node.js Basics", provider: "Udemy" },
  ];

  const fields = ["Intro to programming", "Problem Solving", "Frontend", "Backend", "Data Science", "Mobile Apps", "IT", "Cyber Security", "UI/UX", "AI"];

  const completedCourses = [
    { title: "UX Fundamentals", provider: "Udemy" },
    { title: "C++ Basics", provider: "Codecademy" },
  ];

  return (
    <div style={{ width: "100%", height: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <RootLayout
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", 
          gridTemplateRows: "min-content min-content 1fr 1fr", 
          gridColumnGap: "15px",
          gridRowGap: "15px",
          height: "100%", 
          width: "100%",
        }}
      >
        <CurrentCoursesCard 
          courses={currentCourses}
          selected={selectedCourse}
          onSelect={setSelectedCourse}
          style={{ gridArea: "1 / 1 / 3 / 5", marginTop: "50px" }}
        />

        <FieldsDiscoverCard 
          fields={fields}
          selected={selectedField}
          onSelect={setSelectedField}
          style={{ gridArea: "3 / 1 / 5 / 3", height: "80%" }}
        />

        <CompletedCoursesCard 
          courses={completedCourses}
          style={{ gridArea: "3 / 3 / 5 / 5", height: "80%" }}
        />
      </RootLayout>
    </div>
  );
}