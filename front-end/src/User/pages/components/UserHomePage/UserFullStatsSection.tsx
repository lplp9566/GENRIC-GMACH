import { Grid, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import { formatILS } from "../../../../Admin/components/HomePage/HomePage";

type StatCard = {
  title: string;
  value: number | null | undefined;
  detail: string;
  kind: "money" | "count";
};

type Props = {
  cards: StatCard[];
  surface: string;
  softBorder: string;
};

const UserFullStatsSection = ({ cards, surface, softBorder }: Props) => (
  <>
    <SectionTitle>הנתונים המלאים</SectionTitle>

    <Grid container spacing={{ xs: 2, md: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} key={card.title}>
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
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={900}>
                {card.title}
              </Typography>

              <Typography variant="h6" fontWeight={900}>
                {card.value == null
                  ? "לא הוגדר"
                  : card.kind === "count"
                  ? Number(card.value ?? 0).toLocaleString("he-IL")
                  : formatILS(card.value)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {card.detail}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </>
);

export default UserFullStatsSection;
