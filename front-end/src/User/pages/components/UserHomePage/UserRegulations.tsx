import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";

type Props = {
  surface: string;
  softBorder: string;
  accent: string;
  onOpenRegulations: () => void;
};

const UserRegulations = ({ surface, softBorder, accent, onOpenRegulations }: Props) => (
  <>
    <SectionTitle>תקנון ונהלים</SectionTitle>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: surface,
        border: softBorder,
        backdropFilter: "blur(6px)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <Box flex={1}>
            <Typography variant="h6" fontWeight={900}>
              רגולציה ונהלים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              כללי הגמ"ח מוצגים כאן וניתן לצפות בתקנון.
            </Typography>
          </Box>
          <Button variant="contained" disabled sx={{ borderRadius: 3, fontWeight: 900, height: 44 }}>
            בקרוב: מסמכים
          </Button>
        </Stack>
        <Divider />
        <Box textAlign={{ xs: "center", md: "left" }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: 3,
              fontWeight: 900,
              bgcolor: accent,
              "&:hover": { bgcolor: accent },
            }}
            onClick={onOpenRegulations}
          >
            תקנון הגמ"ח
          </Button>
        </Box>
      </Stack>
    </Paper>
  </>
);

export default UserRegulations;
