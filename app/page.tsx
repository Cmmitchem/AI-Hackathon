// "use client";

// import { Box, Typography, Button } from "@mui/material";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { DocumentUploader } from "./_components/DocumentUploader";
// import { DocumentSummary } from "./_components/DocumentSummary";
// import { ChatInterface } from "./_components/ChatInterface";
// import { useSession } from "next-auth/react";
// import { useSearchParams } from "next/navigation";
// import { v4 as uuidv4 } from "uuid";

// // Define the Message interface
// interface Message {
//   sender: "user" | "assistant";
//   text: string;
//   timestamp: Date;
// }

// // Update the SummaryItem interface to include chat messages and type
// interface SummaryItem {
//   id: string;
//   fileName: string;
//   summary: string;
//   timestamp: Date;
//   messages?: Message[];
//   type: "file" | "chat"; // Add type to distinguish between files and chats
// }

// export default function Home() {
//   const [summary, setSummary] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [currentFileName, setCurrentFileName] = useState<string>("");
//   const [summaries, setSummaries] = useState<SummaryItem[]>([]);
//   const [uploaderKey, setUploaderKey] = useState<string>("initial");
//   const [currentSummaryId, setCurrentSummaryId] = useState<string>("");
//   const [chatMessages, setChatMessages] = useState<Message[]>([]);
//   const [showChat, setShowChat] = useState<boolean>(false);
//   const [showUploader, setShowUploader] = useState<boolean>(false);
//   const [currentItemType, setCurrentItemType] = useState<"file" | "chat" | "">(
//     ""
//   );
//   const { status } = useSession();
//   const searchParams = useSearchParams();

//   // Counter for generic chat names
//   const [chatCounter, setChatCounter] = useState<number>(1);

//   // Load saved summaries from localStorage on initial render
//   useEffect(() => {
//     const savedSummaries = localStorage.getItem("documentSummaries");
//     if (savedSummaries) {
//       try {
//         const parsedSummaries = JSON.parse(savedSummaries).map((item: any) => ({
//           ...item,
//           timestamp: new Date(item.timestamp),
//           messages: item.messages
//             ? item.messages.map((msg: any) => ({
//                 ...msg,
//                 timestamp: new Date(msg.timestamp),
//               }))
//             : [],
//           // Ensure type property exists for backward compatibility
//           type: item.type || "file",
//         }));
//         setSummaries(parsedSummaries);

//         // Check if we have a summaryId in the URL
//         const summaryId = searchParams.get("summaryId");
//         const action = searchParams.get("action");

//         if (summaryId) {
//           const selectedSummary = parsedSummaries.find(
//             (item) => item.id === summaryId
//           );
//           if (selectedSummary) {
//             setSummary(selectedSummary.summary || "");
//             setCurrentFileName(selectedSummary.fileName);
//             setCurrentSummaryId(selectedSummary.id);
//             setChatMessages(selectedSummary.messages || []);
//             // Set the current item type
//             setCurrentItemType(selectedSummary.type || "file");

//             // Show the appropriate interface based on item type and action
//             if (selectedSummary.type === "chat") {
//               setShowChat(true);
//               setShowUploader(false);
//             } else {
//               // For files, show the document summary if it exists
//               if (selectedSummary.summary) {
//                 // Don't automatically show chat for documents - this is the key change
//                 setShowChat(false);
//                 setShowUploader(false);
//               } else if (action === "upload") {
//                 // Show uploader if specifically requested
//                 setShowUploader(true);
//                 setShowChat(false);
//               } else {
//                 // Default to showing the uploader for files without summaries
//                 setShowUploader(true);
//                 setShowChat(false);
//               }
//             }
//           } else {
//             // Clear state if summaryId is invalid
//             setSummary("");
//             setCurrentFileName("");
//             setCurrentSummaryId("");
//             setChatMessages([]);
//             setShowChat(false);
//             setShowUploader(false);
//             setCurrentItemType("");
//           }
//         } else {
//           // No summaryId means we should show a fresh state
//           console.log("No summaryId, clearing state");
//           setSummary("");
//           setCurrentFileName("");
//           setCurrentSummaryId("");
//           setChatMessages([]);
//           setShowChat(false);
//           setShowUploader(false);
//           setCurrentItemType("");
//         }
//       } catch (e) {
//         console.error("Error parsing saved summaries:", e);
//       }
//     }
//   }, [searchParams]);

