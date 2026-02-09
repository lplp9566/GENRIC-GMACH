import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";

interface RankHeaderProps {
  handleAddOpen: () => void;
  handleManageOpen: () => void;
}

const RankHeader: React.FC<RankHeaderProps> = ({ handleAddOpen, handleManageOpen }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        // bgcolor: "#FFFFFF",
        width: {
          xs: "100%",   
          sm: "80%",   
          md: "60%",   
          lg: "40%",    
        },
        mx: "auto", 
        dir: "rtl",
      }}
    >
      <Stack spacing={3}>
        <Box
          component={Stack}
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={600} textAlign="center">
            ניהול דרגות במערכת
          </Typography>
          <Box
            component="img"
            src="https://img.icons8.com/color/48/rank.png"
            alt="rank icon"
            sx={{ width: 48, height: 48 }}
          />
        </Box>

        <Box
          component={Stack}
          direction={isXs ? "column" : "row"}
          spacing={2}
          justifyContent= {isXs? "center" : "space-between"}
          alignItems="center"
        >
          <Button
            variant="contained"
            onClick={handleAddOpen}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              width: { xs: "100%", sm: "auto" }, 
              "&:hover": {
                bgcolor: "#1f645f",
              },
            }}
          >
            הוסף דרגה
          </Button>

          <Button
            variant="outlined"
            onClick={handleManageOpen}
            sx={{
              borderColor: "#2a8c82",
              color: "#2a8c82",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                borderColor: "#1f645f",
                color: "#1f645f",
              },
            }}
          >
            ניהול דרגות
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default RankHeader;
