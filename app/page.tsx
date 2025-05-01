import Image from "next/image";
import styles from "./page.module.css";
import illuminatiBackground from "../public/IlluminatiBackground.jpg";
import { Box, Button, Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Image
          src={illuminatiBackground}
          alt="Illuminati Background"
          layout="fill"
          objectFit="cover"
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              position: "absolute",
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

          <Button
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
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
