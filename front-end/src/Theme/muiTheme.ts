import { alpha, createTheme } from "@mui/material/styles";

export type AppMode = "light" | "dark";

const TOKENS = {
  light: {
    bg: "#F6F7FB",
    paper: "#FFFFFF",
    paper2: "#F9FAFB",
    text: "#111827",
    text2: "#374151",
    muted: "#6B7280",
    border: "#E5E7EB",
    primary: "#2563EB",
    secondary: "#7C3AED",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#0891B2",
  },
  dark: {
    bg: "#0B1220",
    paper: "#0F172A",
    paper2: "#111A2E",
    text: "#E5E7EB",
    text2: "#C7CDD6",
    muted: "#9CA3AF",
    border: "#243044",
    primary: "#60A5FA",
    secondary: "#A78BFA",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#22D3EE",
  },
} as const;

export const getMuiTheme = (mode: AppMode) => {
  const t = TOKENS[mode];
  const isDark = mode === "dark";

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: t.primary },
      secondary: { main: t.secondary },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.error },
      info: { main: t.info },

      background: {
        default: t.bg,
        paper: t.paper,
      },
      text: {
        primary: t.text,
        secondary: t.text2,
      },
      divider: t.border,
    },

    shape: { borderRadius: 16 },

    typography: {
      fontFamily:
        `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, ` +
        `"Apple Color Emoji","Segoe UI Emoji"`,
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      button: { textTransform: "none", fontWeight: 800 },
    },

    shadows: [
      "none",
      "0px 2px 10px rgba(0,0,0,0.08)",
      "0px 6px 18px rgba(0,0,0,0.10)",
      "0px 10px 28px rgba(0,0,0,0.12)",
      ...Array(21).fill("0px 10px 28px rgba(0,0,0,0.12)"),
    ] as any,

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.bg,
            color: t.text,
          },
        },
      },

      // Surfaces
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(t.border, isDark ? 0.7 : 1)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(t.border, isDark ? 0.7 : 1)}`,
            boxShadow: isDark
              ? "0px 12px 30px rgba(0,0,0,0.35)"
              : "0px 12px 30px rgba(0,0,0,0.10)",
          },
        },
      },

      // AppBar / Drawer
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: alpha(t.paper, isDark ? 0.92 : 0.95),
            color: t.text,
            borderBottom: `1px solid ${alpha(t.border, isDark ? 0.6 : 1)}`,
            boxShadow: "none",
            backdropFilter: "blur(10px)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: t.paper,
            borderRight: `1px solid ${alpha(t.border, isDark ? 0.6 : 1)}`,
          },
        },
      },

      // Buttons
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 14, fontWeight: 800 },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          outlined: {
            borderColor: alpha(t.border, 1),
            "&:hover": {
              borderColor: alpha(t.primary, 0.6),
              backgroundColor: alpha(t.primary, isDark ? 0.16 : 0.08),
            },
          },
          text: {
            "&:hover": {
              backgroundColor: alpha(t.primary, isDark ? 0.16 : 0.08),
            },
          },
        },
      },

      // Inputs
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(t.paper2, isDark ? 0.75 : 1),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(t.border, isDark ? 0.7 : 1),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(t.primary, 0.65),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: t.primary,
              borderWidth: 2,
            },
          },
          input: {
            color: t.text,
            "::placeholder": { color: t.muted, opacity: 1 },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: t.text2,
            "&.Mui-focused": { color: t.primary },
          },
        },
      },

      // Table
      MuiTableContainer: {
        styleOverrides: {
          root: {
            border: `1px solid ${alpha(t.border, isDark ? 0.6 : 1)}`,
            borderRadius: 18,
            overflow: "hidden",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 900,
            color: t.text,
            backgroundColor: alpha(t.paper2, isDark ? 0.85 : 1),
          },
          root: {
            borderBottom: `1px solid ${alpha(t.border, isDark ? 0.5 : 1)}`,
          },
        },
      },

      // Menus / Popovers
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${alpha(t.border, isDark ? 0.6 : 1)}`,
            backgroundImage: "none",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${alpha(t.border, isDark ? 0.6 : 1)}`,
            backgroundImage: "none",
          },
        },
      },

      // Tooltip
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? alpha("#0B1220", 0.95) : alpha("#111827", 0.92),
            border: `1px solid ${alpha("#FFFFFF", isDark ? 0.08 : 0.12)}`,
          },
        },
      },
    },
  });

  return theme;
};
