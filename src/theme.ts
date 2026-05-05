"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const COLORS = {
  ink: "#0A1320",
  inkSoft: "#3B4A55",
  muted: "#5C6770",
  surface: "#F7F5F0",
  surfaceAlt: "#EFEAE0",
  line: "#E0DACE",
  primary: "#0E2A3D",
  primaryDark: "#06182A",
  primaryDeep: "#020A14",
  accent: "#D9A84B",
  accentBright: "#F0C16E",
  accentDeep: "#A07823",
};

let theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: COLORS.primary, dark: COLORS.primaryDark, contrastText: "#FFFFFF" },
    secondary: { main: COLORS.accent, light: COLORS.accentBright, dark: COLORS.accentDeep, contrastText: COLORS.primaryDeep },
    background: { default: COLORS.surface, paper: "#FFFFFF" },
    text: { primary: COLORS.ink, secondary: COLORS.muted },
    divider: COLORS.line,
    grey: {
      50: "#F7F5F0",
      100: "#EFEAE0",
      200: "#E0DACE",
      300: "#C5BDAB",
      400: "#9C9485",
      500: "#5C6770",
      900: "#0A1320",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "var(--font-body), 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    h1: {
      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.035em",
      lineHeight: 0.98,
      fontSize: "clamp(3rem, 6.5vw, 5.75rem)",
    },
    h2: {
      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.025em",
      lineHeight: 1.05,
      fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)",
    },
    h3: {
      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
      fontWeight: 500,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      fontSize: "clamp(1.625rem, 2.8vw, 2.25rem)",
    },
    h4: {
      fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
      fontWeight: 500,
      fontSize: "1.5rem",
      letterSpacing: "-0.015em",
    },
    h5: { fontWeight: 600, fontSize: "1.125rem", letterSpacing: "-0.005em", lineHeight: 1.35 },
    h6: { fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "0.04em", textTransform: "uppercase" },
    subtitle1: { fontSize: "1.125rem", lineHeight: 1.6, color: COLORS.inkSoft },
    body1: { fontSize: "1rem", lineHeight: 1.65, color: COLORS.inkSoft },
    body2: { fontSize: "0.9375rem", lineHeight: 1.6, color: COLORS.muted },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    overline: { fontWeight: 600, letterSpacing: "0.18em", fontSize: "0.75rem", color: COLORS.muted },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.surface,
          color: COLORS.ink,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 22,
          paddingBlock: 12,
          fontWeight: 600,
          fontSize: "0.9375rem",
          transition: "transform 220ms cubic-bezier(.2,.8,.2,1), background-color 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
          "&:hover": { transform: "translateY(-1px)" },
          "&.MuiButton-containedPrimary": {
            backgroundColor: COLORS.primary,
            backgroundImage: "linear-gradient(180deg, #1B4258 0%, #0E2A3D 100%)",
            boxShadow: "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 8px 22px -10px rgba(14,42,61,0.4)",
            "&:hover": {
              backgroundImage: "linear-gradient(180deg, #224B62 0%, #0E2A3D 100%)",
              boxShadow: "0 1px 0 0 rgba(255,255,255,0.12) inset, 0 18px 38px -14px rgba(14,42,61,0.55)",
            },
          },
          "&.MuiButton-containedSecondary": {
            color: COLORS.primaryDeep,
            backgroundColor: COLORS.accent,
            backgroundImage: "linear-gradient(180deg, #F0C16E 0%, #D9A84B 100%)",
            boxShadow: "0 1px 0 0 rgba(255,255,255,0.45) inset, 0 8px 22px -10px rgba(217,168,75,0.55)",
            "&:hover": {
              backgroundImage: "linear-gradient(180deg, #F2C474 0%, #C39638 100%)",
              boxShadow: "0 1px 0 0 rgba(255,255,255,0.5) inset, 0 18px 38px -14px rgba(217,168,75,0.7)",
            },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: COLORS.line,
            color: COLORS.ink,
            backgroundColor: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
            "&:hover": { borderColor: COLORS.primary, backgroundColor: "rgba(255,255,255,0.85)" },
          },
          "&.MuiButton-text": {
            color: COLORS.ink,
            "&:hover": { backgroundColor: "rgba(14,26,36,0.05)" },
          },
        },
        sizeLarge: { paddingInline: 30, paddingBlock: 14, fontSize: "1rem" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: COLORS.line },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${COLORS.line}`,
          backgroundColor: "#FFFFFF",
          transition:
            "transform 320ms cubic-bezier(.2,.8,.2,1), border-color 250ms ease, box-shadow 320ms ease",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "transparent" },
      styleOverrides: {
        root: { backgroundColor: "transparent", backgroundImage: "none" },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
      styleOverrides: { root: { paddingInline: 24 } },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        // Force the floating-label style: label always sits notched in the top
        // border, never overlapping placeholders or input text.
        slotProps: {
          inputLabel: { shrink: true },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          // Lock the height so plain inputs and selects line up perfectly
          // when placed side-by-side in the same grid row.
          minHeight: 52,
          transition: "background-color 200ms ease, border-color 200ms ease",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.inkSoft,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.primary,
            borderWidth: 1.5,
          },
        },
        notchedOutline: {
          borderColor: COLORS.line,
          transition: "border-color 200ms ease",
        },
        input: {
          padding: "14px 16px",
          fontSize: "0.95rem",
          // Smaller, less visually competing placeholder.
          "&::placeholder": {
            color: COLORS.muted,
            opacity: 0.55,
            fontSize: "0.85rem",
          },
        },
        // Multiline (textarea) needs its own padding so rows breathe.
        multiline: {
          padding: 0,
          "& textarea": {
            padding: "12px 16px",
            fontSize: "0.95rem",
            "&::placeholder": {
              color: COLORS.muted,
              opacity: 0.55,
              fontSize: "0.85rem",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: COLORS.muted,
          fontSize: "1rem",
          fontWeight: 500,
          // Floating label position tuned for our 14px input padding.
          "&.MuiInputLabel-shrink": {
            color: COLORS.inkSoft,
            fontWeight: 600,
          },
          "&.Mui-focused": {
            color: COLORS.primary,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 4,
          marginTop: 6,
          fontSize: "0.78rem",
          color: COLORS.muted,
        },
      },
    },
    MuiSelect: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        // Match the plain input padding exactly so Select and TextField are
        // pixel-identical in height when placed side-by-side.
        select: {
          padding: "14px 16px",
          paddingRight: "44px", // room for the dropdown chevron
          minHeight: "1.4em",
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0, square: false },
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          borderTop: `1px solid ${COLORS.line}`,
          "&::before": { display: "none" },
          "&:last-of-type": { borderBottom: `1px solid ${COLORS.line}` },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, letterSpacing: "0.02em" },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: COLORS.line } },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          width: 22,
          height: 22,
          backgroundColor: "#FFFFFF",
          border: `2px solid ${COLORS.primary}`,
          boxShadow: "0 4px 12px -4px rgba(14,42,61,0.4)",
          "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 8px rgba(14,42,61,0.12)" },
        },
        track: { border: "none", height: 6 },
        rail: { opacity: 1, backgroundColor: COLORS.line, height: 6 },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export { COLORS };
export default theme;
