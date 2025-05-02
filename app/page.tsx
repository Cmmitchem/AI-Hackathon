"use client";

import Image from "next/image";
import illuminatiBackground from "../public/IlluminatiBackground.jpg";
import { Box, Button, Container, Typography } from "@mui/material";
import { useState } from "react";
import { DocumentUploader } from "./_components/DocumentUploader";
import { DocumentSummary } from "./_components/DocumentSummary";

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSummaryReceived = (summaryText: string) => {
    setSummary(summaryText);
    setIsLoading(false);
  };

  const handleUploadStarted = () => {
    setIsLoading(true);
    setSummary("");
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          //justifyContent: "center",
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
          //style={{ position: "fixed" }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "100px 20px 40px 20px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              position: "fixed",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              mt: 4, // margin from the very top, adjust as needed
              color: "#fff",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: 2,
              textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
              zIndex: 2,
            }}
          >
            ILLUMINATI
          </Typography>

          {/* <Button
            size="large"
            sx={{
              fontSize: "32px",
              borderRadius: "20px",
              bgcolor: "#134074",
              color: "#FFFF",
              mb: 2,
            }}
          >
            Upload Audio Recording
          </Button>
          <Typography
            variant="h2"
            color="#FFFF"
            sx={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {" "}
            OR
          </Typography>
          <Button
            size="large"
            sx={{
              fontSize: "32px",
              borderRadius: "20px",
              bgcolor: "#134074",
              color: "#FFFF",
            }}
          >
            Start Recording{" "}
          </Button> */}

          <Box sx={{ marginTop: "80px", width: "100%" }}>
            <DocumentUploader
              onSummaryReceived={handleSummaryReceived}
              onUploadStarted={handleUploadStarted}
              onError={handleError}
            />
            {isLoading && (
              <Box sx={{ mt: 8, alignItems: "center" }}>
                <Typography variant="h6" color="primary">
                  Processing your document...
                </Typography>
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </Box>
              </Box>
            )}

            {error && (
              <Box sx={{ mt: 4, color: "red", textAlign: "center" }}>
                <Typography variant="h6">{error}</Typography>
              </Box>
            )}

            {summary && (
              <Box sx={{ mt: 6, mb: 6 }}>
                <DocumentSummary summary={summary} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
