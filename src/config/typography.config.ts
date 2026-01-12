/**
 * Typography Configuration
 * Centralized configuration for all font sizes, colors, weights, and styling
 * Modify this file to control the entire website's typography
 */

export const typographyConfig = {
  // ====== FONTS ======
  fonts: {
    primary: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  },

  // ====== BASE FONT SIZE (in pixels) ======
  baseFontSize: 16, // Change this to scale all sizes

  // ====== RESPONSIVE BREAKPOINTS ======
  responsive: {
    sm: { breakpoint: 640, fontSize: 16 },
    md: { breakpoint: 768, fontSize: 17 },
    lg: { breakpoint: 1024, fontSize: 18 },
    xl: { breakpoint: 1280, fontSize: 19 },
    "2xl": { breakpoint: 1536, fontSize: 20 },
  },

  // ====== UNIFIED HEADING STYLES (ALL HEADINGS CONSISTENT) ======
  headingStyles: {
    h1: {
      fontSize: "clamp(2.2rem, 5vw, 2.7rem)",
      fontWeight: 900,
      lineHeight: 1.2,
      letterSpacing: "-0.033em",
      margin: "0 0 1rem 0",
      color: "#0f172a",
    },
    h2: {
      fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.015em",
      margin: "0 0 0.75rem 0",
      color: "#0f172a",
    },
    h3: {
      fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.015em",
      margin: "0 0 0.75rem 0",
      color: "#0f172a",
    },
    h4: {
      fontSize: "1.35rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "0",
      margin: "0 0 0.5rem 0",
      color: "#1e293b",
    },
    h5: {
      fontSize: "1.2rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "0",
      margin: "0 0 0.5rem 0",
      color: "#1e293b",
    },
    h6: {
      fontSize: "1.05rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "0",
      margin: "0 0 0.5rem 0",
      color: "#1e293b",
    },
  },

  // ====== HEADING SIZES (in rem - for reference) ======
  headings: {
    h1: { fontSize: 2.7, fontWeight: 900 },
    h2: { fontSize: 2.25, fontWeight: 800 },
    h3: { fontSize: 1.8, fontWeight: 700 },
    h4: { fontSize: 1.35, fontWeight: 700 },
    h5: { fontSize: 1.2, fontWeight: 700 },
    h6: { fontSize: 1.05, fontWeight: 700 },
  },

  // ====== BODY TEXT ======
  body: {
    fontSize: 1, // in rem
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // ====== SMALL TEXT ======
  small: {
    fontSize: 0.875,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // ====== FONT WEIGHTS ======
  fontWeights: {
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // ====== COLORS ======
  colors: {
    // Primary Colors
    primary: "#0a66c2",
    primaryDark: "#084ba8",
    primaryLight: "#f0f7ff",

    // Background Colors
    backgroundLight: "#f5f7f8",
    backgroundWhite: "#ffffff",

    // Text Colors
    text900: "#0f172a",
    text800: "#1e293b",
    text700: "#334155",
    text600: "#475569",
    text500: "#64748b",
    text400: "#94a3b8",
    text200: "#e2e8f0",
    text100: "#f1f5f9",

    // Border Colors
    border300: "#cbd5e1",
    border200: "#e2e8f0",
    border100: "#f1f5f9",

    // Status Colors
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",

    // Gold
    gold: "#D4AF37",
  },

  // ====== LINE HEIGHT ======
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },

  // ====== LETTER SPACING ======
  letterSpacing: {
    tight: "-0.033em",
    normal: "0em",
    wide: "0.025em",
  },

  // ====== SHADOWS ======
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
  },

  // ====== BORDER RADIUS ======
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },

  // ====== TRANSITIONS ======
  transitions: {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease",
  },
};

// ====== UTILITY: Get heading styles ======
export const getHeadingStyle = (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
  return typographyConfig.headingStyles[level];
};

// ====== UTILITY: Apply all heading styles ======
export const applyHeadingStyles = (element: string, level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
  return {
    style: typographyConfig.headingStyles[level],
  };
};

export default typographyConfig;
