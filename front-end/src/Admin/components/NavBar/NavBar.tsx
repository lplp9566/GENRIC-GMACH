import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, IconButton, useMediaQuery, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getAllUsers } from "../../../store/features/admin/adminUsersSlice";
import { LogoTitle } from "./LogoTitle";
import { DesktopLinks } from "./DesktopLinks";
import MobileDrawer from "./MobileDrawer";
import { useAppTheme } from "../../../Theme/ThemeProvider";


// const NAV_BG  = "#003366";
const NAV_BG = "#113E21";
const APP_BAR_H = 64;
const BP_MOBILE = 960;

export const Navbar: React.FC = () => {
  const isMobile = useMediaQuery(`(max-width:${BP_MOBILE}px)`);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const usersLoaded = useSelector((s: RootState) => s.AdminUsers.allUsers.length);

  // ✅ theme toggle (MUI ThemeProvider שלנו)
  const { mode, toggle } = useAppTheme();

  useEffect(() => {
    if (usersLoaded === 0) dispatch(getAllUsers({ isAdmin: false }));
  }, [dispatch, usersLoaded]);

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 0 }}>
      <AppBar position="fixed" sx={{ background: NAV_BG, height: APP_BAR_H }}>
        <Toolbar sx={{ minHeight: APP_BAR_H, gap: 2, direction: "rtl" }}>
          <LogoTitle />

          {/* ✅ כפתור מצב לילה/יום */}
          <Tooltip title={mode === "dark" ? "מצב יום" : "מצב לילה"}>
            <IconButton sx={{ color: "#FFF" }} onClick={toggle}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {isMobile ? (
            <IconButton sx={{ ml: "auto", color: "#FFF" }} onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <DesktopLinks />
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ height: APP_BAR_H }} />

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default Navbar;
