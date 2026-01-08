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
import { Link } from "react-router-dom";
import { UserSelect } from "./UserSelect";

const NAV_BG = "#003366";
const NAV_TXT = "#FFFFFF";

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
}) => (
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

        // ✅ במובייל: גובה מוגדר + גלילה
        height: { xs: "calc(100dvh - 64px)", md: "auto" },
        overflowY: { xs: "auto", md: "visible" },
        WebkitOverflowScrolling: "touch",
      },
    }}
  >
    <Box sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        תפריט ניווט
      </Typography>

      <UserSelect fullWidth />

      <List>
        {navItems.map((it) => (
          <ListItem key={it.path} disablePadding>
            <ListItemButton
              component={Link}
              to={it.path}
              onClick={onClose}
              sx={{
                color: NAV_TXT,
                py: 1.2,
                textAlign: "right",
                "&:hover": { backgroundColor: "rgba(255,255,255,.1)" },
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
export default MobileDrawer;
