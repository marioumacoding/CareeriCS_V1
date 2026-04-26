"use client";
import { useEffect, useMemo, useState } from "react";
import RootLayout from "@/app/features/layout";
import ArchiveCard from "@/components/ui/archive-card";
import { Button } from "@/components/ui/button";
import ChoiceCard from "@/components/ui/choice-card";
import CVPop from "@/components/ui/cvPopup";
import { cvService, reportsService } from "@/services";
import { useAuth } from "@/providers/auth-provider";
import type { APIReport } from "@/types";
import { CardsContainer } from "@/components/ui/cards-container";
import { ActivityCard } from "@/components/ui/activity-card";

function formatReportDate(dateIso: string): string {
  const parsedDate = new Date(dateIso);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleDateString();
}

export default function CVCrafting() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // State to manage the popup visibility
  const [isPopOpen, setIsPopOpen] = useState(false);
  const [reports, setReports] = useState<APIReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [extractorMessage, setExtractorMessage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const refreshReports = async (): Promise<APIReport[]> => {
    if (!user?.id) {
      setReports([]);
      return [];
    }

    setIsLoadingReports(true);
    setReportsError(null);

    const response = await reportsService.listUserReports(user.id, "cv");
    if (!response.success) {
      setReportsError(response.message ?? "Failed to load CV history.");
      setReports([]);
      setIsLoadingReports(false);
      return [];
    }

    const fetchedReports = response.data ?? [];
    setReports(fetchedReports);
    setIsLoadingReports(false);
    return fetchedReports;
  };

  useEffect(() => {
    const refreshTimer = setTimeout(() => {
      void refreshReports();
    }, 0);

    return () => clearTimeout(refreshTimer);
    // refreshReports intentionally depends on latest user id per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleFileSelection = async (file: File) => {
    if (isAuthLoading) {
      setExtractorMessage("Checking your session. Please try again in a moment.");
      return;
    }

    if (!user?.id) {
      setExtractorMessage("Please sign in first to extract your CV.");
      return;
    }

    setIsExtracting(true);
    setExtractorMessage("Uploading CV for extraction...");

    try {
      const response = await cvService.extractCV(user.id, file);

      if (!response.success) {
        setExtractorMessage(response.message ?? "Failed to extract CV.");
        return;
      }

      setExtractorMessage("CV extracted successfully. Your profile data has been saved.");
      const refreshedReports = await refreshReports();

      const newest = [...refreshedReports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];

      if (newest) {
        setExtractorMessage(
          `CV extracted and history refreshed. Latest report: ${newest.filename}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to extract CV. Please try again.";
      setExtractorMessage(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const archiveItems = useMemo(
    () => reports.map((report) => ({
      id: report.id,
      label: report.filename,
      date: formatReportDate(report.created_at),
    })),
    [reports],
  );

  const lastVersionLabel = reports[0]?.filename ?? "No extracted version";

  const handleDownloadReport = (item: { id: string; label?: string }) => {
    const downloadUrl = reportsService.getReportDownloadUrl(item.id);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = item.label ?? "cv-report.pdf";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      {/* 1. The Main Content Layer */}
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "grid",
          gridTemplateRows: "repeat(6, 1fr)",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridColumnGap: "25px",
          gridRowGap: "20px",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <ChoiceCard
          key={1}
          title="CV Builder"
          description="Elevate your existing resume with AI-driven insights that refine your language and highlight your most impactful achievements."
          icon="/cv/CV Builder.svg"
          buttonVariant="primary-inverted"
          route="/cv-feature/builder"
          style={{ gridArea: "1 / 1 / 5 / 3" }}
        />

        <ChoiceCard
          key={2}
          title="CV Enhancer"
          description="Elevate your existing resume with AI-driven insights that refine your language and highlight your most impactful achievements."
          icon="/cv/CV Enhancer.svg"
          buttonVariant="primary-inverted"
          route="/cv-feature/enhancer"
          style={{ gridArea: "1 / 3 / 5 / 5" }}
        />

        <CardsContainer
          Title="Old Versions"
          style={{ gridArea: "1 / 5 / 7 / 7", backgroundColor: "var(--medium-blue)" }}
          variant="vertical"
          Columns={1}
          centerTitle
        >
          {archiveItems.map((item) => (
            <ActivityCard
              key={item.id}
              title={item.label}
              date={item.date}
              onClick={() => handleDownloadReport(item)}
              variant="download"
            />
          ))}
        </CardsContainer>

        {/* CV Extractor Row */}
        <div style={{
          gridArea: "5 / 1 / 7 / 5",
          backgroundColor: "#16203d",
          borderRadius: "4vh",
          padding: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            <img src="/cv/CV Extractor.svg" alt="" style={{ height: "12vh" }} />
            <div style={{ height: "80px", width: "1.7px", backgroundColor: "white" }}></div>
            <div>
              <h3 style={{ color: "white", fontSize: "clamp(0.8rem,1.7vw,1.5rem)", margin: 0, fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
                CV Extractor
              </h3>
              <p style={{ color: "white", fontSize: "15px", marginTop: "5px" }}>
                Update your data on our system to automate job application later on
              </p>
            </div>
          </div>

          <Button
            variant="primary-inverted"
            onClick={() => setIsPopOpen(true)}
            style={{
              flexGrow: 0,
              flexShrink: 0,
              paddingInline: "2vw",
              marginTop: "auto",
              paddingBlock: "2.5vh",
              whiteSpace: "nowrap"
            }}
          >
            Upload CV
          </Button>
        </div>
      </div>


      {/* 2. The Popup Layer (Moved OUTSIDE of RootLayout) */}
      {isPopOpen && (
        <CVPop
          onClose={() => setIsPopOpen(false)}
          lastVersion={lastVersionLabel}
          onFileSelect={handleFileSelection}
        />
      )}
    </>
  );
}