//   // Save summaries to localStorage whenever they change
//   useEffect(() => {
//     if (summaries.length > 0) {
//       localStorage.setItem("documentSummaries", JSON.stringify(summaries));
//     }

//     const event = new CustomEvent("summariesUpdated", { detail: summaries });
//     window.dispatchEvent(event);
//   }, [summaries]);

//   // Listen for custom events from Sidebar component
//   useEffect(() => {
//     const handleNewChatRequested = (event: CustomEvent) => {
//       if (event.detail && event.detail.name) {
//         setCurrentFileName(event.detail.name);
//       }
//     };

//     const handleNewDocumentRequested = (event: CustomEvent) => {
//       if (event.detail && event.detail.name) {
//         setCurrentFileName(event.detail.name);
//       }
//     };

//     window.addEventListener(
//       "newChatRequested",
//       handleNewChatRequested as EventListener
//     );

//     window.addEventListener(
//       "newDocumentRequested",
//       handleNewDocumentRequested as EventListener
//     );

//     return () => {
//       window.removeEventListener(
//         "newChatRequested",
//         handleNewChatRequested as EventListener
//       );
//       window.removeEventListener(
//         "newDocumentRequested",
//         handleNewDocumentRequested as EventListener
//       );
//     };
//   }, []);

//   // Function to handle chat messages and update the summary item
//   const handleChatMessages = (messages: Message[]) => {
//     setChatMessages(messages);

//     // Update the current summary with chat messages
//     if (currentSummaryId) {
//       const updatedSummaries = summaries.map((item) =>
//         item.id === currentSummaryId ? { ...item, messages: messages } : item
//       );

//       setSummaries(updatedSummaries);
//     }
//   };

//   // Function to create a versioned filename if it already exists
//   const createVersionedFilename = (originalName: string) => {
//     // Check if the name already exists in summaries
//     const baseNameMatch = originalName.match(/^(.+?)(?:\\s+v(\\d+))?$/);

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

//   const getFirstSentenceFromSummary = (summary: string) => {
//     const match = summary.match(/^.*?[.!?](?:\s|$)/);
//     if (match && match[0]) {
//       let sentence = match[0].trim();
//       if (sentence.length > 30) {
//         sentence = sentence.substring(0, 27) + "...";
//       }
//       return sentence;
//     }
//     return `Summary ${new Date().toLocaleDateString()}`;
//   };

//   // const handleSummaryReceived = (summaryText: string) => {
//   //   // Set the current summary text
//   //   setSummary(summaryText);
//   //   setIsLoading(false);

//   //   // CHANGE: Don't automatically show chat after summary is received
//   //   setShowChat(false);
//   //   setShowUploader(false);

//   //   // IMPORTANT: Ensure we have a filename, use fallback if needed
//   //   let fileNameToUse = currentFileName;
//   //   if (!fileNameToUse || fileNameToUse.trim() === "") {
//   //     fileNameToUse = getFirstSentenceFromSummary(summaryText);
//   //   }

//   //   // Create versioned filename if needed
//   //   const versionedFileName = createVersionedFilename(fileNameToUse);

//   //   // Update the existing summary if we have a currentSummaryId
//   //   if (currentSummaryId) {
//   //     const updatedSummaries = summaries.map((item) =>
//   //       item.id === currentSummaryId
//   //         ? {
//   //             ...item,
//   //             summary: summaryText,
//   //             fileName: versionedFileName,
//   //             timestamp: new Date(),
//   //           }
//   //         : item
//   //     );

//   //     setSummaries(updatedSummaries);

