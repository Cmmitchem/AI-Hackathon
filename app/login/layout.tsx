"use client";

import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import illuminatiBackground from "@/public/IlluminatiBackground.jpg";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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

        <Typography
          variant="h1"
          sx={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            mt: 4,
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

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
            height: "100vh",
          }}
        >
          {children}
        </Box>
      </Box>
    </Container>
  );
}
