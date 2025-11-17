import { Box, Typography } from "@mui/material";

export default function NoWarehouseScreen() {
  return (
    <Box
      sx={{
        p: 6,
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 4,
          color: "white",
          boxShadow: "0 20px 60px rgba(102, 126, 234, 0.4)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          ⚠️ No Warehouse Selected
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Please select a warehouse to continue
        </Typography>
      </Box>
    </Box>
  );
}