//   //     // Update current filename with versioned one
//   //     setCurrentFileName(versionedFileName);
//   //   } else {
//   //     // Create a new summary if no currentSummaryId
//   //     const newSummaryId = uuidv4();
//   //     const newSummary = {
//   //       id: newSummaryId,
//   //       fileName: versionedFileName,
//   //       summary: summaryText,
//   //       timestamp: new Date(),
//   //       messages: [], // Initialize with empty messages array
//   //       type: "file" as const, // Mark as file type
//   //     };

//   //     // Set current summary ID
//   //     setCurrentSummaryId(newSummaryId);
//   //     setChatMessages([]); // Clear any previous chat messages

//   //     // Update current filename with versioned one
//   //     setCurrentFileName(versionedFileName);

//   //     // Add the new summary to the summaries array
//   //     const newSummaries = [newSummary, ...summaries];
//   //     setSummaries(newSummaries);
//   //   }

//   //   setUploaderKey(`uploader-summary-${Date.now()}`);
//   // };
//   const handleSummaryReceived = (summaryText: string) => {
//     // Set the current summary text
//     setSummary(summaryText);
//     setIsLoading(false);
//     setShowChat(false);
//     setShowUploader(false);

//     // Use the current file name as entered by the user
//     const fileNameToUse = currentFileName;

//     // Update the existing summary if we have a currentSummaryId
//     if (currentSummaryId) {
//       const updatedSummaries = summaries.map((item) =>
//         item.id === currentSummaryId
//           ? {
//               ...item,
//               summary: summaryText,
//               fileName: fileNameToUse,
//               timestamp: new Date(),
//             }
//           : item
//       );

//       setSummaries(updatedSummaries);
//       setCurrentFileName(fileNameToUse);
//     } else {
//       // Create a new summary if no currentSummaryId
//       const newSummaryId = uuidv4();
//       const newSummary = {
//         id: newSummaryId,
//         fileName: fileNameToUse,
//         summary: summaryText,
//         timestamp: new Date(),
//         messages: [], // Initialize with empty messages array
//         type: "file" as const, // Mark as file type
//       };

//       // Set current summary ID
//       setCurrentSummaryId(newSummaryId);
//       setChatMessages([]); // Clear any previous chat messages

//       // Update current filename
//       setCurrentFileName(fileNameToUse);

//       // Add the new summary to the summaries array
//       const newSummaries = [newSummary, ...summaries];
//       setSummaries(newSummaries);
//     }

//     setUploaderKey(`uploader-summary-${Date.now()}`);
//   };

//   const handleUploadStarted = (fileName: string) => {
//     setIsLoading(true);
//     setSummary("");

//     setError("");
//     setShowChat(false); // Hide chat while processing

//     // Store the filename - ensure it's not empty
//     if (fileName && fileName.trim() !== "") {
//       setCurrentFileName(fileName);
//     }
//   };

//   const handleError = (errorMessage: string) => {
//     setError(errorMessage);
//     setIsLoading(false);
//   };

//   // Determine what to display based on current state
//   const renderContent = () => {
//     if (isLoading) {
//       return (
//         <Box
//           sx={{
//             mt: 8,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Typography variant="h6" color="primary">
//             Processing your document...
//           </Typography>
//           <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
//           </Box>
//         </Box>
//       );
//     }

//     if (error) {
//       return (
//         <Box sx={{ mt: 4, color: "red", textAlign: "center" }}>
//           <Typography variant="h6">{error}</Typography>
//         </Box>
//       );
//     }

//     // For files with summaries, show ONLY the summary (without chat interface)
//     if (currentItemType === "file" && summary) {
//       return (
//         <Box sx={{ display: "flex", mt: 6, mb: 6, justifyContent: "center" }}>
//           <DocumentSummary summary={summary} fileName={currentFileName} />
//         </Box>
//       );
//     }

