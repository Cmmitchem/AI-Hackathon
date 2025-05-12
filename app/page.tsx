// "use client";

// import Image from "next/image";
// import illuminatiBackground from "../public/IlluminatiBackground.jpg";
// import { Box, Button, Container, Typography } from "@mui/material";
// import { useState, useEffect, useRef } from "react";
// import { DocumentUploader } from "./_components/DocumentUploader";
// import { DocumentSummary } from "./_components/DocumentSummary";
// import { UserProfile } from "./_components/UserProfile";
// import { useSession } from "next-auth/react";
// import { Sidebar } from "./_components/Sidebar";
// import { v4 as uuidv4 } from "uuid";

// // Define the SummaryItem interface
// interface SummaryItem {
//   id: string;
//   fileName: string;
//   summary: string;
//   timestamp: Date;
// }

// export default function Home() {
//   const [summary, setSummary] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [currentFileName, setCurrentFileName] = useState<string>("");
//   const [summaries, setSummaries] = useState<SummaryItem[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
//   const [uploaderKey, setUploaderKey] = useState<string>("initial");
//   const { status } = useSession();

//   // Counter for generic chat names
//   const [chatCounter, setChatCounter] = useState<number>(1);

//   // Load saved summaries from localStorage on initial render
//   useEffect(() => {
//     const savedSummaries = localStorage.getItem("documentSummaries");
//     console.log("Checking localStorage for summaries...");
//     if (savedSummaries) {
//       try {
//         // Parse stored JSON and convert string timestamps back to Date objects
//         const parsedSummaries = JSON.parse(savedSummaries).map((item: any) => ({
//           ...item,
//           timestamp: new Date(item.timestamp),
//         }));
//         setSummaries(parsedSummaries);
//         console.log(
//           "✅ Loaded summaries from localStorage:",
//           parsedSummaries.length,
//           "items"
//         );

//         // Set the chat counter based on existing "Chat" entries
//         const chatEntries = parsedSummaries.filter((item) =>
//           item.fileName.startsWith("Chat v")
//         );
//         if (chatEntries.length > 0) {
//           // Extract the highest number
//           const highestNumber = chatEntries.reduce((max, item) => {
//             const match = item.fileName.match(/Chat v(\d+)/);
//             if (match && parseInt(match[1]) > max) {
//               return parseInt(match[1]);
//             }
//             return max;
//           }, 0);
//           setChatCounter(highestNumber + 1);
//         }
//       } catch (e) {
//         console.error("❌ Error parsing saved summaries:", e);
//       }
//     } else {
//       console.log("No summaries found in localStorage");
//     }
//   }, []);

//   // Save summaries to localStorage whenever they change
//   useEffect(() => {
//     console.log("Summaries state changed, current count:", summaries.length);
//     if (summaries.length > 0) {
//       localStorage.setItem("documentSummaries", JSON.stringify(summaries));
//       console.log("✅ Saved summaries to localStorage");
//     }
//   }, [summaries]);

//   // Function to create a versioned filename if it already exists
//   const createVersionedFilename = (originalName: string) => {
//     // Check if the name already exists in summaries
//     const baseNameMatch = originalName.match(/^(.+?)(?:\s+v(\d+))?$/);

//     if (!baseNameMatch) return originalName; // Should never happen

//     const baseName = baseNameMatch[1];

//     // Count existing versions with the same base name
//     const existingVersions = summaries.filter((item) =>
//       item.fileName.startsWith(baseName)
//     ).length;

//     // If no existing versions, return original name
//     if (existingVersions === 0) return originalName;

//     // Add version number (v2, v3, etc.)
//     return `${baseName} v${existingVersions + 1}`;
//   };

//   // Get a fallback filename if none is provided
//   const getFallbackFilename = () => {
//     const fallbackName = `Chat v${chatCounter}`;
//     setChatCounter((prevCounter) => prevCounter + 1);
//     return fallbackName;
//   };

//   const handleSummaryReceived = (summaryText: string) => {
//     console.log("📝 Summary received, current filename:", currentFileName);

//     // Set the current summary text
//     setSummary(summaryText);
//     setIsLoading(false);

//     // IMPORTANT: Ensure we have a filename, use fallback if needed
//     let fileNameToUse = currentFileName;
//     if (!fileNameToUse || fileNameToUse.trim() === "") {
//       fileNameToUse = getFallbackFilename();
//       console.log("⚠️ No filename available, using fallback:", fileNameToUse);
//       setCurrentFileName(fileNameToUse);
//     }

//     // Create versioned filename if needed
//     const versionedFileName = createVersionedFilename(fileNameToUse);
//     console.log("Using filename:", versionedFileName);

//     // Create the new summary object
//     const newSummary = {
//       id: uuidv4(),
//       fileName: versionedFileName,
//       summary: summaryText,
//       timestamp: new Date(),
//     };

