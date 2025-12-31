import { createTheme } from "@mui/material/styles";

export const getMuiTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      // אופציונלי: צבעי מותג
      // primary: { main: "#2563eb" },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color .2s ease, color .2s ease",
          },
        },
      },
    },
  });
