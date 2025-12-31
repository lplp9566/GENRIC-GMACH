import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { getMuiTheme } from "./muiTheme";

type Mode = "light" | "dark";

type ThemeCtx = {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

function getInitialMode(): Mode {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

type Props = { children: React.ReactNode };

export function ThemeProvider({ children }: Props) {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

 const muiTheme = useMemo(() => getMuiTheme(mode), [mode]);


  const value = useMemo<ThemeCtx>(() => ({
    mode,
    setMode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