//     // For files without summaries or when explicitly showing uploader
//     if (currentItemType === "file" && showUploader) {
//       return (
//         <Box sx={{ mt: 8, width: "100%" }}>
//           <Typography variant="h4" align="center" gutterBottom>
//             Upload Your Document
//           </Typography>
//           <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
//             Document name: <strong>{currentFileName}</strong>
//           </Typography>
//           <DocumentUploader
//             onSummaryReceived={handleSummaryReceived}
//             onUploadStarted={handleUploadStarted}
//             onError={handleError}
//             key={uploaderKey}
//           />
//         </Box>
//       );
//     }

//     // For chat-only interfaces

//     if (currentItemType === "chat") {
//       return (
//         <Box
//           sx={{
//             display: "flex",
//             mt: 4,
//             mb: 6,
//             justifyContent: "center",
//             width: "100%",
//           }}
//         >
//           <Box sx={{ width: "100%", maxWidth: "800px" }}>
//             <Typography variant="h4" align="center" gutterBottom>
//               Chat: {currentFileName}
//             </Typography>
//             <ChatInterface
//               onMessageSent={handleChatMessages}
//               initialMessages={chatMessages}
//               documentSummary=""
//               currentSummaryId={currentSummaryId} // Pass the current summary ID
//             />
//           </Box>
//         </Box>
//       );
//     }

//     // Default welcome state when nothing is selected
//     return (
//       <Box sx={{ mt: 8, textAlign: "center" }}>
//         <Typography variant="h4" gutterBottom>
//           Welcome to NoteQA
//         </Typography>
//         <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
//           To get started, select "Analyze New Document" or "Start New Chat" from
//           the sidebar.
//         </Typography>
//       </Box>
//     );
//   };

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
//     <>
//       <Typography
//         variant="h1"
//         sx={{
//           top: 0,
//           mt: 2,
//           color: "#fff",
//           fontFamily: "'Oswald', sans-serif",
//           fontWeight: 700,
//           letterSpacing: 2,
//           textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
//           zIndex: 2,
//           transition: "transform 0.3s ease",
//         }}
//       >
//         NoteQA
//       </Typography>
//       <Typography variant="h3" align="center">
//         AI Agent for your notes: Record, Summarize, & Query
//       </Typography>

//       <Box sx={{ marginTop: "80px", width: "100%" }}>{renderContent()}</Box>
//     </>
//   );
// }

"use client";

