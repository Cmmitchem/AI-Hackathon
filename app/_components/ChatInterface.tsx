"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMessageSent: (messages: Message[]) => void;
  initialMessages?: Message[];
  documentSummary?: string;
  currentSummaryId?: string; // Add prop to know which summary we're viewing
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onMessageSent,
  initialMessages = [],
  documentSummary = "",
  currentSummaryId = "",
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [allSummaries, setAllSummaries] = useState<any[]>([]);

  // Load all summaries from localStorage
  useEffect(() => {
    const savedSummaries = localStorage.getItem("documentSummaries");
    if (savedSummaries) {
      try {
        const parsedSummaries = JSON.parse(savedSummaries);
        setAllSummaries(parsedSummaries);
      } catch (e) {
        console.error("Error parsing saved summaries:", e);
      }
    }
  }, []);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare summaries data to send to API
      // We'll send all document summaries as context
      const contextSummaries = allSummaries
        .filter((item) => item.type === "file" && item.summary)
        .map((item) => ({
          documentName: item.fileName,
          summary: item.summary,
          isCurrent: item.id === currentSummaryId,
        }));

      // Call our API endpoint to get a response from ChatGPT
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          documentSummary: documentSummary, // Current document summary for backward compatibility
          allSummaries: contextSummaries, // All document summaries for enhanced context
          currentSummaryId: currentSummaryId, // ID of the current summary
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from API");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        sender: "assistant",
        text: data.response,
        timestamp: new Date(),
      };

      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);

      // Notify parent component about the updated messages
      onMessageSent(newMessages);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        sender: "assistant",
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      onMessageSent(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle key press events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "500px",
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 2,
        mt: 4,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          bgcolor: "#8568EF",
          color: "white",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Document Q&A</Typography>
        <Typography variant="body2">
          {
            allSummaries.filter((item) => item.type === "file" && item.summary)
              .length
          }{" "}
          document
          {allSummaries.filter((item) => item.type === "file" && item.summary)
            .length !== 1
            ? "s"
            : ""}{" "}
          included
        </Typography>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            Ask a question about your documents
          </Typography>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                alignSelf:
                  message.sender === "user" ? "flex-end" : "flex-start",
                bgcolor:
                  message.sender === "user" ? "#8568EF" : "rgba(0, 0, 0, 0.05)",
                color: message.sender === "user" ? "white" : "inherit",
                p: 2,
                borderRadius: 2,
                maxWidth: "80%",
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  textAlign: "right",
                  opacity: 0.7,
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          ))
        )}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              my: 2,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your documents..."
          variant="outlined"
          multiline
          maxRows={3}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === ""}
          sx={{ minWidth: "auto", px: 3 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
};
