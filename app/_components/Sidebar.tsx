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
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import GroupIcon from "@mui/icons-material/Group";
import FolderIcon from "@mui/icons-material/Folder";
import ChatIcon from "@mui/icons-material/Chat";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import {
  downloadDocumentSummaryAsPDF,
  downloadChatAsPDF,
} from "@/app/lib/pdfUtils";

interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
  messages?: Message[];
  type: "file" | "chat";
}

interface SidebarProps {
  summaries: SummaryItem[];
  onSummarySelect: (summary: SummaryItem) => void;
  onNewChat: () => void;
  onNewDocument: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate?: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  summaries,
  onSummarySelect,
  onNewChat,
  onNewDocument,
  isOpen,
  toggleSidebar,
  onNavigate,
}) => {
  const router = useRouter();
  const [localSummaries, setLocalSummaries] =
    useState<SummaryItem[]>(summaries);

  // State for name input dialogs
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    setLocalSummaries(summaries);
  }, [summaries]);

  useEffect(() => {
    const handleSummariesUpdated = (event: CustomEvent) => {
      setLocalSummaries(event.detail);
    };

    window.addEventListener(
      "summariesUpdated",
      handleSummariesUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "summariesUpdated",
        handleSummariesUpdated as EventListener
      );
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const [openSections, setOpenSections] = useState<string[]>([
    "files",
    "chats",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Function to determine the appropriate icon for a file
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    const audioExtensions = ["mp3", "wav", "m4a", "aac", "ogg"];

    // Check if filename indicates it's a recording
    if (fileName.toLowerCase().includes("recording")) {
      return <RecordVoiceOverIcon sx={{ mr: 2, opacity: 0.7 }} />;
    }

    // Check file extension
    if (extension && audioExtensions.includes(extension)) {
      return <AudioFileIcon sx={{ mr: 2, opacity: 0.7 }} />;
    }

    // Default to document icon
    return <DescriptionIcon sx={{ mr: 2, opacity: 0.7 }} />;
  };

  const handleNewChatClick = () => {
    setNewItemName("");
    setIsNewChatDialogOpen(true);
  };

  const handleNewDocumentClick = () => {
    setNewItemName("");
    setIsNewDocumentDialogOpen(true);
  };

  const handleCreateNewChat = () => {
    if (newItemName.trim()) {
      console.log("Creating new chat with name:", newItemName.trim());

      const event = new CustomEvent("newChatRequested", {
        detail: { name: newItemName.trim() },
      });
      window.dispatchEvent(event);

      setIsNewChatDialogOpen(false);

      if (!openSections.includes("chats")) {
        setOpenSections((prev) => [...prev, "chats"]);
      }
    }
  };

  const handleCreateNewDocument = () => {
    if (newItemName.trim()) {
      console.log("Creating new document with name:", newItemName.trim());

      const event = new CustomEvent("newDocumentRequested", {
        detail: { name: newItemName.trim() },
      });
      window.dispatchEvent(event);

      setIsNewDocumentDialogOpen(false);

      if (!openSections.includes("files")) {
        setOpenSections((prev) => [...prev, "files"]);
      }
    }
  };

  const handleDeleteSummary = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const updatedSummaries = localSummaries.filter((item) => item.id !== id);

    setLocalSummaries(updatedSummaries);
    localStorage.setItem("documentSummaries", JSON.stringify(updatedSummaries));

    const customEvent = new CustomEvent("summariesUpdated", {
      detail: updatedSummaries,
    });
    window.dispatchEvent(customEvent);

    const urlParams = new URLSearchParams(window.location.search);
    const currentSummaryId = urlParams.get("summaryId");

    if (currentSummaryId === id) {
      router.push("/");
    }
  };

  // New download handler function
  const handleDownloadItem = (item: SummaryItem, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      if (item.type === "chat") {
        downloadChatAsPDF(item);
      } else {
        // For files/documents
        if (item.summary && item.summary.trim()) {
          downloadDocumentSummaryAsPDF(item);
        } else {
          // Show a message if there's no summary to download
          alert("This document doesn't have a summary to download yet.");
        }
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

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
      id: "files",
      label: "Documents & Audio",
      icon: <FolderIcon />,
      content: true,
    },
    {
      id: "chats",
      label: "Chats",
      icon: <ChatIcon />,
      content: true,
    },
  ];

  const getMessageCount = (item: SummaryItem) => {
    return item.messages && item.messages.length > 0 ? item.messages.length : 0;
  };

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
                      (openSections.includes(section.id) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </ListItem>

                {section.content && (
                  <Collapse
                    in={openSections.includes(section.id)}
                    timeout="auto"
                    unmountOnExit
                  >
                    {/* Files section */}
                    {section.id === "files" && (
                      <>
                        <Box sx={{ p: 2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNewDocumentClick}
                            sx={{
                              backgroundColor: "rgba(255, 255, 255, 0.15)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                              },
                              mb: 2,
                            }}
                          >
                            New Document/Audio
                          </Button>
                        </Box>

                        <List component="div" disablePadding>
                          {Array.isArray(localSummaries) &&
                          localSummaries.filter(
                            (item) => item.type === "file" || !item.type
                          ).length > 0 ? (
                            localSummaries
                              .filter(
                                (item) => item.type === "file" || !item.type
                              )
                              .map((item) => (
                                <ListItemButton
                                  key={item.id}
                                  sx={{
                                    pl: 4,
                                    position: "relative",
                                    "&:hover .action-icons": {
                                      opacity: 1,
                                    },
                                  }}
                                  onClick={() => onSummarySelect(item)}
                                >
                                  {getFileIcon(item.fileName)}
                                  <ListItemText
                                    primary={item.fileName}
                                    secondary={formatDate(
                                      new Date(item.timestamp)
                                    )}
                                    primaryTypographyProps={{
                                      noWrap: true,
                                      color: "#fff",
                                    }}
                                    secondaryTypographyProps={{
                                      noWrap: true,
                                      color: "rgba(255, 255, 255, 0.7)",
                                    }}
                                  />
                                  <Box
                                    className="action-icons"
                                    sx={{
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      position: "absolute",
                                      right: 8,
                                      display: "flex",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Tooltip title="Download PDF">
                                      <IconButton
                                        size="small"
                                        onClick={(e) =>
                                          handleDownloadItem(item, e)
                                        }
                                        sx={{
                                          color: "rgba(100, 200, 255, 0.8)",
                                          "&:hover": {
                                            color: "rgba(100, 200, 255, 1)",
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.1)",
                                          },
                                        }}
                                      >
                                        <DownloadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        onClick={(e) =>
                                          handleDeleteSummary(item.id, e)
                                        }
                                        sx={{
                                          color: "rgba(255, 100, 100, 0.8)",
                                          "&:hover": {
                                            color: "rgba(255, 100, 100, 1)",
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.1)",
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </ListItemButton>
                              ))
                          ) : (
                            <Box
                              sx={{ p: 2, textAlign: "center", opacity: 0.7 }}
                            >
                              <Typography variant="body2">
                                No documents or audio files yet. Upload or
                                record to get started.
                              </Typography>
                            </Box>
                          )}
                        </List>
                      </>
                    )}

                    {/* Chats section */}
                    {section.id === "chats" && (
                      <>
                        <Box sx={{ p: 2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNewChatClick}
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
                          {Array.isArray(localSummaries) &&
                          localSummaries.filter((item) => item.type === "chat")
                            .length > 0 ? (
                            localSummaries
                              .filter((item) => item.type === "chat")
                              .map((item) => (
                                <ListItemButton
                                  key={item.id}
                                  sx={{
                                    pl: 4,
                                    position: "relative",
                                    "&:hover .action-icons": {
                                      opacity: 1,
                                    },
                                  }}
                                  onClick={() => onSummarySelect(item)}
                                >
                                  <Badge
                                    badgeContent={getMessageCount(item)}
                                    color="primary"
                                    sx={{ mr: 2 }}
                                  >
                                    <ChatIcon sx={{ opacity: 0.7 }} />
                                  </Badge>
                                  <ListItemText
                                    primary={item.fileName}
                                    secondary={formatDate(
                                      new Date(item.timestamp)
                                    )}
                                    primaryTypographyProps={{
                                      noWrap: true,
                                      color: "#fff",
                                    }}
                                    secondaryTypographyProps={{
                                      noWrap: true,
                                      color: "rgba(255, 255, 255, 0.7)",
                                    }}
                                  />
                                  <Box
                                    className="action-icons"
                                    sx={{
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      position: "absolute",
                                      right: 8,
                                      display: "flex",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Tooltip title="Download Chat PDF">
                                      <IconButton
                                        size="small"
                                        onClick={(e) =>
                                          handleDownloadItem(item, e)
                                        }
                                        sx={{
                                          color: "rgba(100, 200, 255, 0.8)",
                                          "&:hover": {
                                            color: "rgba(100, 200, 255, 1)",
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.1)",
                                          },
                                        }}
                                      >
                                        <DownloadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        onClick={(e) =>
                                          handleDeleteSummary(item.id, e)
                                        }
                                        sx={{
                                          color: "rgba(255, 100, 100, 0.8)",
                                          "&:hover": {
                                            color: "rgba(255, 100, 100, 1)",
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.1)",
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </ListItemButton>
                              ))
                          ) : (
                            <Box
                              sx={{ p: 2, textAlign: "center", opacity: 0.7 }}
                            >
                              <Typography variant="body2">
                                No chats yet. Start a new chat to begin.
                              </Typography>
                            </Box>
                          )}
                        </List>
                      </>
                    )}
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isOpen &&
          Array.isArray(localSummaries) &&
          localSummaries.length === 0 && (
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

      {/* New Chat Dialog */}
      <Dialog
        open={isNewChatDialogOpen}
        onClose={() => setIsNewChatDialogOpen(false)}
      >
        <DialogTitle>Name Your Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newItemName.trim()) {
                handleCreateNewChat();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewChatDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNewChat}
            variant="contained"
            color="primary"
            disabled={!newItemName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Document Dialog */}
      <Dialog
        open={isNewDocumentDialogOpen}
        onClose={() => setIsNewDocumentDialogOpen(false)}
      >
        <DialogTitle sx={{ color: "#8568EF" }}>
          Name Your Document/Audio
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document/Audio Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newItemName.trim()) {
                handleCreateNewDocument();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewDocumentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateNewDocument}
            variant="contained"
            color="primary"
            disabled={!newItemName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
