import React from 'react';
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
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';


const navItems = [
  { label: 'דף הבית', path: '/Home' },
  { label: 'הלוואות', path: '/loans' },
  { label: 'משתמשים', path: '/users' },
  { label: 'תרומות', path: '/donations' },
  { label: 'השקעות', path: '/investments' },
  { label: 'פקדונות', path: '/deposits' },
  {label:"נתונים כללים ",path:"/funds"},
  {label:"סטטיסטיקה",path:"/FundsOverviewByYear"},

  
];

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = () => setOpen(!open);

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#1E3A3A', direction: 'rtl',
          height: 56,       // גובה אחיד
          minHeight: 56,    // תמיד 56 פיקסל
          maxHeight: 56,
       }}>
        <Toolbar sx={{ justifyContent: 'flex-start', gap: 2, flexWrap: 'wrap',
           minHeight: 56,   // כנ"ל
           height: 56,
         }}>
          {/* לוגו + טקסט */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                backgroundColor: '#F0F0F0',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                width: 48,
              }}
            >
              <img src="/לוגו.png" alt="לוגו אהבת חסד" style={{ height: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              אהבת חסד
            </Typography>
          </Box>

          {/* כפתורים */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{ color: '#FFFFFF' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* מובייל – כפתור ☰ */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ marginRight: 'auto' }}
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
          '& .MuiDrawer-paper': { backgroundColor: '#1E3A3A', color: 'white', width: 200 }
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={toggleDrawer}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};
