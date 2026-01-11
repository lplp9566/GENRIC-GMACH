import { AppBar, Box, Button, Toolbar } from "@mui/material";
import { NavLink } from "react-router-dom";

const NAV_BG = "#0D2233";

const links = [
  { label: "דף הבית", path: "/u" },
  { label: "איזור אישי", path: "/u/profile" },
  { label: "הלוואות", path: "/u/loans" },
  { label: "תרומות", path: "/u/donations" },
  { label: "פקדנות", path: "/u/deposits" },
  { label: "החזרי הוראת קבע", path: "/u/standing-orders" },
  { label: "נתונים כללים", path: "/u/overview" },
  { label: "סטטיסטיקה", path: "/u/statistics" },
];

const UserNavbar = () => {
  return (
    <AppBar position="sticky" sx={{ background: NAV_BG }}>
      <Toolbar sx={{ direction: "rtl", gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {links.map((link) => (
            <Button
              key={link.path}
              component={NavLink}
              to={link.path}
              sx={{
                color: "#fff",
                fontWeight: 600,
                "&.active": {
                  bgcolor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserNavbar;
