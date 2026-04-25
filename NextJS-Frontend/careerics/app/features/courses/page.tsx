"use client";
import { useState } from "react";
import { CurrentCoursesCard, FieldsDiscoverCard, CompletedCoursesCard } from "@/components/ui/courseCards";
import { CardsContainer } from "@/components/ui/cards-container";
import { RectangularCard } from "@/components/ui/rectangular-card";
import { ActivityCard } from "@/components/ui/activity-card";

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
        padding: "40px",
      }}
    >
 
      <CardsContainer
        Title="Courses you are currently taking"
        variant="horizontal"
        style={{ gridArea: "1 /1 /3 /7", width: "100%"}}
      >
        {dynamicCurrentCourses.map((course) => {
          const isCompleted = completedCourses.some(completed => completed.title === course.title);
          return (
            <RectangularCard
              key={course.title}
              Title={course.title}
              theme="light"
              variant="radio"
              subtext={`by ${course.provider}`}
              isSubtextVisible={true}
              selectable
              selected={selectedCourse === course.title}
              onSelect={() => setSelectedCourse(course.title)}
              style={{
                height: "fit-content",
              }}
            />
          );
        })}
      </CardsContainer>

      <CardsContainer
        Title="More fields to discover"
        Columns={3}
        variant="vertical"
        style={{ gridArea: "3 / 1 / 7 / 5", backgroundColor: "#142143" }}
      >
        {fields.map((field) => (
          <RectangularCard
            key={field}
            Title={field}
            isSubtextVisible={false}
            theme="dark"
            selectable
            selected={selectedField === field}
            onSelect={() => setSelectedField(field)}

            style={{
              width: "100%",
            }}
          />
        ))}
      </CardsContainer>

        <CardsContainer
        Title="Completed Courses"
        variant="vertical"
        Columns={1}
        style={{ gridArea: "3 / 5 / 7 / 7", width: "100%", backgroundColor: "#142143" }}
>
        {completedCourses.map((course) => (
          <ActivityCard
            variant="retake"
            key={course.title}
            title={course.title}
            provider={course.provider}
          />
        ))}
      </CardsContainer>
    </div>
  );
}