import React from "react";
import { IDeposit } from "../depositsDto";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

interface DepositDetailsInfoCardProps {
  deposit: IDeposit;
}

const DepositDetailsInfoCard: React.FC<DepositDetailsInfoCardProps> = ({
  deposit,
}) => {
  const depositorName =
    `${deposit.user?.first_name ?? ""} ${deposit.user?.last_name ?? ""}`.trim() ||
    "-";

  const items = [
    {
      label: `הופקד ע"י `,
      value: depositorName,
      color: "text.primary",
    },
    {
      label: "סכום הפקדה ראשוני",
      value: `₪${deposit.initialDeposit.toLocaleString("he-IL")}`,
      color: "#006CF0",
    },
    {
      label: "סכום הפקדה נוכחי",
      value: `₪${deposit.current_balance.toLocaleString("he-IL")}`,
      color: "#007BFF",
    },
    {
      label: "תאריך הפקדה",
      value: deposit.start_date
        ? new Date(deposit.start_date).toLocaleDateString("he-IL")
        : "-",
      color: "text.primary",
    },
    {
      label: "תאריך החזרה",
      value: deposit.end_date
        ? new Date(deposit.end_date).toLocaleDateString("he-IL")
        : "-",
      color: "text.primary",
    },
    {
      label: "סטטוס",
      value: (
        <span style={{ color: deposit.isActive ? "green" : "red", fontWeight: 700 }}>
          {deposit.isActive ? "פעיל" : "סגור"}
        </span>
      ),
      color: "",
    },
  ];

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, p: 3 }}>
      <CardContent>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 3, textAlign: "center" }}
        >
          פרטי הפקדה כלליים
        </Typography>

        <Grid container spacing={3}>
          {items.map((it, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  borderLeft: `4px solid ${
                    it.color === "text.primary" || !it.color ? "#CCC" : it.color
                  }`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {it.label}
                </Typography>

                {typeof it.value === "string" ||
                typeof it.value === "number" ? (
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: it.color }}
                  >
                    {it.value}
                  </Typography>
                ) : (
                  it.value
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DepositDetailsInfoCard;
