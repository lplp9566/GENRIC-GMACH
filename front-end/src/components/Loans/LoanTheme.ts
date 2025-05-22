import { createTheme } from "@mui/material";

export const loanTheme = createTheme({
    direction: 'rtl',
    palette: {
      primary: {
        main: '#6200EE',
        light: '#9C27B0',
        dark: '#3F00B5',
        contrastText: '#fff',
      },
      secondary: {
        main: '#03DAC6',
        light: '#4DB6AC',
        dark: '#00838F',
        contrastText: '#000',
      },
      background: {
        default: '#F5F5F5',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#616161',
      },
      success: {
        main: '#4CAF50',
      },
      warning: {
        main: '#FF9800',
      },
      info: {
        main: '#2196F3',
      },
    },
    typography: {
      fontFamily: 'Heebo, Arial, sans-serif',
      h4: {
        fontWeight: 700,
        color: '#212121',
        fontSize: '2rem',
      },
      h5: {
        fontWeight: 600,
        color: '#212121',
        fontSize: '1.75rem',
      },
      h6: {
        fontWeight: 600,
        color: '#424242',
        fontSize: '1.25rem',
      },
      body1: {
        fontSize: '1rem',
        color: '#424242',
      },
      body2: {
        fontSize: '0.875rem',
        color: '#616161',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)',
            },
          },
          containedPrimary: {
              backgroundColor: '#6200EE',
              '&:hover': {
                  backgroundColor: '#3F00B5',
              }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.1)',
              backgroundColor: '#F0F0F0',
            },
            backgroundColor: '#FFFFFF',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px !important',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end', 
            textAlign: 'right', // 
          },
        },
      },
      MuiTypography: {
          styleOverrides: {
              root: {
                  direction: 'rtl',
              }
          }
      }
    },
  });