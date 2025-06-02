// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { Box, Typography, Button, Paper, Stack } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import RestartAltIcon from "@mui/icons-material/RestartAlt";
// import SendIcon from "@mui/icons-material/Send";

// interface DocumentUploaderProps {
//   onSummaryReceived: (summary: string) => void;
//   onUploadStarted: (fileName: string) => void;
//   onError: (error: string) => void;
//   key?: string; // Added to detect when parent component wants a reset
// }

// export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
//   onSummaryReceived,
//   onUploadStarted,
//   onError,
// }) => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   /**
//    * MODIFIED: Enhanced reset logic to ensure component completely resets
//    */
//   useEffect(() => {
//     // Reset state when component mounts or key changes
//     setSelectedFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//     console.log("DocumentUploader reset - component remounted");

//     // Cleanup function to ensure reset on unmount as well
//     return () => {
//       setSelectedFile(null);
//       console.log("DocumentUploader cleanup");
//     };
//   }, []);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       console.log("File selected:", files[0].name);
//       setSelectedFile(files[0]);
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!selectedFile) {
//       onError("Please select a file to upload.");
//       return;
//     }

//     // CRITICAL: Always pass the filename to the parent component
//     console.log("Starting upload for file:", selectedFile.name);
//     onUploadStarted(selectedFile.name);

//     const formData = new FormData();
//     formData.append("document", selectedFile);

//     try {
//       const response = await axios.post("/api/summarize", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Upload response:", response.data);

//       if (response.data && response.data.summary) {
//         console.log("Summary received, length:", response.data.summary.length);
//         // Make one more check that we're passing a summary to the callback
//         if (
//           typeof response.data.summary === "string" &&
//           response.data.summary.trim() !== ""
//         ) {
//           onSummaryReceived(response.data.summary);
//           setSelectedFile(null);
//           if (fileInputRef.current) {
//             fileInputRef.current.value = "";
//           }
//         } else {
//           onError("Received empty summary from server");
//         }
//       } else {
//         onError("No summary received from the server.");
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       onError("Failed to upload and process the document.");
//     }
//   };

//   const handleDragOver = (event: React.DragEvent) => {
//     event.preventDefault();
//   };

//   const handleDrop = (event: React.DragEvent) => {
//     event.preventDefault();
//     const files = event.dataTransfer.files;
//     if (files && files.length > 0) {
//       console.log("File dropped:", files[0].name);
//       setSelectedFile(files[0]);
//     }
//   };

//   /**
//    * MODIFIED: Enhanced reset function to be more thorough
//    */
//   const handleReset = () => {
//     setSelectedFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//     console.log("File selection reset");
//   };

//   return (
//     <Box sx={{ width: "100%", maxWidth: "440px", mx: "auto" }}>
//       <Paper
//         elevation={0}
//         variant="outlined"
//         sx={{
//           border: "2px dashed",
//           borderColor: "grey.300",
//           borderRadius: 2,
//           p: 3,
//           textAlign: "center",
//         }}
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//       >
//         {!selectedFile ? (
//           <>
//             <Typography variant="body1" sx={{ mb: 2 }}>
//               Drag and drop a document here, or
//             </Typography>
//             <input
//               type="file"
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//               ref={fileInputRef}
//               accept=".pdf,.doc,.docx,.txt"
//             />
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => fileInputRef.current?.click()}
//               startIcon={<CloudUploadIcon />}
//             >
//               Select File
//             </Button>
//           </>
//         ) : (
//           <Box sx={{ py: 2 }}>
//             <Typography variant="body1" sx={{ mb: 1 }}>
//               Selected file:
//             </Typography>
//             <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
//               {selectedFile.name}
//             </Typography>
//             <Stack direction="row" spacing={2} justifyContent="center">
//               <Button
//                 variant="outlined"
//                 color="inherit"
//                 onClick={handleReset}
//                 startIcon={<RestartAltIcon />}
//               >
//                 Change File
//               </Button>
//               <Button
//                 variant="contained"
//                 color="success"
//                 onClick={handleSubmit}
//                 startIcon={<SendIcon />}
//               >
//                 Upload & Summarize
//               </Button>
//             </Stack>
//           </Box>
//         )}
//       </Paper>
//     </Box>
//   );
// };
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface DocumentUploaderProps {
  onSummaryReceived: (summary: string) => void;
  onUploadStarted: (fileName: string) => void;
  onError: (error: string) => void;
  key?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onSummaryReceived,
  onUploadStarted,
  onError,
}) => {
  // Document upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Timer for recording
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when component mounts or key changes
    setSelectedFile(null);
    setRecordedAudio(null);
    setSelectedAudioFile(null);
    setIsRecording(false);
    setRecordingTime(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }

    console.log("DocumentUploader reset - component remounted");

    // Cleanup function
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      console.log("DocumentUploader cleanup");
    };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset states when switching tabs
    setSelectedFile(null);
    setRecordedAudio(null);
    setSelectedAudioFile(null);
    setIsRecording(false);
    setRecordingTime(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  // Document upload handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      setSelectedFile(files[0]);
    }
  };

  const handleDocumentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      onError("Please select a file to upload.");
      return;
    }

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
        if (
          typeof response.data.summary === "string" &&
          response.data.summary.trim() !== ""
        ) {
          onSummaryReceived(response.data.summary);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
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

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);

      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setRecordedAudio(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      onError(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const analyzeRecording = async () => {
    if (!recordedAudio) {
      onError("No recording to analyze.");
      return;
    }

    const fileName = `Recording_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.wav`;
    onUploadStarted(fileName);

    const formData = new FormData();
    formData.append("document", recordedAudio, fileName);

    try {
      // Note: You'll need to update your backend to handle audio files
      const response = await axios.post("/api/summarize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.summary) {
        onSummaryReceived(response.data.summary);
        setRecordedAudio(null);
        setRecordingTime(0);
      } else {
        onError("No summary received from the server.");
      }
    } catch (error) {
      console.error("Error analyzing recording:", error);
      onError("Failed to analyze the recording.");
    }
  };

  // Audio file upload handlers
  const handleAudioFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Audio file selected:", files[0].name);
      setSelectedAudioFile(files[0]);
    }
  };

  const handleAudioFileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAudioFile) {
      onError("Please select an audio file to upload.");
      return;
    }

    console.log("Starting upload for audio file:", selectedAudioFile.name);
    onUploadStarted(selectedAudioFile.name);

    const formData = new FormData();
    formData.append("document", selectedAudioFile);

    try {
      const response = await axios.post("/api/summarize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.summary) {
        onSummaryReceived(response.data.summary);
        setSelectedAudioFile(null);
        if (audioInputRef.current) {
          audioInputRef.current.value = "";
        }
      } else {
        onError("No summary received from the server.");
      }
    } catch (error) {
      console.error("Error uploading audio file:", error);
      onError("Failed to upload and process the audio file.");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (tabValue === 0) {
        // Document tab
        console.log("File dropped:", file.name);
        setSelectedFile(file);
      } else if (tabValue === 2) {
        // Audio upload tab
        if (file.type.startsWith("audio/")) {
          console.log("Audio file dropped:", file.name);
          setSelectedAudioFile(file);
        } else {
          onError("Please drop an audio file.");
        }
      }
    }
  };

  const handleReset = () => {
    if (tabValue === 0) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (tabValue === 1) {
      setRecordedAudio(null);
      setRecordingTime(0);
    } else if (tabValue === 2) {
      setSelectedAudioFile(null);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "540px", mx: "auto" }}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Upload Document" />
          <Tab label="Record Audio" />
          <Tab label="Upload Recording" />
        </Tabs>

        {/* Document Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
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
                  accept=".pdf,.doc,.docx,.txt,.md,.csv"
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
                    onClick={handleDocumentSubmit}
                    startIcon={<SendIcon />}
                  >
                    Upload & Summarize
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Audio Recording Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {isRecording && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="error" sx={{ mb: 1 }}>
                  {formatTime(recordingTime)}
                </Typography>
                <LinearProgress color="error" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Recording in progress...
                </Typography>
              </Box>
            )}

            {!isRecording && !recordedAudio && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                Click the button below to start recording audio
              </Typography>
            )}

            {recordedAudio && !isRecording && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Recording completed! Duration: {formatTime(recordingTime)}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={playRecording}
                  startIcon={<PlayArrowIcon />}
                  sx={{ mr: 1 }}
                >
                  Play Recording
                </Button>
              </Box>
            )}

            <Stack direction="row" spacing={2} justifyContent="center">
              {!isRecording ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startRecording}
                  startIcon={<MicIcon />}
                  size="large"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={stopRecording}
                  startIcon={<StopIcon />}
                  size="large"
                >
                  Stop Recording
                </Button>
              )}

              {recordedAudio && !isRecording && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={analyzeRecording}
                    startIcon={<AnalyticsIcon />}
                  >
                    Analyze Audio
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<RestartAltIcon />}
                  >
                    Clear Recording
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </TabPanel>

        {/* Audio File Upload Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {!selectedAudioFile ? (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Drag and drop an audio file here, or
                </Typography>
                <input
                  type="file"
                  onChange={handleAudioFileChange}
                  style={{ display: "none" }}
                  ref={audioInputRef}
                  accept=".mp3,.wav,.m4a,.aac,.ogg"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => audioInputRef.current?.click()}
                  startIcon={<AudioFileIcon />}
                >
                  Select Audio File
                </Button>
                <Typography
                  variant="caption"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  Supported formats: MP3, WAV, M4A, AAC, OGG
                </Typography>
              </>
            ) : (
              <Box sx={{ py: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Selected audio file:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  {selectedAudioFile.name}
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
                    onClick={handleAudioFileSubmit}
                    startIcon={<SendIcon />}
                  >
                    Upload & Analyze
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};
