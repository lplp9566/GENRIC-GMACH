
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotAdmin() {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <Typography variant="h4" color="error">
הדף בבניה 🏗️
      </Typography>

      <Typography variant="body1">
      בקרוב ...
      </Typography>

      <Button variant="contained" onClick={() => navigate("/")}>
        חזרה לדף התחברות
      </Button>
    </Box>
  );
}
