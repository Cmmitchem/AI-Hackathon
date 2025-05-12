"use client";

import { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import Image from "next/image";
import illuminatiBackground from "@/public/IlluminatiBackground.jpg";
import { Sidebar } from "./Sidebar";
import { UserProfile } from "./UserProfile";
import { useRouter } from "next/navigation";
import AuthGuard from "./AuthGuard";

interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const router = useRouter();

  // Load saved summaries from localStorage on initial render
  useEffect(() => {
    const savedSummaries = localStorage.getItem("documentSummaries");
    if (savedSummaries) {
      try {
        const parsedSummaries = JSON.parse(savedSummaries).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setSummaries(parsedSummaries);
      } catch (e) {
        console.error("Error parsing saved summaries:", e);
      }
    }
  }, []);

  const handleSummarySelect = (selectedSummary: SummaryItem) => {
    // Navigate to home page and pass the selected summary
    router.push(`/?summaryId=${selectedSummary.id}`);

    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    // Navigate to home page for new chat
    router.push("/");

    // On mobile, close the sidebar after starting new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <AuthGuard>
      <Container maxWidth="xl" disableGutters>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            minHeight: "100vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <Image
            src={illuminatiBackground}
            alt="Illuminati Background"
            layout="fill"
            objectFit="cover"
          />

          {/* Sidebar */}
          <Sidebar
            summaries={summaries}
            onSummarySelect={handleSummarySelect}
            onNewChat={handleNewChat}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          <UserProfile />

          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "100px 20px 40px 20px",
              width: {
                xs: "100%",
                md: `calc(100% - ${isSidebarOpen ? "280px" : "50px"})`,
              },
              maxWidth: "1200px",
              marginLeft: {
                xs: "auto",
                md: isSidebarOpen ? "280px" : "50px",
              },
              marginRight: "auto",
              transition: "width 0.3s ease, margin-left 0.3s ease",
            }}
          >
            {children}
          </Box>
        </Box>
      </Container>
    </AuthGuard>
  );
}
