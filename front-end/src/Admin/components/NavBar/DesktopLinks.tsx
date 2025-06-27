import React from "react";
import { Box, Button, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link } from "react-router-dom";
import { UserSelect } from "./UserSelect";

const NAV_TXT = "#FFFFFF";

const navItems = [
  { label: "דף הבית", path: "/Home" },
  { label: "הלוואות", path: "/loans" },
  { label: "משתמשים", path: "/users" },
  { label: "תרומות", path: "/donations" },
  { label: "השקעות", path: "/investments" },
  { label: "פקדונות", path: "/deposits" },
  { label: "נתונים כללים", path: "/funds" },
  { label: "סטטיסטיקה", path: "/FundsOverviewByYear" },
  {label: "תשלומים חודשיים " , path:"/paymentsPage"},
  {label:"הוצאות",path:"dd"}


];

export const DesktopLinks: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, ml: 3 }}>
    {navItems.map((it) => (
      <Button
        key={it.path}
        component={Link}
        to={it.path}
        sx={{
          color: NAV_TXT,
          p: "8px 12px",
          borderRadius: 2,
          textTransform: "none",
          "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
        }}
      >
        {it.label}
      </Button>
    ))}

    <UserSelect />

    <IconButton sx={{ ml: 1, color: NAV_TXT }}>
      <Badge badgeContent={3} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  </Box>
);