import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { DocumentUploader } from "./_components/DocumentUploader";
import { DocumentSummary } from "./_components/DocumentSummary";
import { ChatInterface } from "./_components/ChatInterface";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Define the Message interface
interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// Update the SummaryItem interface to include chat messages and type
interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
  messages?: Message[];
  type: "file" | "chat"; // Add type to distinguish between files and chats
}

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [uploaderKey, setUploaderKey] = useState<string>("initial");
  const [currentSummaryId, setCurrentSummaryId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [currentItemType, setCurrentItemType] = useState<"file" | "chat" | "">(
    ""
  );
  const { status } = useSession();
  const searchParams = useSearchParams();

  // Counter for generic chat names
  const [chatCounter, setChatCounter] = useState<number>(1);

  // Load saved summaries from localStorage on initial render
  useEffect(() => {
    const savedSummaries = localStorage.getItem("documentSummaries");
    if (savedSummaries) {
      try {
        const parsedSummaries = JSON.parse(savedSummaries).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          messages: item.messages
            ? item.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
            : [],
          // Ensure type property exists for backward compatibility
          type: item.type || "file",
        }));
        setSummaries(parsedSummaries);

        // Check if we have a summaryId in the URL
        const summaryId = searchParams.get("summaryId");
        const action = searchParams.get("action");

        if (summaryId) {
          const selectedSummary = parsedSummaries.find(
            (item) => item.id === summaryId
          );
          if (selectedSummary) {
            setSummary(selectedSummary.summary || "");
            setCurrentFileName(selectedSummary.fileName);
            setCurrentSummaryId(selectedSummary.id);
            setChatMessages(selectedSummary.messages || []);
            // Set the current item type
            setCurrentItemType(selectedSummary.type || "file");

            // Show the appropriate interface based on item type and action
            if (selectedSummary.type === "chat") {
              setShowChat(true);
              setShowUploader(false);
            } else {
              // For files, show the document summary if it exists
              if (selectedSummary.summary) {
                // Don't automatically show chat for documents - this is the key change
                setShowChat(false);
                setShowUploader(false);
              } else if (action === "upload") {
                // Show uploader if specifically requested
                setShowUploader(true);
                setShowChat(false);
              } else {
                // Default to showing the uploader for files without summaries
                setShowUploader(true);
                setShowChat(false);
              }
            }
          } else {
            // Clear state if summaryId is invalid
            setSummary("");
            setCurrentFileName("");
            setCurrentSummaryId("");
            setChatMessages([]);
            setShowChat(false);
            setShowUploader(false);
            setCurrentItemType("");
          }
        } else {
          // No summaryId means we should show a fresh state
          console.log("No summaryId, clearing state");
          setSummary("");
          setCurrentFileName("");
          setCurrentSummaryId("");
          setChatMessages([]);
          setShowChat(false);
          setShowUploader(false);
          setCurrentItemType("");
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

    const event = new CustomEvent("summariesUpdated", { detail: summaries });
    window.dispatchEvent(event);
  }, [summaries]);

  // Listen for custom events from Sidebar component
  useEffect(() => {
    const handleNewChatRequested = (event: CustomEvent) => {
      if (event.detail && event.detail.name) {
        setCurrentFileName(event.detail.name);
      }
    };

    const handleNewDocumentRequested = (event: CustomEvent) => {
      if (event.detail && event.detail.name) {
        setCurrentFileName(event.detail.name);
      }
    };

    window.addEventListener(
      "newChatRequested",
      handleNewChatRequested as EventListener
    );

    window.addEventListener(
      "newDocumentRequested",
      handleNewDocumentRequested as EventListener
    );

    return () => {
      window.removeEventListener(
        "newChatRequested",
        handleNewChatRequested as EventListener
      );
      window.removeEventListener(
        "newDocumentRequested",
        handleNewDocumentRequested as EventListener
      );
    };
  }, []);

  // Function to handle chat messages and update the summary item
  const handleChatMessages = (messages: Message[]) => {
    setChatMessages(messages);

    // Update the current summary with chat messages
    if (currentSummaryId) {
      const updatedSummaries = summaries.map((item) =>
        item.id === currentSummaryId ? { ...item, messages: messages } : item
      );

      setSummaries(updatedSummaries);
    }
  };

  // Function to create a versioned filename if it already exists
  const createVersionedFilename = (originalName: string) => {
    // Check if the name already exists in summaries
    const baseNameMatch = originalName.match(/^(.+?)(?:\\s+v(\\d+))?$/);

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

  const getFirstSentenceFromSummary = (summary: string) => {
    const match = summary.match(/^.*?[.!?](?:\s|$)/);
    if (match && match[0]) {
      let sentence = match[0].trim();
      if (sentence.length > 30) {
        sentence = sentence.substring(0, 27) + "...";
      }
      return sentence;
    }
    return `Summary ${new Date().toLocaleDateString()}`;
  };

  const handleSummaryReceived = (summaryText: string) => {
    // Set the current summary text
    setSummary(summaryText);
    setIsLoading(false);
    setShowChat(false);
    setShowUploader(false);

    // Use the current file name as entered by the user
    const fileNameToUse = currentFileName;

    // Update the existing summary if we have a currentSummaryId
    if (currentSummaryId) {
      const updatedSummaries = summaries.map((item) =>
        item.id === currentSummaryId
          ? {
              ...item,
              summary: summaryText,
              fileName: fileNameToUse,
              timestamp: new Date(),
            }
          : item
      );

      setSummaries(updatedSummaries);
      setCurrentFileName(fileNameToUse);
    } else {
      // Create a new summary if no currentSummaryId
      const newSummaryId = uuidv4();
      const newSummary = {
        id: newSummaryId,
        fileName: fileNameToUse,
        summary: summaryText,
        timestamp: new Date(),
        messages: [], // Initialize with empty messages array
        type: "file" as const, // Mark as file type
      };

      // Set current summary ID
      setCurrentSummaryId(newSummaryId);
      setChatMessages([]); // Clear any previous chat messages

      // Update current filename
      setCurrentFileName(fileNameToUse);

      // Add the new summary to the summaries array
      const newSummaries = [newSummary, ...summaries];
      setSummaries(newSummaries);
    }

    setUploaderKey(`uploader-summary-${Date.now()}`);
  };

  const handleUploadStarted = (fileName: string) => {
    setIsLoading(true);
    setSummary("");

    setError("");
    setShowChat(false); // Hide chat while processing

    // Store the filename - ensure it's not empty
    if (fileName && fileName.trim() !== "") {
      setCurrentFileName(fileName);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  // Determine what to display based on current state
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 8,
          }}
        >
          <Typography variant="h6" color="#FFFFFF">
            Processing your document...
          </Typography>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </Box>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ mt: 4, color: "#FF5555", textAlign: "center" }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      );
    }

    // For files with summaries, show the summary
    if (currentItemType === "file" && summary) {
      return (
        <>
          <Box
            sx={{
              display: "flex",
              mt: 6,
              mb: 6,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <DocumentSummary summary={summary} fileName={currentFileName} />
          </Box>
          <Box
            sx={{
              display: "flex",
              mt: 4,
              mb: 6,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowChat(true)}
              sx={{ mb: 2 }}
            >
              Ask Questions About This Document
            </Button>
          </Box>
          {showChat && (
            <Box
              sx={{
                display: "flex",
                mt: 4,
                mb: 6,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <ChatInterface
                onMessageSent={handleChatMessages}
                initialMessages={chatMessages}
                documentSummary={summary}
                currentSummaryId={currentSummaryId} // Pass the current summary ID
              />
            </Box>
          )}
        </>
      );
    }

    // For files without summaries or when explicitly showing uploader
    if (currentItemType === "file" && showUploader) {
      return (
        <Box sx={{ mt: 8, width: "100%" }}>
          <Typography variant="h4" align="center" gutterBottom color="#FFFFFF">
            Upload Your Document
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ mb: 4 }}
            color="#FFFFFF"
          >
            Document name: <strong>{currentFileName}</strong>
          </Typography>
          <DocumentUploader
            onSummaryReceived={handleSummaryReceived}
            onUploadStarted={handleUploadStarted}
            onError={handleError}
            key={uploaderKey}
          />
        </Box>
      );
    }

    // For chat-only interfaces
    if (currentItemType === "chat") {
      return (
        <Box
          sx={{
            display: "flex",
            mt: 4,
            mb: 6,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "800px" }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              color="#FFFFFF"
            >
              Chat: {currentFileName}
            </Typography>
            <ChatInterface
              onMessageSent={handleChatMessages}
              initialMessages={chatMessages}
              documentSummary=""
              currentSummaryId={currentSummaryId} // Pass the current summary ID
            />
          </Box>
        </Box>
      );
    }

    // Default welcome state when nothing is selected
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom color="#FFFFFF">
          Welcome to NoteQA
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }} color="#FFFFFF">
          To get started, select "Analyze New Document" or "Start New Chat" from
          the sidebar.
        </Typography>
      </Box>
    );
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Header Title Area - Centered */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mt: 4,
          mb: 6,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: "#FFFFFF",
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            letterSpacing: 2,
            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          NoteQA
        </Typography>
        <Typography
          variant="h3"
          sx={{
            color: "#FFFFFF",
            textAlign: "center",
            mt: 2,
            maxWidth: "90%", // Prevent extremely long lines on small screens
          }}
        >
          AI Agent for your notes: Record, Summarize, & Query
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          width: "100%",
          mt: 4,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
