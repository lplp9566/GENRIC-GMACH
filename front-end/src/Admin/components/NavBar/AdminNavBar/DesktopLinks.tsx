import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, NavLink, useLocation } from "react-router-dom";
import { UserSelect } from "./UserSelect";
import { useDispatch, useSelector } from "react-redux";
import { logoutServer } from "../../../../store/features/auth/authSlice";
import type { AppDispatch, RootState } from "../../../../store/store";
import { fetchLoanRequests } from "../../../../store/features/loanRequests/loanRequestsSlice";

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
  { label: "דמי חבר", path: "/paymentsPage" },
  // { label: "הוצאות", path: "/expenses" },
];
export const DesktopLinks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pathname } = useLocation();
  const [expensesAnchorEl, setExpensesAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const requests = useSelector((s: RootState) => s.LoanRequestsSlice.requests);
  const pendingAdmin = requests.filter((r) => r.status === "ADMIN_PENDING");
  const openExpensesMenu = Boolean(expensesAnchorEl);
  const activePath = useMemo(() => pathname.toLowerCase(), [pathname]);
  const isActive = (path: string) => {
    const p = path.toLowerCase();
    if (p === "/home") return activePath === p;
    return activePath === p || activePath.startsWith(`${p}/`);
  };

  useEffect(() => {
    if (requests.length === 0) dispatch(fetchLoanRequests());
  }, [dispatch, requests.length]);

  const openNotif = Boolean(notifAnchor);
  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1, ml: 3 }}
    >
      {navItems.map((it) => (
        <Button
          key={it.path}
          component={NavLink}
          to={it.path}
          sx={{
            color: NAV_TXT,
            p: "6px 6px",
            borderRadius: 2,
            textTransform: "none",
            "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
            ...(isActive(it.path)
              ? {
              backgroundColor: "rgba(255,255,255,.22)",
              fontWeight: 700,
            }
              : {}),
          }}
        >
          {it.label}
        </Button>
      ))}
      <Button
        sx={{
          color: NAV_TXT,
          p: "6px 6px",
          borderRadius: 2,
          textTransform: "none",
          "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
        }}
        onClick={(e) => setExpensesAnchorEl(e.currentTarget)}
      >
        עוד
      </Button>

      <Menu
        anchorEl={expensesAnchorEl}
        open={openExpensesMenu}
        onClose={() => setExpensesAnchorEl(null)}
      >
        <MenuItem
          component={Link}
          to="/expenses"
          onClick={() => setExpensesAnchorEl(null)}
        >
          הוצאות
        </MenuItem>

        <MenuItem
          component={Link}
          to="/standing-orders"
          onClick={() => setExpensesAnchorEl(null)}
        >
          החזרי הוראת קבע
        </MenuItem>

        <MenuItem
          component={Link}
          to="/cash-expenses"
          onClick={() => setExpensesAnchorEl(null)}
        >
          מזומן
        </MenuItem>
      </Menu>

      <UserSelect />

      <Tooltip title="התראות">
        <IconButton sx={{ ml: 1, color: NAV_TXT }} onClick={handleNotifOpen}>
          <Badge badgeContent={pendingAdmin.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
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
            bgcolor: "#0D2233",
            color: "#FFFFFF",
          },
        }}
      >
        {pendingAdmin.length > 0 ? (
          <>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              יש בקשות הלוואה לאישור ({pendingAdmin.length})
            </Typography>
            <Stack spacing={0.5}>
              {pendingAdmin.slice(0, 5).map((r) => (
                <Typography
                  key={r.id}
                  sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}
                >
                  {r.user?.first_name} {r.user?.last_name}
                </Typography>
              ))}
              {pendingAdmin.length > 5 && (
                <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  ועוד {pendingAdmin.length - 5}
                </Typography>
              )}
            </Stack>
          </>
        ) : (
          <Typography color="rgba(255,255,255,0.7)">אין התראות</Typography>
        )}
      </Popover>
      
    </Box>
  );
};
