import { Box, Typography, Chip } from "@mui/material";
import Description from "@mui/icons-material/Description";

interface DocumentSummaryProps {
  summary: string;
  fileName?: string;
}
export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  summary,
  fileName,
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Document Summary
        </Typography>
        {fileName && (
          <Chip
            icon={<Description />}
            label={fileName}
            sx={{ ml: 2, backgroundColor: "rgba(255,255,255,0.2)" }}
          ></Chip>
        )}
      </Box>
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        {summary}
      </Typography>
    </Box>
  );
};
