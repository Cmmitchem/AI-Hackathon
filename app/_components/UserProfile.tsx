"use client";

import { useSession, signOut } from "next-auth/react";
import { Box, Button, Avatar, Typography } from "@mui/material";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";

export const UserProfile: React.FC = () => {
  // Use destructuring with default values to prevent error if session is undefined
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show loading state or nothing if still loading or not authenticated
  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(0, 0, 0, 0.5)",
          p: 1,
          borderRadius: 2,
          color: "white",
        }}
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {session.user?.name?.[0] || "U"}
        </Avatar>
        <Typography variant="body2">{session.user?.name || "User"}</Typography>
        <Button
          size="small"
          onClick={handleSignOut}
          sx={{
            color: "white",
            minWidth: "unset",
            p: "4px",
          }}
          title="Sign Out"
        >
          <LogoutIcon fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
};
