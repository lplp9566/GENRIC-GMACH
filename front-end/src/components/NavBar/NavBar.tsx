import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { Label } from "@mui/icons-material";

const navItems = [
  { label: "דף הבית", path: "/" },
  { label: "הלוואות", path: "/loans" },
  { label: "משתמשים", path: "/users" },
  { label: "תרומות", path: "/donations" },
  { label: "השקעות", path: "/investments" },
  { label: "פקדונות", path: "/deposits" },
  { label: "הוצאות", path: "/expenses" },
  { Label: "הוצאות", path: "/dashboard" },
  { label: "קרנות מיוחדות", path: "/specialFunds" },
  { Label: "השקעות ", path: "/investments" },
  { Label: 'החזרי הו"ק', path: "/returns" },
];

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = () => setOpen(!open);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ backgroundColor: "#1E3A3A", direction: "rtl" }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* ימין – לוגו + שם */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                backgroundColor: "#F0F0F0",
                borderRadius: "50%",
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                width: 48,
              }}
            >
              <img src="/לוגו.png" alt="לוגו אהבת חסד" style={{ height: 32 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: "#FFFFFF", fontWeight: "bold" }}
            >
              אהבת חסד
            </Typography>
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{ color: "#FFFFFF", marginLeft: "10px" }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* שמאל – תפריט */}

          {/* כפתור תפריט למובייל */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer למובייל */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#1E3A3A",
            color: "white",
            width: 200,
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={toggleDrawer}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};
