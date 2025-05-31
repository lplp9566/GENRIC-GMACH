import { Avatar, Box, Paper, Stack, styled } from "@mui/material";

// Root container with subtle gradient background
 export const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
//   background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
  padding: theme.spacing(4),
}));

// Card-like form container
 export const FormCard = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 500,
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
}));

// Decorative avatar at the top
export const HeaderAvatar = styled(Avatar)(({ theme }) => ({
  margin: "0 auto",
  backgroundColor: theme.palette.primary.main,
  width: 60,
  height: 60,
}));

// Styled field wrapper
export const FieldStack = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

// SelectAllUsers component (standalone)

