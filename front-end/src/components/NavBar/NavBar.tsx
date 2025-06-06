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
  Badge,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getAllUsers,
  setSelectedUser,
} from "../../store/features/admin/adminUsersSlice";

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

export const Navbar: React.FC = () => {
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

  const handleUserChange = (event: any, newValue: any) => {
    console.log(event)
    // newValue = אובייקט המשתמש הנבחר או null
    if (newValue === null) {
      dispatch(setSelectedUser(null));
    } else {
      dispatch(setSelectedUser(newValue));
    }
  };

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 0 }}>
      {/* ========================= AppBar ========================= */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#003366", // כחול כהה
          direction: "rtl",
          marginBottom: 0,
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.15)",
          zIndex: (th) => th.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 2,
            px: { xs: 1, md: 3 },
          }}
        >
          {/* לוגו + כותרת */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
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
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: theme.palette.primary.contrastText,
                fontWeight: "bold",
              }}
            >
              אהבת חסד
            </Typography>
          </Box>
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexGrow: 1,
                ml: 3,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    fontSize: "1rem",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* ========================= Autocomplete “משתמשים” ========================= */}
              <Autocomplete
                options={allUsers}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                value={selectedUser}
                onChange={handleUserChange}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                size="small"
                sx={{
                  width: 200,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    paddingRight: 0,
                  },
                  "& .MuiAutocomplete-input": {
                    padding: "6px 8px",
                  },
                }}
                popupIcon={<PersonIcon color="action" />}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="כל המשתמשים"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      ...params.inputProps,
                      "aria-label": "בחר משתמש",
                    }}
                  />
                )}
              />
              <IconButton
                size="large"
                color="inherit"
                sx={{ ml: 1 }}
                aria-label="ספר התראות"
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
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

      {/* Spacer כדי שהתוכן לא יסתיר מתחת ל-AppBar */}
      <Toolbar />

      {/* ========================= Drawer למובייל ========================= */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            top: theme.mixins.toolbar.minHeight, // מתחת לגובה ה־AppBar
            backgroundColor: "#003366",          // צבע כחול כהה תואם
            color: "#FFFFFF",
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

          {/* ========================= Autocomplete מובייל ========================= */}
          <Autocomplete
            options={allUsers}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name}`
            }
            value={selectedUser}
            onChange={handleUserChange}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id
            }
            size="small"
            sx={{
              mb: 2,
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                paddingRight: 0,
              },
              "& .MuiAutocomplete-input": {
                padding: "6px 8px",
              },
            }}
            popupIcon={<PersonIcon color="action" />}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="כל המשתמשים"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "בחר משתמש",
                }}
              />
            )}
          />

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
                    textAlign: "right",
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {/* לדוגמה, פריט נוסף של הודעות במובייל */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  /* כאן ניתן לפתוח דיאלוג התראות */
                  toggleDrawer();
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                  paddingY: "12px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  textAlign: "right",
                }}
              >
                <ListItemText primary="הודעות" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
