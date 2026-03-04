import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  userName: string;
  isDark: boolean;
  accent: string;
  softBorder: string;
  onLoanRequest: () => void;
  onDonate: () => void;
  onOpenRegulations: () => void;
};

const UserHomeHero = ({
  userName,
  isDark,
  accent,
  softBorder,
  onLoanRequest,
  onDonate,
  onOpenRegulations,
}: Props) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 4 },
      borderRadius: 5,
      background: isDark
        ? "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))"
        : "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,245,249,0.96))",
      color: isDark ? "#f8fafc" : "#0f172a",
      position: "relative",
      overflow: "hidden",
      border: softBorder,
    }}
  >
    <Box
      sx={{
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.08)",
        top: -140,
        left: -100,
      }}
    />
    <Box
      sx={{
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 80,
        bgcolor: "rgba(255,255,255,0.12)",
        bottom: -80,
        right: -40,
        transform: "rotate(12deg)",
      }}
    />

    <Stack spacing={1.5} position="relative" zIndex={1}>

      <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
        ברוך הבא{` ${userName}`}
      </Typography>

      <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 720 }}>
        הדרגה שלך, החיובים הקרובים, הפקדות, חובות ונתונים מלאים — הכל במקום אחד.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          component={RouterLink}
          to="/u/profile"
          variant="contained"
          sx={{
            borderRadius: 3,
            fontWeight: 900,
            bgcolor: accent,
            color: "#fff",
            "&:hover": { bgcolor: accent },
          }}
        >
          פרופיל אישי
        </Button>
        <Button
          variant="outlined"
          onClick={onDonate}
          sx={{
            borderRadius: 3,
            fontWeight: 900,
          }}
        >
          תרומה
        </Button>
        <Button
          variant="outlined"
          onClick={onLoanRequest}
          sx={{
            borderRadius: 3,
            fontWeight: 900,
          }}
        >
          בקשת הלוואה
        </Button>
        <Button
          variant="outlined"
          onClick={onOpenRegulations}
          sx={{
            borderRadius: 3,
            fontWeight: 900,
          }}
        >
          תקנון הגמ"ח
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

export default UserHomeHero;
