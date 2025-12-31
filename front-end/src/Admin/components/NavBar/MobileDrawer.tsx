import React from "react";
import { Drawer, Box, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { UserSelect } from "./UserSelect";

const NAV_BG  = "#003366";
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
  { label: "דמי חבר ", path: "/paymentsPage" },
  
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