import { Box, Typography } from "@mui/material";
interface DocumentSummaryProps {
  summary: string;
}
export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  summary,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "800px",
        padding: 2,
        backgroundColor: "#5C6060",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Document Summary
      </Typography>
      <Typography variant="body1">{summary}</Typography>
    </Box>
  );
};
