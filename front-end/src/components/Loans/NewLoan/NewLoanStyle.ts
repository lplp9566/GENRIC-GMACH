import { styled } from "@mui/material/styles";
import { Box, Card, Stack, Avatar } from "@mui/material";

export const RootContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
}));

export const FormCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 600,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

export const FieldStack = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const HeaderAvatar = styled(Avatar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  width: theme.spacing(7),
  height: theme.spacing(7),
}));
