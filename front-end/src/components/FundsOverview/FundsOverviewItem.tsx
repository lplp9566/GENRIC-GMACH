import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Grow,
  SvgIconTypeMap,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { OverridableComponent } from "@mui/material/OverridableComponent";

export interface CardItemProps {
  label: string;
  value: number;
  Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  animationDelay?: number;
}

const FundsOverviewItem: React.FC<CardItemProps> = ({
  label,
  value,
  Icon,
  animationDelay = 0,
}) => (
  <Grow in style={{ transformOrigin: "0 0 0" }} timeout={500 + animationDelay}>
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{
          position: "relative",
          overflow: "visible",
          borderRadius: 3,
          boxShadow: theme =>
            `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
          background: theme =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: "common.white",
          p: 2,
          minHeight: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-8px) rotate(-1deg)",
            boxShadow: theme =>
              `0 12px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -24,
            right: -24,
            bgcolor: "secondary.main",
            borderRadius: "50%",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: theme =>
              `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
        >
          <Icon sx={{ fontSize: 32, color: "common.white" }} />
        </Box>

        <CardContent sx={{ pt: 4, textAlign: "right", width: "100%" }}>
          <Typography
            variant="subtitle1"
            sx={{ color: "common.white", opacity: 0.9 }}
          >
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ₪{(value ?? 0).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grow>
);

export default FundsOverviewItem;
