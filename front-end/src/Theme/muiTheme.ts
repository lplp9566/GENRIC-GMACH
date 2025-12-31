// src/theme/muiTheme.ts
import { alpha, createTheme, ThemeOptions } from "@mui/material/styles";

export type AppMode = "light" | "dark";

/**
 * MUI theme "full colors" for light/dark + component style overrides
 * Works best when you use MUI components (Typography/Box/etc.) instead of raw <p>/<div> with hard-coded colors.
 */
export const getMuiTheme = (mode: AppMode) => {
  const isDark = mode === "dark";

  // --- Core color tokens (edit freely) ---
  const tokens = {
    bg: isDark ? "#0B1220" : "#F7F8FA",
    paper: isDark ? "#0F172A" : "#FFFFFF",
    paper2: isDark ? "#111A2E" : "#FFFFFF",
    border: isDark ? "#26324A" : "#E6E8EE",

    text: isDark ? "#E5E7EB" : "#111827",
    text2: isDark ? "#C7CDD6" : "#374151",
    muted: isDark ? "#9CA3AF" : "#6B7280",

    primary: isDark ? "#60A5FA" : "#2563EB",
    secondary: isDark ? "#A78BFA" : "#7C3AED",

    success: isDark ? "#34D399" : "#16A34A",
    warning: isDark ? "#FBBF24" : "#D97706",
    error: isDark ? "#F87171" : "#DC2626",
    info: isDark ? "#22D3EE" : "#0891B2",
  };

  const base: ThemeOptions = {
    palette: {
      mode,
      primary: { main: tokens.primary },
      secondary: { main: tokens.secondary },
      success: { main: tokens.success },
      warning: { main: tokens.warning },
      error: { main: tokens.error },
      info: { main: tokens.info },

      background: {
        default: tokens.bg,
        paper: tokens.paper,
      },

      text: {
        primary: tokens.text,
        secondary: tokens.text2,
      },

      divider: tokens.border,
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"`,
      button: { textTransform: "none", fontWeight: 700 },
    },

    components: {
      // Global baseline for ALL pages
      MuiCssBaseline: {
        styleOverrides: {
          "html, body": {
            backgroundColor: tokens.bg,
            color: tokens.text,
          },
          "*": {
            // smoother theme switching
            transition: "background-color .15s ease, color .15s ease, border-color .15s ease",
          },
          a: {
            color: tokens.primary,
          },
          // If you have some non-MUI text elements, this helps them inherit theme text.
          "p, span, div, li, td, th, label, small": {
            color: "inherit",
          },
        },
      },

      // Surfaces
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(tokens.border, isDark ? 0.9 : 1)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(tokens.border, isDark ? 0.9 : 1)}`,
          },
        },
      },

      // Buttons
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 700,
          },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          outlined: {
            borderColor: alpha(tokens.border, 1),
            "&:hover": {
              borderColor: alpha(tokens.primary, 0.6),
              backgroundColor: alpha(tokens.primary, isDark ? 0.12 : 0.08),
            },
          },
          text: {
            "&:hover": {
              backgroundColor: alpha(tokens.primary, isDark ? 0.12 : 0.08),
            },
          },
        },
      },

      // Inputs / Forms
      MuiTextField: { defaultProps: { variant: "outlined" } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(tokens.paper2, isDark ? 0.6 : 1),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(tokens.border, 1),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(tokens.primary, 0.6),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.primary,
              borderWidth: 2,
            },
          },
          input: {
            color: tokens.text,
            "::placeholder": { color: tokens.muted, opacity: 1 },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: tokens.text2,
            "&.Mui-focused": { color: tokens.primary },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { color: tokens.muted },
        },
      },

      // Selection controls
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: alpha(tokens.text2, 0.8),
            "&.Mui-checked": { color: tokens.primary },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: alpha(tokens.text2, 0.8),
            "&.Mui-checked": { color: tokens.primary },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": { color: tokens.primary },
            "&.Mui-checked + .MuiSwitch-track": {
              backgroundColor: alpha(tokens.primary, 0.5),
            },
          },
          track: {
            backgroundColor: alpha(tokens.muted, 0.4),
          },
        },
      },

      // Navigation
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: alpha(tokens.paper, isDark ? 0.92 : 0.96),
            color: tokens.text,
            borderBottom: `1px solid ${tokens.border}`,
            boxShadow: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: tokens.paper,
            borderRight: `1px solid ${tokens.border}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              backgroundColor: alpha(tokens.primary, isDark ? 0.14 : 0.08),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(tokens.primary, isDark ? 0.22 : 0.12),
              "&:hover": {
                backgroundColor: alpha(tokens.primary, isDark ? 0.28 : 0.16),
              },
            },
          },
        },
      },

      // Chips
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            border: `1px solid ${alpha(tokens.border, 1)}`,
            backgroundColor: alpha(tokens.paper2, isDark ? 0.6 : 1),
          },
        },
      },

      // Tables
      MuiTableContainer: {
        styleOverrides: {
          root: {
            border: `1px solid ${tokens.border}`,
            borderRadius: 16,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${alpha(tokens.border, 1)}`,
          },
          head: {
            fontWeight: 800,
            color: tokens.text,
            backgroundColor: alpha(tokens.paper2, isDark ? 0.65 : 1),
          },
        },
      },

      // Tooltip
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha("#111827", isDark ? 0.92 : 0.92),
            color: "#F9FAFB",
            border: `1px solid ${alpha("#FFFFFF", 0.08)}`,
          },
          arrow: {
            color: alpha("#111827", 0.92),
          },
        },
      },

      // Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            border: `1px solid ${tokens.border}`,
          },
        },
      },

      // Tabs
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: 3 },
        },
      },

      // Snackbar / Alerts
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${alpha(tokens.border, 1)}`,
          },
        },
      },

      // Accordion
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${tokens.border}`,
            "&:before": { display: "none" },
          },
        },
      },
    },
  };

  return createTheme(base);
};
