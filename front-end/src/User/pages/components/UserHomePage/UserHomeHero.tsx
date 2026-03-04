import { Box, Button, Paper, Stack, Typography } from "@mui/material";
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
      p: { xs: 2.5, md: 4 },
      borderRadius: 6,
      background: isDark
        ? "linear-gradient(135deg, #0f172a 0%, #111827 45%, #0b3a3e 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #eff6ff 45%, #ecfeff 100%)",
      color: isDark ? "#f8fafc" : "#0f172a",
      position: "relative",
      overflow: "hidden",
      border: softBorder,
      boxShadow: isDark
        ? "0 24px 50px rgba(2,6,23,0.45)"
        : "0 24px 50px rgba(15,23,42,0.12)",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(45,212,191,0.18), transparent 70%)"
          : "radial-gradient(circle, rgba(14,165,233,0.18), transparent 70%)",
        top: -220,
        left: -140,
      }}
    />
    <Box
      sx={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(250,204,21,0.16), transparent 70%)"
          : "radial-gradient(circle, rgba(16,185,129,0.16), transparent 70%)",
        bottom: -170,
        right: -80,
      }}
    />

    <Stack spacing={2.4} position="relative" zIndex={1} alignItems="center">
      <Stack spacing={1} sx={{ width: "100%", maxWidth: 860 }} alignItems="center">
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{ letterSpacing: "-0.5px", textAlign: "center", width: "100%" }}
        >
          ברוך הבא {userName}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ opacity: 0.88, maxWidth: 760, textAlign: "center", width: "100%" }}
        >
          מצב חשבון עדכני, חיובים קרובים וכל הנתונים החשובים במקום אחד.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 1.25 }}
        flexWrap="wrap"
        useFlexGap
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%", maxWidth: 860, mx: "auto" }}
      >
        <Button
          variant="contained"
          onClick={onLoanRequest}
          sx={{
            borderRadius: 999,
            px: 3,
            minWidth: 148,
            height: 46,
            fontWeight: 900,
            bgcolor: accent,
            color: "#fff",
            boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.35)" : "0 8px 20px rgba(15,23,42,0.18)",
            "&:hover": {
              bgcolor: accent,
              transform: "translateY(-1px)",
            },
          }}
        >
          בקשת הלוואה
        </Button>

        <Button
          variant="contained"
          onClick={onOpenRegulations}
          sx={{
            borderRadius: 999,
            px: 3,
            minWidth: 148,
            height: 46,
            fontWeight: 900,
            bgcolor: "#0ea5e9",
            color: "#fff",
            boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.35)" : "0 8px 20px rgba(15,23,42,0.18)",
            "&:hover": { bgcolor: "#0284c7", transform: "translateY(-1px)" },
          }}
        >
          תקנון הגמ"ח
        </Button>

        <Button
          variant="contained"
          onClick={onDonate}
          sx={{
            borderRadius: 999,
            px: 3,
            minWidth: 148,
            height: 46,
            fontWeight: 900,
            bgcolor: "#22c55e",
            color: "#fff",
            boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.35)" : "0 8px 20px rgba(15,23,42,0.18)",
            "&:hover": { bgcolor: "#16a34a", transform: "translateY(-1px)" },
          }}
        >
          תרומה
        </Button>

        <Button
          component={RouterLink}
          to="/u/profile"
          variant="contained"
          sx={{
            borderRadius: 999,
            px: 2.2,
            minWidth: 148,
            height: 46,
            fontWeight: 900,
            bgcolor: "#6366f1",
            color: "#fff",
            boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.35)" : "0 8px 20px rgba(15,23,42,0.18)",
            "&:hover": { bgcolor: "#4f46e5", transform: "translateY(-1px)" },
          }}
        >
          לפרופיל האישי
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

export default UserHomeHero;
