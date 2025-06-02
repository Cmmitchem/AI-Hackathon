// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { Box, Container } from "@mui/material";
// import { Sidebar } from "./Sidebar";
// import { UserProfile } from "./UserProfile";
// import { useRouter, useSearchParams } from "next/navigation";
// import AuthGuard from "./AuthGuard";
// import { v4 as uuidv4 } from "uuid";

// interface Message {
//   sender: string;
//   text: string;
//   timestamp: Date;
// }

// interface SummaryItem {
//   id: string;
//   fileName: string;
//   summary: string;
//   timestamp: Date;
//   messages?: Message[];
//   type: "file" | "chat"; // Add type to distinguish between files and chats
// }

// interface AppLayoutProps {
//   children: React.ReactNode;
// }

// export default function AppLayout({ children }: AppLayoutProps) {
//   const [summaries, setSummaries] = useState<SummaryItem[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [chatCounter, setChatCounter] = useState<number>(1);
//   const [documentCounter, setDocumentCounter] = useState<number>(1);
//   const [pendingItemName, setPendingItemName] = useState<string>("");

//   // Use refs to store the stable versions of functions that can be accessed in useEffect
//   const handleNewChatRef = useRef<() => void>();
//   const handleNewDocumentRef = useRef<() => void>();

//   /**
//    * MODIFIED: Handle New Chat function
//    * - Creates a new chat entry immediately
//    * - Redirects to the homepage
//    */
//   const handleNewChat = useCallback(() => {
//     // Make sure we have a name
//     if (!pendingItemName) {
//       console.error("No name provided for new chat");
//       return;
//     }

//     // Create a new empty summary for this chat
//     const newSummary = {
//       id: uuidv4(),
//       fileName: pendingItemName,
//       summary: "",
//       timestamp: new Date(),
//       type: "chat" as const,
//     };

//     // Add the new empty chat to the summaries array and update localStorage
//     const newSummaries = [newSummary, ...summaries];
//     setSummaries(newSummaries);
//     localStorage.setItem("documentSummaries", JSON.stringify(newSummaries));

//     // Dispatch custom event to notify other components
//     const event = new CustomEvent("summariesUpdated", { detail: newSummaries });
//     window.dispatchEvent(event);

//     // Clear the pending name
//     setPendingItemName("");

//     // Navigate to home page with the new summaryId
//     router.push(`/?summaryId=${newSummary.id}`);

//     // On mobile, close the sidebar after starting new chat
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   }, [pendingItemName, router, summaries]);

//   /**
//    * NEW: Handle New Document function
//    * - Creates a new document entry immediately
//    * - Redirects to the homepage for document upload
//    */
//   const handleNewDocument = useCallback(() => {
//     // Make sure we have a name
//     if (!pendingItemName) {
//       console.error("No name provided for new document");
//       return;
//     }

//     // Create a new empty summary for this document
//     const newSummary = {
//       id: uuidv4(),
//       fileName: pendingItemName,
//       summary: "",
//       timestamp: new Date(),
//       type: "file" as const,
//     };

//     // Add the new empty document to the summaries array and update localStorage
//     const newSummaries = [newSummary, ...summaries];
//     setSummaries(newSummaries);
//     localStorage.setItem("documentSummaries", JSON.stringify(newSummaries));

//     // Dispatch custom event to notify other components
//     const event = new CustomEvent("summariesUpdated", { detail: newSummaries });
//     window.dispatchEvent(event);

//     // Clear the pending name
//     setPendingItemName("");

//     // Navigate to home page with the new summaryId
//     router.push(`/?summaryId=${newSummary.id}&action=upload`);

//     // On mobile, close the sidebar after starting new document
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   }, [pendingItemName, router, summaries]);

//   // Update the function refs when the functions change
//   useEffect(() => {
//     handleNewChatRef.current = handleNewChat;
//     handleNewDocumentRef.current = handleNewDocument;
//   }, [handleNewChat, handleNewDocument]);

//   /**
//    * MODIFIED: Load saved summaries from localStorage and listen for updates
//    */
//   useEffect(() => {
//     // Initial load from localStorage
//     const loadSummariesFromStorage = () => {
//       const savedSummaries = localStorage.getItem("documentSummaries");
//       if (savedSummaries) {
//         try {
//           const parsedSummaries = JSON.parse(savedSummaries).map(
//             (item: any) => ({
//               ...item,
//               timestamp: new Date(item.timestamp),
//               messages: item.messages
//                 ? item.messages.map((msg: any) => ({
//                     ...msg,
//                     timestamp: new Date(msg.timestamp),
//                   }))
//                 : [],
//               // Ensure type property exists for backward compatibility
//               type: item.type || "file",
//             })
//           );
//           setSummaries(parsedSummaries);

