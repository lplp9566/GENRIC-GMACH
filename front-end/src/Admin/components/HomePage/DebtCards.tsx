import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { formatILS } from "./HomePage";

type Props = { monthlyDebt: number; loansDebt: number };

const DebtCards: React.FC<Props> = ({ monthlyDebt, loansDebt }) => {
  const cards = [
    {
      title: "חוב בדמי חבר",
      value: monthlyDebt,
      debtBg: "linear-gradient(135deg, #ff3b5c, #ff7a59)",
      okBg: "linear-gradient(135deg, #1dbf73, #6ee7b7)",
    },
    {
      title: "חוב בהלוואות",
      value: loansDebt,
      debtBg: "linear-gradient(135deg, #ff2d55, #b5179e)",
      okBg: "linear-gradient(135deg, #1dbf73, #6ee7b7)",
    },
  ];

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 3 }}
      justifyContent="center"
      sx={{ mt: { xs: 2, sm: 3 } }}
    >
      {cards.map((c) => {
        const hasDebt = c.value > 0;

        return (
          <Grid item xs={12} sm={6} md={4} key={c.title}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 4,         
                background: hasDebt ? c.debtBg : c.okBg,
                color: "#fff",
                boxShadow: "0 14px 32px rgba(0,0,0,0.25)",
                position: "relative",
                overflow: "hidden",
                textAlign: "center",     
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  opacity: 0.12,
                  transform: "scale(2.2)",
                  pointerEvents: "none",
                }}
              >
              </Box>

              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 96, sm: 120 }, 
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                }}
              >
                <Typography variant="subtitle1" fontWeight={900}>
                  {c.title}
                </Typography>

                <Typography
                  variant="h4"          
                  fontWeight={1000}
                  sx={{ lineHeight: 1, fontSize: { xs: 22, sm: 28 } }}
                >
                  {hasDebt ? formatILS(c.value) : "אין חוב"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DebtCards;

