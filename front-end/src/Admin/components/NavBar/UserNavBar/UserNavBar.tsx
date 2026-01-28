import {
  AppBar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutServer } from "../../../../store/features/auth/authSlice";
import type { AppDispatch, RootState } from "../../../../store/store";
import { LogoTitle } from "../AdminNavBar/LogoTitle";
import { useAppTheme } from "../../../../Theme/ThemeProvider";
import { fetchGuarantorRequests } from "../../../../store/features/loanRequests/loanRequestsSlice";

const NAV_BG = "#0D2233";
const NAV_TXT = "#FFFFFF";
const BP_MOBILE = 960;

const links = [
  { label: "דף הבית", path: "/u" },
  { label: "איזור אישי", path: "/u/profile" },
  { label: "הלוואות", path: "/u/loans" },
  { label: "תרומות", path: "/u/donations" },
  { label: "פקדנות", path: "/u/deposits" },
  { label: "דמי חבר", path: "/u/payments" },
  { label: "החזרי הוראת קבע", path: "/u/standing-orders" },
  { label: "נתונים כללים", path: "/u/overview" },
  { label: "סטטיסטיקה", path: "/u/statistics" },
];

const UserNavbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userId = authUser?.user?.id;
  const guarantorRequests = useSelector(
    (s: RootState) => s.LoanRequestsSlice.guarantorRequests
  );
  const pendingGuarantor = guarantorRequests.filter(
    (r) => r.status === "PENDING"
  ).length;
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(`(max-width:${BP_MOBILE}px)`);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { mode, toggle } = useAppTheme();
  const activePath = pathname.toLowerCase();
  const isActive = (path: string) => {
    const p = path.toLowerCase();
    if (p === "/u") return activePath === p;
    return activePath === p || activePath.startsWith(`${p}/`);
  };

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchGuarantorRequests(userId));
  }, [dispatch, userId]);

  const openNotif = Boolean(notifAnchor);
  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <>
      <AppBar position="sticky" sx={{ background: NAV_BG }}>
        <Toolbar sx={{ direction: "rtl", gap: 2 }}>
          <LogoTitle />

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
              {links.map((link) => (
                <Button
                  key={link.path}
                  component={NavLink}
                  to={link.path}
                  sx={{
                    color: NAV_TXT,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
                    ...(isActive(link.path)
                      ? { backgroundColor: "rgba(255,255,255,.22)", fontWeight: 700 }
                      : {}),
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
            <Tooltip title={mode === "dark" ? "מצב בהיר" : "מצב כהה"}>
              <IconButton sx={{ color: NAV_TXT }} onClick={toggle}>
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="התראות">
              <IconButton sx={{ color: NAV_TXT }} onClick={handleNotifOpen}>
                <Badge badgeContent={pendingGuarantor} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="יציאה">
              <IconButton
                sx={{ color: NAV_TXT }}
                onClick={() => dispatch(logoutServer())}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 13v-2H7V8l-5 4 5 4v-3zm3-10H5c-1.1 0-2 .9-2 2v6h2V5h14v14H5v-6H3v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </IconButton>
            </Tooltip>
            {isMobile && (
              <IconButton sx={{ color: NAV_TXT }} onClick={() => setOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Popover
        open={openNotif}
        anchorEl={notifAnchor}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 220,
            borderRadius: 2,
            bgcolor: NAV_BG,
            color: NAV_TXT,
          },
        }}
      >
        {pendingGuarantor > 0 ? (
          <Typography fontWeight={600}>
            יש בקשת אישור ערבות ({pendingGuarantor})
          </Typography>
        ) : (
          <Typography color="rgba(255,255,255,0.7)">אין התראות</Typography>
        )}
      </Popover>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            top: 64,
            background: NAV_BG,
            color: NAV_TXT,
            width: 250,
            height: { xs: "calc(100dvh - 64px)", md: "auto" },
            overflowY: { xs: "auto", md: "visible" },
            WebkitOverflowScrolling: "touch",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <List>
            {links.map((link) => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  sx={{
                    color: NAV_TXT,
                    py: 1.2,
                    textAlign: "right",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.12)" },
                    ...(isActive(link.path)
                      ? { backgroundColor: "rgba(255,255,255,.18)", fontWeight: 700 }
                      : {}),
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default UserNavbar;
