"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Button,
  Collapse,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import GroupIcon from "@mui/icons-material/Group";
import NoteIcon from "@mui/icons-material/Note";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";

interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
}

interface SidebarProps {
  summaries: SummaryItem[];
  onSummarySelect: (summary: SummaryItem) => void;
  onNewChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate?: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  summaries,
  onSummarySelect,
  onNewChat,
  isOpen,
  toggleSidebar,
  onNavigate,
}) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    console.log("Sidebar received summaries:", summaries);
  }, [summaries]);

  const [openSection, setOpenSection] = useState("documentHistory");
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Navigation sections configuration
  const sections = [
    {
      id: "features",
      label: "Features",
      icon: <FeaturedPlayListIcon />,
      path: "/features",
    },
    {
      id: "team",
      label: "Team",
      icon: <GroupIcon />,
      path: "/team",
    },
    {
      id: "documentHistory",
      label: "Document History",
      icon: <NoteIcon />,
      content: true,
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: 10,
        left: 0,
        top: 0,
        height: "100vh",
        width: isOpen ? 280 : 50,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          p: 2,
          height: 64,
        }}
      >
        {isOpen && (
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        )}
        {/* <IconButton
          onClick={toggleSidebar}
          sx={{ color: "#fff" }}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton> */}
      </Box>

      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        {isOpen && (
          <List>
            {sections.map((section) => (
              <React.Fragment key={section.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={
                      section.content
                        ? () => toggleSection(section.id)
                        : () => handleNavigation(section.path ?? "/")
                    }
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, opacity: 0.7 }}>{section.icon}</Box>
                    <ListItemText
                      primary={section.label}
                      sx={{ color: "#fff" }}
                    />
                    {section.content &&
                      (openSection === section.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </ListItem>

                {section.content && (
                  <Collapse
                    in={openSection === section.id}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onNewChat}
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                          },
                          mb: 2,
                        }}
                      >
                        Start New Chat
                      </Button>
                    </Box>

                    <List component="div" disablePadding>
                      {Array.isArray(summaries) && summaries.length > 0 ? (
                        summaries.map((item) => (
                          <ListItemButton
                            key={item.id}
                            sx={{ pl: 4 }}
                            onClick={() => onSummarySelect(item)}
                          >
                            <DescriptionIcon sx={{ mr: 2, opacity: 0.7 }} />
                            <ListItemText
                              primary={item.fileName}
                              secondary={formatDate(new Date(item.timestamp))}
                              primaryTypographyProps={{
                                noWrap: true,
                                color: "#fff",
                              }}
                              secondaryTypographyProps={{
                                noWrap: true,
                                color: "rgba(255, 255, 255, 0.7)",
                              }}
                            />
                          </ListItemButton>
                        ))
                      ) : (
                        <Box sx={{ p: 2, textAlign: "center", opacity: 0.7 }}>
                          <Typography variant="body2">
                            No document summaries yet. Upload a document to get
                            started.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isOpen && Array.isArray(summaries) && summaries.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 24, mb: 1 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
