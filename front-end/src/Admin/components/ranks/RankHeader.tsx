import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
interface RankHeaderProps {
  handleAddOpen: () => void;
  handleManageOpen: () => void;
}
const RankHeader: React.FC<RankHeaderProps> = ({ handleAddOpen, handleManageOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        width: "40%",
        mx: "auto",
        dir: "rtl",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" align="center" fontWeight={600}>
            ניהול דרגות במערכת{" "}
          </Typography>
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/color/48/rank.png"
            alt="loan"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleAddOpen()}
            sx={{
              backgroundColor: "green",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgb(26, 29, 27)",
              },
            }}
          >
            הוסף דרגה
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleManageOpen()}
            sx={{
              borderColor: "#2a8c82",
              color: "#2a8c82",
              "&:hover": {
                borderColor: "#1b5e20",
                color: "#1b5e20",
              },
            }}
          >
            ניהול דרגה
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default RankHeader;
