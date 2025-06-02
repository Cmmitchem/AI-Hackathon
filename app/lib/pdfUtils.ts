// app/lib/pdfUtils.ts
import jsPDF from "jspdf";

export interface SummaryItem {
  id: string;
  fileName: string;
  summary: string;
  timestamp: Date;
  messages?: Message[];
  type: "file" | "chat";
}

export interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export const downloadDocumentSummaryAsPDF = (item: SummaryItem) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 30;

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Document Summary", margin, yPosition);
  yPosition += 15;

  // Document name
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Document: ${item.fileName}`, margin, yPosition);
  yPosition += 10;

  // Date
  pdf.setFontSize(12);
  pdf.text(
    `Generated: ${item.timestamp.toLocaleDateString()} ${item.timestamp.toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += 20;

  // Summary content
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Summary:", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  const summaryLines = pdf.splitTextToSize(item.summary, maxWidth);

  summaryLines.forEach((line: string) => {
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Download the PDF
  const fileName = `${item.fileName.replace(/[^a-z0-9]/gi, "_")}_summary.pdf`;
  pdf.save(fileName);
};

export const downloadChatAsPDF = (item: SummaryItem) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 30;

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Chat Conversation", margin, yPosition);
  yPosition += 15;

  // Chat name
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Chat: ${item.fileName}`, margin, yPosition);
  yPosition += 10;

  // Date
  pdf.setFontSize(12);
  pdf.text(
    `Created: ${item.timestamp.toLocaleDateString()} ${item.timestamp.toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += 20;

  // Messages
  if (item.messages && item.messages.length > 0) {
    item.messages.forEach((message, index) => {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
        pdf.addPage();
        yPosition = 30;
      }

      // Message header (sender and timestamp)
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const sender = message.sender === "user" ? "You" : "Assistant";
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      pdf.text(`${sender} (${timestamp}):`, margin, yPosition);
      yPosition += 8;

      // Message content
      pdf.setFont("helvetica", "normal");
      const messageLines = pdf.splitTextToSize(message.text, maxWidth);

      messageLines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 10; // Space between messages

      // Add a separator line for readability
      if (index < item.messages!.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
      }
    });
  } else {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "italic");
    pdf.text("No messages in this chat.", margin, yPosition);
  }

  // Download the PDF
  const fileName = `${item.fileName.replace(/[^a-z0-9]/gi, "_")}_chat.pdf`;
  pdf.save(fileName);
};
