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
        bgcolor: "#FFFFFF",
        // רוחב גמיש לפי מסך
        width: {
          xs: "100%",   // מובייל: תופס את כל הרוחב
          sm: "80%",    // טאבלט קטן: 80%
          md: "60%",    // טאבלט/דסקטופ קטן: 60%
          lg: "40%",    // דסקטופ רגיל ומעלה: 40%
        },
        mx: "auto", // מרכז אופקית
        dir: "rtl",
      }}
    >
      <Stack spacing={3}>
        {/* שורת הכותרת */}
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

        {/* שורת הכפתורים */}
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
              width: { xs: "100%", sm: "auto" }, // מלא במובייל
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
              width: { xs: "100%", sm: "auto" }, // מלא במובייל
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