//     console.log("📌 Creating new summary item:", newSummary.fileName);

//     // Update current filename with versioned one
//     setCurrentFileName(versionedFileName);

//     // CRITICAL: Add the new summary to the summaries array
//     // Using a temporary array to ensure state is properly updated
//     const newSummaries = [newSummary, ...summaries];
//     setSummaries(newSummaries);

//     console.log("✅ Updated summaries array, new count:", newSummaries.length);
//   };

//   const handleUploadStarted = (fileName: string) => {
//     console.log("🔄 Upload started for file:", fileName);
//     setIsLoading(true);
//     setSummary("");
//     setError("");

//     // Store the filename - ensure it's not empty
//     if (fileName && fileName.trim() !== "") {
//       setCurrentFileName(fileName);
//     } else {
//       // If empty, don't set it yet - we'll use fallback when summary is received
//       console.log("⚠️ Empty filename received from upload");
//     }
//   };

//   const handleError = (errorMessage: string) => {
//     console.error("❌ Error:", errorMessage);
//     setError(errorMessage);
//     setIsLoading(false);
//   };

//   const handleSummarySelect = (selectedSummary: SummaryItem) => {
//     console.log("🔍 Selected summary from history:", selectedSummary.fileName);
//     setSummary(selectedSummary.summary);
//     setCurrentFileName(selectedSummary.fileName);

//     // On mobile, close the sidebar after selection
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   };

//   const handleNewChat = () => {
//     console.log("🔄 Starting new chat");
//     // Clear all current state for a fresh new chat
//     setSummary("");
//     setCurrentFileName("");
//     setError("");
//     setIsLoading(false);

//     // Force DocumentUploader to reset
//     setUploaderKey(`uploader-${Date.now()}`);

//     // On mobile, close the sidebar after starting new chat
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   // Debug output to console to see what's happening
//   useEffect(() => {
//     console.log("📊 Current state:", {
//       summariesCount: summaries.length,
//       currentFile: currentFileName,
//       hasSummary: !!summary,
//       isLoading,
//       chatCounter,
//     });
//   }, [summaries, currentFileName, summary, isLoading, chatCounter]);

//   if (status === "loading") {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl" disableGutters>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           height: "100%",
//           minHeight: "100vh",
//           overflowY: "auto",
//           position: "relative",
//         }}
//       >
//         <Image
//           src={illuminatiBackground}
//           alt="Illuminati Background"
//           layout="fill"
//           objectFit="cover"
//         />

//         {/* Sidebar */}
//         <Sidebar
//           summaries={summaries}
//           onSummarySelect={handleSummarySelect}
//           onNewChat={handleNewChat}
//           isOpen={isSidebarOpen}
//           toggleSidebar={toggleSidebar}
//         />

//         <UserProfile />

//         <Box
//           sx={{
//             position: "relative",
//             zIndex: 2,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             padding: "100px 20px 40px 20px",
//             width: {
//               xs: "100%",
//               md: `calc(100% - ${isSidebarOpen ? "280px" : "50px"})`,
//             },
//             maxWidth: "800px",
//             marginLeft: {
//               xs: "auto",
//               md: isSidebarOpen ? "280px" : "50px",
//             },
//             marginRight: "auto",
//             transition: "width 0.3s ease, margin-left 0.3s ease",
//           }}
//         >
//           <Typography
//             variant="h1"
//             sx={{
//               top: 0,
//               mt: 2,
//               color: "#fff",
//               fontFamily: "'Oswald', sans-serif",
//               fontWeight: 700,
//               letterSpacing: 2,
//               textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
//               zIndex: 2,
//               transition: "transform 0.3s ease",
//             }}
//           >
//             NoteQA
//           </Typography>
//           <Typography variant="h3" align="center">
//             AI Agent for your notes: Record, Summarize, & Query
//           </Typography>

//           <Box sx={{ marginTop: "80px", width: "100%" }}>
//             <DocumentUploader
//               onSummaryReceived={handleSummaryReceived}
//               onUploadStarted={handleUploadStarted}
//               onError={handleError}
//               key={uploaderKey} // Force re-render when key changes
//             />
//             {isLoading && (
//               <Box sx={{ mt: 8, alignItems: "center" }}>
//                 <Typography variant="h6" color="primary">
//                   Processing your document...
//                 </Typography>
//                 <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
//                 </Box>
//               </Box>
//             )}

//             {error && (
//               <Box sx={{ mt: 4, color: "red", textAlign: "center" }}>
//                 <Typography variant="h6">{error}</Typography>
//               </Box>
//             )}

//             {summary && (
//               <Box sx={{ mt: 6, mb: 6 }}>
//                 <DocumentSummary summary={summary} fileName={currentFileName} />
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </Box>
//     </Container>
//   );
// }

"use client";

