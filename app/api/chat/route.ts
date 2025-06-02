import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface DocumentSummary {
  documentName: string;
  summary: string;
  isCurrent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      message,
      documentSummary,
      allSummaries = [],
      currentSummaryId,
    } = data;

    // Check if OpenAI API key is set
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not set - using simulated response mode");
      return simulateResponse(message, documentSummary, allSummaries);
    }

    try {
      // Prepare context with all document summaries
      let systemContent = "";

      if (allSummaries && allSummaries.length > 0) {
        // Format all document summaries for the context
        systemContent = `You are a helpful assistant analyzing multiple documents. Here are summaries of all the documents:\n\n`;

        allSummaries.forEach((doc: DocumentSummary, index: number) => {
          const currentMarker = doc.isCurrent ? " (CURRENT DOCUMENT)" : "";
          systemContent += `DOCUMENT ${index + 1}${currentMarker}: "${
            doc.documentName
          }"\n${doc.summary}\n\n`;
        });

        systemContent += `Please answer questions using information from all these documents, but prioritize information from the CURRENT DOCUMENT when relevant.`;
      } else if (documentSummary) {
        // Fallback to single document summary if allSummaries is not provided
        systemContent = `You are a helpful assistant analyzing a document. Here is the document summary: ${documentSummary}. Please answer questions about this document concisely and accurately.`;
      } else {
        // Generic assistant if no document summaries are provided
        systemContent = `You are a helpful assistant. Please answer questions concisely and accurately.`;
      }

      // Make a real request to OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo", // or whatever model you prefer
          messages: [
            {
              role: "system",
              content: systemContent,
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const aiResponse =
        response.data.choices[0]?.message?.content ||
        "I couldn't generate a response.";
      return NextResponse.json({ response: aiResponse });
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      return simulateResponse(message, documentSummary, allSummaries);
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// Fallback function to generate simulated responses
function simulateResponse(
  message: string,
  documentSummary: string,
  allSummaries: DocumentSummary[] = []
) {
  // Simple response logic based on the question
  let response;
  const question = message.toLowerCase();

  // Message indicating we're looking at multiple documents if available
  let documentsContext = "";
  if (allSummaries && allSummaries.length > 0) {
    documentsContext = `Based on the ${allSummaries.length} documents you've provided, `;
  }

  if (question.includes("summarize") || question.includes("summary")) {
    if (allSummaries && allSummaries.length > 0) {
      // Find the current document if marked
      const currentDoc = allSummaries.find((doc) => doc.isCurrent);
      const summaryToUse = currentDoc
        ? currentDoc.summary
        : allSummaries[0].summary;

      response = `${documentsContext}here's a summary of the current document: ${summaryToUse.substring(
        0,
        150
      )}...`;
    } else if (documentSummary) {
      response = `Here's a summary of the document: ${documentSummary.substring(
        0,
        150
      )}...`;
    } else {
      response = `I don't have any document summaries to work with. Please upload documents first.`;
    }
  } else if (
    question.includes("key points") ||
    question.includes("main points")
  ) {
    response = `${documentsContext}the key points from the document(s) are:\n\n1) First important point extracted from the document(s)\n2) Second critical insight from the content\n3) Third notable finding or conclusion`;
  } else if (question.includes("who")) {
    response = `${documentsContext}the document(s) mention several individuals including team members and stakeholders. Based on the context, they appear to be involved in the project or discussion documented.`;
  } else if (question.includes("when") || question.includes("date")) {
    response = `${documentsContext}the document(s) refer to several timeframes and deadlines. The most prominent dates mentioned relate to project milestones and scheduled meetings.`;
  } else {
    response = `${documentsContext}I can provide some insights related to your question. The document(s) cover topics including project status, team responsibilities, and next steps. Would you like me to elaborate on any specific aspect?`;
  }

  return NextResponse.json({ response });
}
