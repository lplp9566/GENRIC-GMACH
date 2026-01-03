import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { FC, useMemo } from "react";

interface KpiRowExpensesProps {
  view: "split" | "left" | "right";
  totalExpenses: number;   // כמה רשומות אחרי פילטר
  totalAmount: number;     // סכום ההוצאות אחרי פילטר
}

const KpiRowExpenses: FC<KpiRowExpensesProps> = ({
  totalExpenses,
  totalAmount,
  view,
}) => {
  const money = (n: number) =>
    n.toLocaleString("he-IL", { style: "currency", currency: "ILS" });

  const amountSx = useMemo(
    () => ({
      fontWeight: view === "split" ? 650 : 800,
      fontSize:
        view === "split"
          ? "clamp(1.15rem, 2.2vw, 2.1rem)"
          : "clamp(1.35rem, 2.8vw, 2.6rem)",
      lineHeight: 1.15,
      direction: "ltr" as const,
      textAlign: "center" as const,
      whiteSpace: "normal" as const,
      overflowWrap: "anywhere" as const,
      wordBreak: "break-word" as const,
      fontVariantNumeric: "tabular-nums" as const,
    }),
    [view]
  );

  const countSx = useMemo(
    () => ({
      fontWeight: 800,
      fontSize:
        view === "split"
          ? "clamp(1.3rem, 3vw, 2.4rem)"
          : "clamp(1.6rem, 3.5vw, 2.8rem)",
      lineHeight: 1.1,
      textAlign: "center" as const,
      direction: "ltr" as const,
      whiteSpace: "normal" as const,
      overflowWrap: "anywhere" as const,
      fontVariantNumeric: "tabular-nums" as const,
    }),
    [view]
  );

  return (
    <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center">
      {/* סה"כ הוצאות */}
      <Grid item xs={12} sm={6} md={8}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" color="text.secondary">
              סה״כ הוצאות
            </Typography>
            <Typography sx={amountSx}>
              <Box component="span" sx={{ color: "error.main" }}>
                {money(totalAmount)}
              </Box>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* סה"כ פעולות */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" color="text.secondary">
              סה״כ פעולות
            </Typography>
            <Typography sx={countSx}>
              {Number(totalExpenses).toLocaleString("he-IL")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default KpiRowExpenses;
