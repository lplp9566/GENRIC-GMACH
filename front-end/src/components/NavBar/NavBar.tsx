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
  // תזכור לייבא את createTheme ו-ThemeProvider ב-App.tsx אם אתה מגדיר את ה-theme גלובלית
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

const navItems = [
  { label: "דף הבית", path: "/Home" },
  { label: "הלוואות", path: "/loans" },
  { label: "משתמשים", path: "/users" },
  { label: "תרומות", path: "/donations" },
  { label: "השקעות", path: "/investments" },
  { label: "פקדונות", path: "/deposits" },
  { label: "נתונים כללים ", path: "/funds" },
  { label: "סטטיסטיקה", path: "/FundsOverviewByYear" },
];

export const Navbar = () => {
  const theme = useTheme(); // וודא שאתה עוטף את כל האפליקציה ב-ThemeProvider

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = () => setOpen(!open);

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: theme.palette.primary.main, // כחול-ים עמוק
          direction: "rtl",
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.15)', // צל מעט בולט
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "flex-start",
            gap: 3,
            paddingRight: theme.spacing(3),
            paddingLeft: theme.spacing(3),
          }}
        >
          {/* לוגו + טקסט */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper, // רקע לבן ללוגו
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                width: 48,
                boxShadow: '0px 2px 5px rgba(0,0,0,0.2)', // צל קטן ללוגו
              }}
            >
              <img src="/לוגו.png" alt="לוגו אהבת חסד" style={{ height: 36 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}
            >
              אהבת חסד
            </Typography>
          </Box>

          {/* כפתורים */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: theme.palette.primary.contrastText, // לבן
                    fontSize: '1rem',
                    fontWeight: 'normal',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)', // לבן שקוף יותר בריחוף
                      color: theme.palette.primary.contrastText,
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                    },
                    '&.Mui-selected': { // אם תרצה להוסיף לוגיקה לבחירה
                        backgroundColor: theme.palette.primary.light, // כחול בהיר יותר כנבחר
                        color: theme.palette.primary.contrastText,
                        fontWeight: 'bold',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* מובייל – כפתור ☰ */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ marginLeft: "auto" }}
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
            backgroundColor: theme.palette.primary.dark, // צבע כהה יותר של ה-primary ל-Drawer
            color: theme.palette.primary.contrastText,
            width: 240,
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText, mb: 2 }}>
                תפריט ניווט
            </Typography>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={toggleDrawer}
                sx={{
                    color: theme.palette.primary.contrastText,
                    paddingY: '12px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', // לבן שקוף בריחוף
                        color: theme.palette.primary.contrastText,
                    }
                }}
              >
                <ListItemText primary={item.label} sx={{ textAlign: 'right' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};