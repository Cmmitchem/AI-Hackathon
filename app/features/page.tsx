"use client";

import { Box, Typography } from "@mui/material";

export default function Features() {
  return (
    <>
      <Typography
        variant="h1"
        sx={{
          top: 0,
          mt: 2,
          color: "#fff",
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
          zIndex: 2,
          transition: "transform 0.3s ease",
        }}
      >
        Features
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 6,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 4,
            mb: 4,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Typography variant="h3" align="center" sx={{ flex: "1 1 0" }}>
            1
          </Typography>
          <Typography variant="h3" align="center" sx={{ flex: "1 1 0" }}>
            2
          </Typography>
          <Typography variant="h3" align="center" sx={{ flex: "1 1 0" }}>
            3
          </Typography>
          <Typography variant="h3" align="center" sx={{ flex: "1 1 0" }}>
            4
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            mb: 6,
            gap: 4,
            flexWrap: { xs: "wrap", md: "nowrap" },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" align="center" sx={{ flex: "1 1 0" }}>
            Record Meeting Audio
          </Typography>

          <Typography variant="h6" align="center" sx={{ flex: "1 1 0" }}>
            Generate Notes Summary
          </Typography>

          <Typography variant="h6" align="center" sx={{ flex: "1 1 0" }}>
            Review Notes and Summaries
          </Typography>

          <Typography variant="h6" align="center" sx={{ flex: "1 1 0" }}>
            Use Notes Agent to query all saved notes
          </Typography>
        </Box>
      </Box>
    </>
  );
}
