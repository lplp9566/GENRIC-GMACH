
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    danger: Palette['error'];
  }
  interface PaletteOptions {
    danger?: PaletteOptions['error'];
  }
}

const fundsOverViewTheme = createTheme({
  direction: 'rtl',

  palette: {
    primary: {
      main: '#004D7A',
      light: '#3498DB',
      dark: '#003350',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2ECC71',
    },
    danger: {         // ממפה את ה־error ל־danger שלך
      main: '#E74C3C',
    },
    info: {
      main: '#3498DB',
    },
    warning: {
      main: '#FFC107',
    },
    background: {
      default: '#F2F2F2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#667C8B',
    },
    divider: '#E0E0E0',
  },

  shape: {
    borderRadius: 16,    // פינות קרד כוללות
  },

  typography: {
    fontFamily: 'Heebo, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
      color: '#2C3E50',
      marginBottom: 32,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#2C3E50',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#667C8B',
      marginBottom: 8,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#667C8B',
    },
  },

  components: {
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#004D7A',  // primaryMain
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 8px 20px rgba(0,0,0,0.05)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 16,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 12px 30px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '0 !important',
          '&:last-child': { paddingBottom: 0 },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          marginBottom: 24,
          backgroundColor: '#E0E0E0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '1rem',
        },
        containedPrimary: {
          backgroundColor: '#004D7A',
          color: '#3498DB',
          '&:hover': {
            backgroundColor: '#3498DB',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          },
        },
        containedSuccess: {
          backgroundColor: '#2ECC71',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#28A745',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          },
        },
        containedInfo: {
          backgroundColor: '#3498DB',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2E86C1',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          },
        },
        containedWarning: {
          backgroundColor: '#FFC107',
          color: '#2C3E50',
          '&:hover': {
            backgroundColor: '#D4AC0D',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          },
        },
        containedError: {
          backgroundColor: '#E74C3C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C0392B',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
});

export default fundsOverViewTheme;