import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { DocumentUploader } from "./_components/DocumentUploader";
import { DocumentSummary } from "./_components/DocumentSummary";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Define the SummaryItem interface
interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
}

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [uploaderKey, setUploaderKey] = useState<string>("initial");
  const { status } = useSession();
  const searchParams = useSearchParams();

  // Counter for generic chat names
  const [chatCounter, setChatCounter] = useState<number>(1);

  // Load saved summaries from localStorage on initial render
  useEffect(() => {
    const savedSummaries = localStorage.getItem("documentSummaries");
    if (savedSummaries) {
      try {
        // Parse stored JSON and convert string timestamps back to Date objects
        const parsedSummaries = JSON.parse(savedSummaries).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setSummaries(parsedSummaries);

        // Check if we have a summaryId in the URL
        const summaryId = searchParams.get("summaryId");
        if (summaryId) {
          const selectedSummary = parsedSummaries.find(
            (item) => item.id === summaryId
          );
          if (selectedSummary) {
            setSummary(selectedSummary.summary);
            setCurrentFileName(selectedSummary.fileName);
          }
        }

        // Set the chat counter based on existing "Chat" entries
        const chatEntries = parsedSummaries.filter((item) =>
          item.fileName.startsWith("Chat v")
        );
        if (chatEntries.length > 0) {
          // Extract the highest number
          const highestNumber = chatEntries.reduce((max, item) => {
            const match = item.fileName.match(/Chat v(\d+)/);
            if (match && parseInt(match[1]) > max) {
              return parseInt(match[1]);
            }
            return max;
          }, 0);
          setChatCounter(highestNumber + 1);
        }
      } catch (e) {
        console.error("Error parsing saved summaries:", e);
      }
    }
  }, [searchParams]);

  // Save summaries to localStorage whenever they change
  useEffect(() => {
    if (summaries.length > 0) {
      localStorage.setItem("documentSummaries", JSON.stringify(summaries));
    }
  }, [summaries]);

  // Function to create a versioned filename if it already exists
  const createVersionedFilename = (originalName: string) => {
    // Check if the name already exists in summaries
    const baseNameMatch = originalName.match(/^(.+?)(?:\s+v(\d+))?$/);

    if (!baseNameMatch) return originalName; // Should never happen

    const baseName = baseNameMatch[1];

    // Count existing versions with the same base name
    const existingVersions = summaries.filter((item) =>
      item.fileName.startsWith(baseName)
    ).length;

    // If no existing versions, return original name
    if (existingVersions === 0) return originalName;

    // Add version number (v2, v3, etc.)
    return `${baseName} v${existingVersions + 1}`;
  };

  // Get a fallback filename if none is provided
  const getFallbackFilename = () => {
    const fallbackName = `Chat v${chatCounter}`;
    setChatCounter((prevCounter) => prevCounter + 1);
    return fallbackName;
  };

  const handleSummaryReceived = (summaryText: string) => {
    // Set the current summary text
    setSummary(summaryText);
    setIsLoading(false);

    // IMPORTANT: Ensure we have a filename, use fallback if needed
    let fileNameToUse = currentFileName;
    if (!fileNameToUse || fileNameToUse.trim() === "") {
      fileNameToUse = getFallbackFilename();
      setCurrentFileName(fileNameToUse);
    }

    // Create versioned filename if needed
    const versionedFileName = createVersionedFilename(fileNameToUse);

    // Create the new summary object
    const newSummary = {
      id: uuidv4(),
      fileName: versionedFileName,
      summary: summaryText,
      timestamp: new Date(),
    };

    // Update current filename with versioned one
    setCurrentFileName(versionedFileName);

    // Add the new summary to the summaries array
    const newSummaries = [newSummary, ...summaries];
    setSummaries(newSummaries);
  };

  const handleUploadStarted = (fileName: string) => {
    setIsLoading(true);
    setSummary("");
    setError("");

    // Store the filename - ensure it's not empty
    if (fileName && fileName.trim() !== "") {
      setCurrentFileName(fileName);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleNewChat = () => {
    // Clear all current state for a fresh new chat
    setSummary("");
    setCurrentFileName("");
    setError("");
    setIsLoading(false);

    // Force DocumentUploader to reset
    setUploaderKey(`uploader-${Date.now()}`);
  };

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </Box>
    );
  }

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
        NoteQA
      </Typography>
      <Typography variant="h3" align="center">
        AI Agent for your notes: Record, Summarize, & Query
      </Typography>

      <Box sx={{ marginTop: "80px", width: "100%" }}>
        <DocumentUploader
          onSummaryReceived={handleSummaryReceived}
          onUploadStarted={handleUploadStarted}
          onError={handleError}
          key={uploaderKey} // Force re-render when key changes
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
            <DocumentSummary summary={summary} fileName={currentFileName} />
          </Box>
        )}
      </Box>
    </>
  );
}
