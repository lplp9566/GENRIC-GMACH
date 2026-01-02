import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, IconButton, useMediaQuery, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {  getAllUsers } from "../../../store/features/admin/adminUsersSlice";
import { LogoTitle } from "./LogoTitle";
import { DesktopLinks } from "./DesktopLinks";
import MobileDrawer from "./MobileDrawer";
import { useAppTheme } from "../../../Theme/ThemeProvider";


// const NAV_BG  = "#003366";
const NAV_BG = "#0D2233";
const APP_BAR_H = 64;
const BP_MOBILE = 960;
const USER_BAR_H = 36;


export const Navbar: React.FC = () => {
  const isMobile = useMediaQuery(`(max-width:${BP_MOBILE}px)`);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const usersLoaded = useSelector((s: RootState) => s.AdminUsers.allUsers.length);
const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);

  // ✅ theme toggle (MUI ThemeProvider שלנו)
  const { mode, toggle } = useAppTheme();

  useEffect(() => {
    if (usersLoaded === 0) dispatch(getAllUsers({ isAdmin: false }));
  }, [dispatch, usersLoaded]);

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 0 }}>
// ... בתוך Navbar

<AppBar
  position="fixed"
  sx={{
    background: NAV_BG,
    height: selectedUser ? APP_BAR_H + USER_BAR_H : APP_BAR_H,
    transition: "height .2s",
  }}
>
  {/* ===== שורה 1: הנאב ===== */}
  <Toolbar sx={{ minHeight: APP_BAR_H, gap: 2, direction: "rtl" }}>
    <LogoTitle />

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

  {/* ===== שורה 2: מצב משתמש ===== */}
  {selectedUser && (
    <Box
      sx={{
        height: USER_BAR_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        bgcolor: NAV_BG, // אותו צבע – חלק מהנאב
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 0.5,
          borderRadius: 999,
          bgcolor: "rgba(145, 183, 92, 0.92)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          maxWidth: "90%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {selectedUser.first_name} {selectedUser.last_name}
      </Box>
    </Box>
  )}
</AppBar>




      <Box sx={{ height: APP_BAR_H }} />

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default Navbar;
