// src/components/Donations/FundsPanel.tsx
import React from "react";
import { Grid, Stack, Typography, Divider, Tooltip } from "@mui/material";
import FundCard from "./FundCard";

export type FundCardData = { key: string; label: string; total: number };

type Props = {
  regularTotal: number;
  fundCards: FundCardData[];
  activeKey: string | null;
  onToggleKey: (k: string) => void;
  tipsText?: string;
};

const FundsPanel: React.FC<Props> = ({
  regularTotal,
  fundCards,
  activeKey,
  onToggleKey,
  tipsText = "לחיצה על קובייה מסננת את הטבלה משמאל; אפשר לשלב עם סינון שנה/חודש.",
}) => {
  return (
    <Stack spacing={2}>
      <FundCard
        label="תרומות רגילות"
        amount={regularTotal}
        selected={activeKey === "__regular__"}
        onClick={() => onToggleKey("__regular__")}
      />

      <Divider />

      <Grid container spacing={2}>
        {fundCards.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center">
              אין נתוני קרנות להצגה
            </Typography>
          </Grid>
        ) : (
          fundCards.map((f) => (
            <Grid item xs={12} sm={6} key={f.key}>
              <FundCard
                label={f.label}
                amount={f.total}
                selected={activeKey === f.key}
                onClick={() => onToggleKey(f.key)}
              />
            </Grid>
          ))
        )}
      </Grid>

      <Tooltip title={tipsText}>
        <Typography variant="caption" color="text.secondary">
          טיפ: {tipsText}
        </Typography>
      </Tooltip>
    </Stack>
  );
};

export default FundsPanel;
