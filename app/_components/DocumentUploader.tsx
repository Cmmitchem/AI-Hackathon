import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SendIcon from "@mui/icons-material/Send";

interface DocumentUploaderProps {
  onSummaryReceived: (summary: string) => void;
  onUploadStarted: (fileName: string) => void;
  onError: (error: string) => void;
  key?: string; // Added to detect when parent component wants a reset
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onSummaryReceived,
  onUploadStarted,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when props change or component re-mounts
  useEffect(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("DocumentUploader reset");
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      onError("Please select a file to upload.");
      return;
    }

    // CRITICAL: Always pass the filename to the parent component
    console.log("Starting upload for file:", selectedFile.name);
    onUploadStarted(selectedFile.name);

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await axios.post("/api/summarize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      if (response.data && response.data.summary) {
        console.log("Summary received, length:", response.data.summary.length);
        // Make one more check that we're passing a summary to the callback
        if (
          typeof response.data.summary === "string" &&
          response.data.summary.trim() !== ""
        ) {
          onSummaryReceived(response.data.summary);
        } else {
          onError("Received empty summary from server");
        }
      } else {
        onError("No summary received from the server.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      onError("Failed to upload and process the document.");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      console.log("File dropped:", files[0].name);
      setSelectedFile(files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("File selection reset");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "440px", mx: "auto" }}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          border: "2px dashed",
          borderColor: "grey.300",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Drag and drop a document here, or
            </Typography>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<CloudUploadIcon />}
            >
              Select File
            </Button>
          </>
        ) : (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Selected file:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedFile.name}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleReset}
                startIcon={<RestartAltIcon />}
              >
                Change File
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                startIcon={<SendIcon />}
              >
                Upload & Summarize
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
