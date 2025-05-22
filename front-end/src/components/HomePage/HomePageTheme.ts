
import { createTheme } from '@mui/material/styles';

const homePageTheme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#004D7A',
      light: '#3498DB',
    },
    success: {
      main: '#2ECC71',
    },
    info: {
      main: '#3498DB',
    },
    warning: {
      main: '#F1C40F',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#667C8B',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
      color: '#2C3E50',
      marginBottom: 32,
    },
    subtitle1: {
      color: '#667C8B',
      marginBottom: 8,
      fontWeight: 500,
      fontSize: '1rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#2C3E50',
      marginBottom: 16,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
          },
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
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
        containedSuccess: {
          backgroundColor: '#2ECC71',
          color: '#3498DB',
          '&:hover': {
            backgroundColor: '#28A745',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
        containedError: {
          backgroundColor: '#E74C3C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C0392B',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
        containedInfo: {
          backgroundColor: '#3498DB',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2E86C1',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
        containedWarning: {
          backgroundColor: '#F1C40F',
          color: '#2C3E50',
          '&:hover': {
            backgroundColor: '#D4AC0D',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

export default homePageTheme;