//           // Set the chat counter based on existing "Chat" entries
//           const chatEntries = parsedSummaries.filter((item) =>
//             item.fileName.startsWith("Chat v")
//           );
//           if (chatEntries.length > 0) {
//             // Extract the highest number
//             const highestNumber = chatEntries.reduce((max, item) => {
//               const match = item.fileName.match(/Chat v(\d+)/);
//               if (match && parseInt(match[1]) > max) {
//                 return parseInt(match[1]);
//               }
//               return max;
//             }, 0);
//             setChatCounter(highestNumber + 1);
//           }

//           // Set the document counter based on existing "Document" entries
//           const documentEntries = parsedSummaries.filter((item) =>
//             item.fileName.startsWith("Document v")
//           );
//           if (documentEntries.length > 0) {
//             // Extract the highest number
//             const highestNumber = documentEntries.reduce((max, item) => {
//               const match = item.fileName.match(/Document v(\d+)/);
//               if (match && parseInt(match[1]) > max) {
//                 return parseInt(match[1]);
//               }
//               return max;
//             }, 0);
//             setDocumentCounter(highestNumber + 1);
//           }
//         } catch (e) {
//           console.error("Error parsing saved summaries:", e);
//         }
//       }
//     };

//     // Load summaries initially
//     loadSummariesFromStorage();

//     // Set up event listener for storage changes
//     window.addEventListener("storage", (event) => {
//       if (event.key === "documentSummaries") {
//         loadSummariesFromStorage();
//       }
//     });

//     // Set up event listener for custom summaries updated event
//     const handleSummariesUpdated = (event: CustomEvent) => {
//       setSummaries(event.detail);
//     };

//     window.addEventListener(
//       "summariesUpdated",
//       handleSummariesUpdated as EventListener
//     );

//     // Set up event listeners for custom new chat and document events
//     const handleNewChatRequested = (event: CustomEvent) => {
//       if (event.detail && event.detail.name) {
//         console.log("Chat name received:", event.detail.name);
//         setPendingItemName(event.detail.name);
//         // Use setTimeout to ensure state is updated before calling the function
//         setTimeout(() => {
//           console.log("Creating new chat with name:", event.detail.name);
//           // Use the ref to avoid the dependency
//           if (handleNewChatRef.current) {
//             handleNewChatRef.current();
//           }
//         }, 0);
//       }
//     };

//     const handleNewDocumentRequested = (event: CustomEvent) => {
//       if (event.detail && event.detail.name) {
//         console.log("Document name received:", event.detail.name);
//         setPendingItemName(event.detail.name);
//         // Use setTimeout to ensure state is updated before calling the function
//         setTimeout(() => {
//           console.log("Creating new document with name:", event.detail.name);
//           // Use the ref to avoid the dependency
//           if (handleNewDocumentRef.current) {
//             handleNewDocumentRef.current();
//           }
//         }, 0);
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

//     // Cleanup
//     return () => {
//       window.removeEventListener("storage", () => {});
//       window.removeEventListener(
//         "summariesUpdated",
//         handleSummariesUpdated as EventListener
//       );
//       window.removeEventListener(
//         "newChatRequested",
//         handleNewChatRequested as EventListener
//       );
//       window.removeEventListener(
//         "newDocumentRequested",
//         handleNewDocumentRequested as EventListener
//       );
//     };
//   }, []); // Remove the dependencies that cause the infinite loop

//   const handleSummarySelect = (selectedSummary: SummaryItem) => {
//     // Navigate to home page and pass the selected summary
//     router.push(`/?summaryId=${selectedSummary.id}`);

