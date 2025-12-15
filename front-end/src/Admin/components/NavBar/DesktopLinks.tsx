import React from "react";
import { Box, Button, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link } from "react-router-dom";
import { UserSelect } from "./UserSelect";
import { useDispatch } from "react-redux";
import { logoutServer } from "../../../store/features/auth/authSlice";
import type { AppDispatch } from "../../../store/store";

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
  {label: "דמי חבר" , path:"/paymentsPage"},
  {label:"הוצאות",path:"/expenses"}


];
export const DesktopLinks: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, ml: 3 }}>
      {navItems.map((it) => (
        <Button
          key={it.path}
          component={Link}
          to={it.path}
          sx={{
            color: NAV_TXT,
            p: "6px 6px",
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
        <Badge badgeContent={1} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <IconButton sx={{ color: NAV_TXT }}
      onClick={() => dispatch(logoutServer())}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 13v-2H7V8l-5 4 5 4v-3zm3-10H5c-1.1 0-2 .9-2 2v6h2V5h14v14H5v-6H3v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </IconButton>

    </Box>
  );
};
