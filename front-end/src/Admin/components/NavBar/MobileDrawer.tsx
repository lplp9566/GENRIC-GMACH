import React from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";
import { UserSelect } from "./UserSelect";

const navItems = [
  { label: "דף הבית", path: "/Home" },
  { label: "דמי חבר ", path: "/paymentsPage" },
  { label: "הלוואות", path: "/loans" },
  { label: "תרומות", path: "/donations" },
  { label: "פקדונות", path: "/deposits" },
  { label: "הוצאות", path: "/expenses" },
  { label: "השקעות", path: "/investments" },
  { label: "משתמשים", path: "/users" },
  { label: "נתונים כללים", path: "/funds" },
  { label: "סטטיסטיקה", path: "/FundsOverviewByYear" },
  { label: `החזרי הו"ק`, path: "/standing-orders" },
];

const MobileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const NAV_BG = isDark ? "#1C1F24" : "#F3F1EA";
  const NAV_TXT = isDark ? "#F5F4EF" : "#1C1F24";
  const NAV_HOVER = isDark
    ? "rgba(166,196,138,0.18)"
    : "rgba(110,139,94,0.18)";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          top: 64,
          background: NAV_BG,
          color: NAV_TXT,
          width: 250,

          // �?. ?`???\u0007?`?T?T??: ?'?\u0007?`?" ???\u0007?'?"?" + ?'???T???"
          height: { xs: "calc(100dvh - 64px)", md: "auto" },
          overflowY: { xs: "auto", md: "visible" },
          WebkitOverflowScrolling: "touch",
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>

תפריט ניווט        </Typography>

        <UserSelect fullWidth />

        <List>
          {navItems.map((it) => (
            <ListItem key={it.path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={it.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={onClose}
                sx={{
                  color: NAV_TXT,
                  py: 1.2,
                  textAlign: "right",
                  "&:hover": { backgroundColor: NAV_HOVER },
                  "&.active": {
                    backgroundColor: NAV_HOVER,
                    fontWeight: 700,
                  },
                }}
              >
                <ListItemText primary={it.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
export default MobileDrawer;

