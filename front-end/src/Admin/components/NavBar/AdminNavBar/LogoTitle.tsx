import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const LogoTitle: React.FC = () => {
const logoUrl = import.meta.env.VITE_LOGO_URL

  return(
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        background: "#FFF",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        width: 48,
        boxShadow: "0 2px 5px rgba(0,0,0,.2)",
      }}
    >
      <img src= {logoUrl} alt="לוגו" style={{ height: 36 }} />
    </Box>
    <Typography
      variant="h6"
      component={Link}
      to="/"
      sx={{ color: "#FFF", textDecoration: "none", fontWeight: 700 }}
    >
      אהבת חסד
    </Typography>
  </Box>
  )
};
