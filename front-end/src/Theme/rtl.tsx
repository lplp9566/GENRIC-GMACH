import React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import stylisPluginRtl from "stylis-plugin-rtl";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { getMuiTheme } from "./muiTheme";
import { useAppTheme } from "./ThemeProvider";


// RTL cache for Emotion
const cacheRtl = createCache({
  key: "mui-rtl",
  stylisPlugins: [stylisPluginRtl],
});

export const RtlThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useAppTheme(); // "light" | "dark"

  // בונים את ה-theme הרגיל שלך + מוסיפים direction
  const theme = React.useMemo(() => {
    const base = getMuiTheme(mode);
    return { ...base, direction: "rtl" as const };
  }, [mode]);

  return (
    <CacheProvider value={cacheRtl}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};
