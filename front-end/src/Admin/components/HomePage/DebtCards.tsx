import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatILS } from "./HomePage";

type Props = {
  monthlyDebt: number;
  loansDebt: number;
  monthlyNegtiveBalanceUsers: number;
  loansNegativeCount: number;
};

const DebtCards: React.FC<Props> = ({
  monthlyDebt,
  loansDebt,
  monthlyNegtiveBalanceUsers,
  loansNegativeCount,
}) => {
  const cards = [
    {
      key: "monthly" as const,
      title: "חוב בדמי חבר",
      value: monthlyDebt,
      debtBg: "linear-gradient(135deg, #ff3b5c, #ff7a59)",
      okBg: "linear-gradient(135deg, #1dbf73, #6ee7b7)",
      count: monthlyNegtiveBalanceUsers,
      countLabel: "משתמשים חייבים",
    },
    {
      key: "loans" as const,
      title: "חוב בהלוואות",
      value: loansDebt,
      debtBg: "linear-gradient(135deg, #ff2d55, #b5179e)",
      okBg: "linear-gradient(135deg, #1dbf73, #6ee7b7)",
      count: loansNegativeCount,
      countLabel: "הלוואות בחוב",
    },
    {
      key: "deposits" as const,
      title: "הפקדות",
      value: null,
      debtBg: "linear-gradient(135deg, #334155, #1f2937)",
      okBg: "linear-gradient(135deg, #334155, #1f2937)",
      count: 0,
      countLabel: "נתונים יופיעו בקרוב",
      comingSoon: true,
    },
  ];

  return (
    <Stack spacing={1.2} sx={{ mt: { xs: 2, sm: 3 } }}>
      {cards.map((c) => {
        const hasDebt = Number(c.value ?? 0) > 0;

        return (
          <Paper
            key={c.key}
            elevation={0}
            sx={{
              p: { xs: 1.4, sm: 1.6 },
              borderRadius: 3,
              background: c.comingSoon ? c.okBg : hasDebt ? c.debtBg : c.okBg,
              color: "#fff",
              boxShadow: "0 10px 22px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              minHeight: { xs: 92, sm: 96 },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                opacity: 0.1,
                transform: "scale(2.1)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.35,
              }}
            >
              <Typography variant="subtitle2" fontWeight={900}>
                {c.title}
              </Typography>

              {c.comingSoon ? (
                <Typography
                  variant="body1"
                  fontWeight={800}
                  sx={{ fontSize: { xs: 15, sm: 16 } }}
                >
                  נתונים יופיעו בקרוב
                </Typography>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={1000}
                    sx={{ lineHeight: 1.1, fontSize: { xs: 20, sm: 22 } }}
                  >
                    {hasDebt ? formatILS(c.value) : "אין חוב"}
                  </Typography>
                  {c.count > 0 && (
                    <Typography
                      variant="body1"
                      fontWeight={900}
                      sx={{
                        lineHeight: 1.1,
                        direction: "ltr",
                        fontSize: { xs: 17, sm: 18 },
                      }}
                    >
                      {` ${c.countLabel} ${c.count}`}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default DebtCards;
