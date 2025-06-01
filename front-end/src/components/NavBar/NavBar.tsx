import React, { useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent, // <-- ייבוא הסוג הנכון
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getAllUsers, setSelectedUser } from "../../store/features/admin/adminUsersSlice";


const navItems = [
  { label: "דף הבית", path: "/Home" },
  { label: "הלוואות", path: "/loans" },
  { label: "משתמשים", path: "/users" },
  { label: "תרומות", path: "/donations" },
  { label: "השקעות", path: "/investments" },
  { label: "פקדונות", path: "/deposits" },
  { label: "נתונים כללים", path: "/funds" },
  { label: "סטטיסטיקה", path: "/FundsOverviewByYear" },
];

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = React.useState(false);

  // מושכים את כל המשתמשים ואת המשתמש הנבחר מה־Redux
  const allUsers = useSelector((state: RootState) => state.adminUsers.allUsers);
  const selectedUser = useSelector(
    (state: RootState) => state.adminUsers.selectedUser
  );

  useEffect(() => {
    if (allUsers.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch, allUsers.length]);

  const toggleDrawer = () => setOpen((prev) => !prev);

  // הקפידו להשתמש ב־SelectChangeEvent<number>
  const handleUserSelect = (event: SelectChangeEvent<number>) => {
    const val = Number(event.target.value);
    if (val === 0) {
      dispatch(setSelectedUser(null));
    } else {
      const user = allUsers.find((u) => u.id === val) || null;
      dispatch(setSelectedUser(user));
    }
  };

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#003366",
          direction: "rtl",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            paddingRight: theme.spacing(3),
            paddingLeft: theme.spacing(3),
          }}
        >
          {/* לוגו + כותרת */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                width: 48,
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src="/לוגו.png"
                alt="לוגו אהבת חסד"
                style={{ height: 36 }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.contrastText,
                fontWeight: "bold",
              }}
            >
              אהבת חסד
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontSize: "1rem",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel
                  id="select-user-navbar-label"
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  {selectedUser
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : "כל המשתמשים"}
                </InputLabel>
                <Select<number>
                  labelId="select-user-navbar-label"
                  value={selectedUser?.id ?? 0}
                  label={
                    selectedUser
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`
                      : "כל המשתמשים"
                  }
                  onChange={handleUserSelect}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.4)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.7)",
                    },
                  }}
                >
                  <MenuItem value={0}>כל המשתמשים</MenuItem>
                  {allUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

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
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
            width: 250,
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.contrastText,
              mb: 2,
            }}
          >
            תפריט ניווט
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel
              id="select-user-mobile-label"
              sx={{ color: theme.palette.primary.contrastText }}
            >
              {selectedUser
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : "כל המשתמשים"}
            </InputLabel>
            <Select<number>
              labelId="select-user-mobile-label"
              value={selectedUser?.id ?? 0}
              label={
                selectedUser
                  ? `${selectedUser.first_name} ${selectedUser.last_name}`
                  : "כל המשתמשים"
              }
              onChange={handleUserSelect}
              sx={{
                color: theme.palette.primary.contrastText,
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.4)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.light,
                },
              }}
            >
              <MenuItem value={0}>כל המשתמשים</MenuItem>
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    paddingY: "12px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemText primary={item.label} sx={{ textAlign: "right" }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};
