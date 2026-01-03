import React from "react";
import { Grid, Stack, Typography, Tooltip } from "@mui/material";
import CategoryCard from "./CategoryCard";

export type CategoryCardData = { key: string; label: string; total: number };

type Props = {
  categoryCards: CategoryCardData[];
  activeKey: string | null;
  onToggleKey: (k: string) => void;
  tipsText?: string;
};

const CategoriesPanel: React.FC<Props> = ({
  categoryCards,
  activeKey,
  onToggleKey,
  tipsText = "לחיצה על קטגוריה מסננת את הטבלה משמאל; אפשר לשלב עם סינון שנה/חודש.",
}) => {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {categoryCards.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center">
              אין נתוני קטגוריות להצגה
            </Typography>
          </Grid>
        ) : (
          categoryCards.map((c) => (
            <Grid item xs={12} sm={6} key={c.key}>
              <CategoryCard
                label={c.label}
                amount={c.total}
                selected={activeKey === c.key}
                onClick={() => onToggleKey(c.key)}
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

export default CategoriesPanel;