//     // On mobile, close the sidebar after selection
//     if (window.innerWidth < 768) {
//       setIsSidebarOpen(false);
//     }
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   return (
//     <AuthGuard>
//       <Container maxWidth="xl" disableGutters>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             height: "100%",
//             minHeight: "100vh",
//             overflowY: "auto",
//             position: "relative",
//             background: "linear-gradient(90deg, #1A6C8D 0%, #952F65 100%)",
//           }}
//         >
//           {/* Sidebar */}
//           <Sidebar
//             summaries={summaries}
//             onSummarySelect={handleSummarySelect}
//             onNewChat={handleNewChat}
//             onNewDocument={handleNewDocument}
//             isOpen={isSidebarOpen}
//             toggleSidebar={toggleSidebar}
//           />

//           <UserProfile />

//           <Box
//             sx={{
//               position: "relative",
//               zIndex: 2,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               padding: "100px 20px 40px 20px",
//               width: {
//                 xs: "100%",
//                 md: `calc(100% - ${isSidebarOpen ? "280px" : "50px"})`,
//               },
//               maxWidth: "1200px",
//               marginLeft: {
//                 xs: "auto",
//                 md: isSidebarOpen ? "280px" : "50px",
//               },
//               marginRight: "auto",
//               transition: "width 0.3s ease, margin-left 0.3s ease",
//             }}
//           >
//             {children}
//           </Box>
//         </Box>
//       </Container>
//     </AuthGuard>
//   );
// }

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { UserProfile } from "./UserProfile";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "./AuthGuard";
import { v4 as uuidv4 } from "uuid";

interface Message {
  sender: string;
  text: string;
  timestamp: Date;
}

interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
  messages?: Message[];
  type: "file" | "chat"; // Add type to distinguish between files and chats
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatCounter, setChatCounter] = useState<number>(1);
  const [documentCounter, setDocumentCounter] = useState<number>(1);
  const [pendingItemName, setPendingItemName] = useState<string>("");

  // Use refs to store the stable versions of functions that can be accessed in useEffect
  const handleNewChatRef = useRef<() => void>();
  const handleNewDocumentRef = useRef<() => void>();

  /**
   * MODIFIED: Handle New Chat function
   * - Creates a new chat entry immediately
   * - Redirects to the homepage
   */
  const handleNewChat = useCallback(() => {
    // Make sure we have a name
    if (!pendingItemName) {
      console.error("No name provided for new chat");
      return;
    }

    // Create a new empty summary for this chat
    const newSummary = {
      id: uuidv4(),
      fileName: pendingItemName,
      summary: "",
      timestamp: new Date(),
      type: "chat" as const,
    };

    // Add the new empty chat to the summaries array and update localStorage
    const newSummaries = [newSummary, ...summaries];
    setSummaries(newSummaries);
    localStorage.setItem("documentSummaries", JSON.stringify(newSummaries));

    // Dispatch custom event to notify other components
    const event = new CustomEvent("summariesUpdated", { detail: newSummaries });
    window.dispatchEvent(event);

    // Clear the pending name
    setPendingItemName("");

    // Navigate to home page with the new summaryId
    router.push(`/?summaryId=${newSummary.id}`);

    // On mobile, close the sidebar after starting new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pendingItemName, router, summaries]);

  /**
   * NEW: Handle New Document function
   * - Creates a new document entry immediately
   * - Redirects to the homepage for document upload
   */
  const handleNewDocument = useCallback(() => {
    // Make sure we have a name
    if (!pendingItemName) {
      console.error("No name provided for new document");
      return;
    }

    // Create a new empty summary for this document
    const newSummary = {
      id: uuidv4(),
      fileName: pendingItemName,
      summary: "",
      timestamp: new Date(),
      type: "file" as const,
    };

    // Add the new empty document to the summaries array and update localStorage
    const newSummaries = [newSummary, ...summaries];
    setSummaries(newSummaries);
    localStorage.setItem("documentSummaries", JSON.stringify(newSummaries));

    // Dispatch custom event to notify other components
    const event = new CustomEvent("summariesUpdated", { detail: newSummaries });
    window.dispatchEvent(event);

    // Clear the pending name
    setPendingItemName("");

    // Navigate to home page with the new summaryId
    router.push(`/?summaryId=${newSummary.id}&action=upload`);

    // On mobile, close the sidebar after starting new document
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pendingItemName, router, summaries]);

  // Update the function refs when the functions change
  useEffect(() => {
    handleNewChatRef.current = handleNewChat;
    handleNewDocumentRef.current = handleNewDocument;
  }, [handleNewChat, handleNewDocument]);

  /**
   * MODIFIED: Load saved summaries from localStorage and listen for updates
   */
  useEffect(() => {
    // Initial load from localStorage
    const loadSummariesFromStorage = () => {
      const savedSummaries = localStorage.getItem("documentSummaries");
      if (savedSummaries) {
        try {
          const parsedSummaries = JSON.parse(savedSummaries).map(
            (item: any) => ({
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
            })
          );
          setSummaries(parsedSummaries);

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

          // Set the document counter based on existing "Document" entries
          const documentEntries = parsedSummaries.filter((item) =>
            item.fileName.startsWith("Document v")
          );
          if (documentEntries.length > 0) {
            // Extract the highest number
            const highestNumber = documentEntries.reduce((max, item) => {
              const match = item.fileName.match(/Document v(\d+)/);
              if (match && parseInt(match[1]) > max) {
                return parseInt(match[1]);
              }
              return max;
            }, 0);
            setDocumentCounter(highestNumber + 1);
          }
        } catch (e) {
          console.error("Error parsing saved summaries:", e);
        }
      }
    };

    // Load summaries initially
    loadSummariesFromStorage();

    // Set up event listener for storage changes
    window.addEventListener("storage", (event) => {
      if (event.key === "documentSummaries") {
        loadSummariesFromStorage();
      }
    });

    // Set up event listener for custom summaries updated event
    const handleSummariesUpdated = (event: CustomEvent) => {
      setSummaries(event.detail);
    };

    window.addEventListener(
      "summariesUpdated",
      handleSummariesUpdated as EventListener
    );

    // Set up event listeners for custom new chat and document events
    const handleNewChatRequested = (event: CustomEvent) => {
      if (event.detail && event.detail.name) {
        console.log("Chat name received:", event.detail.name);
        setPendingItemName(event.detail.name);
        // Use setTimeout to ensure state is updated before calling the function
        setTimeout(() => {
          console.log("Creating new chat with name:", event.detail.name);
          // Use the ref to avoid the dependency
          if (handleNewChatRef.current) {
            handleNewChatRef.current();
          }
        }, 0);
      }
    };

    const handleNewDocumentRequested = (event: CustomEvent) => {
      if (event.detail && event.detail.name) {
        console.log("Document name received:", event.detail.name);
        setPendingItemName(event.detail.name);
        // Use setTimeout to ensure state is updated before calling the function
        setTimeout(() => {
          console.log("Creating new document with name:", event.detail.name);
          // Use the ref to avoid the dependency
          if (handleNewDocumentRef.current) {
            handleNewDocumentRef.current();
          }
        }, 0);
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

    // Cleanup
    return () => {
      window.removeEventListener("storage", () => {});
      window.removeEventListener(
        "summariesUpdated",
        handleSummariesUpdated as EventListener
      );
      window.removeEventListener(
        "newChatRequested",
        handleNewChatRequested as EventListener
      );
      window.removeEventListener(
        "newDocumentRequested",
        handleNewDocumentRequested as EventListener
      );
    };
  }, []); // Remove the dependencies that cause the infinite loop

  const handleSummarySelect = (selectedSummary: SummaryItem) => {
    // Navigate to home page and pass the selected summary
    router.push(`/?summaryId=${selectedSummary.id}`);

    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <AuthGuard>
      {/* Add CssBaseline to remove default margins/padding */}
      <CssBaseline />

      {/* Add GlobalStyles to ensure all text is white */}
      <GlobalStyles
        styles={{
          "html, body": {
            color: "#FFFFFF !important",
          },
          // Override MUI Typography variants to ensure white text everywhere
          ".MuiTypography-root": {
            color: "#FFFFFF !important",
          },
          // Make sure input text is still visible
          "input, textarea, .MuiOutlinedInput-input": {
            color: "#000000 !important",
          },
          // Keep certain things like error messages readable
          ".error-message": {
            color: "#FF0000 !important",
          },
        }}
      />

      {/* Full-width gradient background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(90deg, #1A6C8D 0%, #952F65 100%)",
          zIndex: -1,
        }}
      />

      {/* Main content container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          overflow: "hidden", // Prevent any content from extending beyond
        }}
      >
        {/* Sidebar */}
        <Sidebar
          summaries={summaries}
          onSummarySelect={handleSummarySelect}
          onNewChat={handleNewChat}
          onNewDocument={handleNewDocument}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        <UserProfile />

        {/* Content area - Adjusted for proper centering between sidebar and right edge */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "100px 20px 40px 20px",
            width: {
              xs: "100%",
              md: `calc(100% - ${isSidebarOpen ? "280px" : "50px"})`,
            },
            maxWidth: "1200px",
            marginLeft: {
              xs: "auto",
              md: isSidebarOpen ? "280px" : "50px",
            },
            marginRight: "auto",
            transition: "width 0.3s ease, margin-left 0.3s ease",
          }}
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
