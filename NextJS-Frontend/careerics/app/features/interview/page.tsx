"use client";
import RootLayout from "@/app/features/layout";
import ArchiveCard from "@/components/ui/archive-card";
import ChoiceCard from "@/components/ui/choice-card";
import TipCard from "@/components/ui/tipcard";

export default function Interview() {
  const archive = [
    { id: "Tech-001", date: "5/3/2026" },
    { id: "Tech-002", date: "5/3/2026" },
    { id: "Tech-003", date: "5/3/2026" },
    { id: "Tech-004", date: "5/3/2026" },
    { id: "Tech-005", date: "5/3/2026" },
    { id: "Tech-006", date: "5/3/2026" },
  ];
  return (
    <RootLayout
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gridColumnGap: "4vh",
        gridRowGap: "4vh",
      }}
    >

      <ChoiceCard
        title="Behavioral Mock Interview"
        description="Practice answering the most common interview questions and improve how you  present yourself ans your skills."
        buttonVariant="primary-inverted"
        route="/interview-feature/recording?type=hr"
        icon="/interview/HR Interview Icon.png"
        style={{ gridArea: "1 / 1 / 3 / 2" }}
      />

      <ChoiceCard
        title="Technical Mock Interview"
        description="Test your technical knowledge and problem solving skills with questions designed to mirror real interviews."
        buttonVariant="primary-inverted"
        route="/interview-feature/recording?type=tech"
        icon="/interview/Tech Interview Icon.png"
        style={{ gridArea: "1 / 2 / 3 / 3" }}
      />

      <ArchiveCard
        items={archive}
        style={{
          gridArea: "1 / 3 / 3 / 4"
        }}
      />

      <TipCard
        title="Tip of the day"
        description="Research the company and interviewers before your interview so you understand the company's goals and show how you fit."
        icon="/interview/Interview Tip.svg"
        style={{
          gridArea: "3 / 1 / 4 / 4"
        }}
      />

    </RootLayout>
  );
}