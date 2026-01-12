/**
 * CENTRALIZED THEME CONFIGURATION
 * All design tokens in ONE PLACE - Change here, updates everywhere
 */

export const theme = {
  // ====== COLORS ======
  colors: {
    // Primary Brand Colors
    primary: {
      main: "#0055FF", // Main primary color
      light: "#E6F0FF", // Light variant for backgrounds
      dark: "#003D99", // Dark variant for hover states
      darker: "#002D6F", // Darker variant for active states
    },

    // Secondary Colors
    secondary: {
      main: "#FFD700", // Gold/Yellow accent
      light: "#FFF5E6",
      dark: "#CCB000",
    },

    // Accent Colors
    accent: {
      main: "#1E1E1E", // Dark accent
      light: "#F5F5F5", // Light gray
      lighter: "#F9F9F9", // Lighter gray
    },

    // Semantic Colors
    success: "#27AE60",
    warning: "#F39C12",
    error: "#E74C3C",
    info: "#3498DB",

    // Neutral Colors
    background: "#FFFFFF",
    backgroundSecondary: "#F9F9F9",
    border: "#E0E0E0",
    borderLight: "#F0F0F0",

    // Text Colors
    text: {
      primary: "#000000",
      secondary: "#555555",
      tertiary: "#999999",
      light: "#CCCCCC",
      inverse: "#FFFFFF",
    },

    // Grayscale
    gray: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },

    // Shadows
    shadow: {
      light: "rgba(0, 0, 0, 0.05)",
      medium: "rgba(0, 0, 0, 0.1)",
      dark: "rgba(0, 0, 0, 0.2)",
    },
  },

  // ====== TYPOGRAPHY ======
  typography: {
    fontFamily: {
      primary: "'Inter', 'Poppins', sans-serif",
      secondary: "'Poppins', sans-serif",
      mono: "'Courier New', monospace",
    },

    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Heading Styles
    heading: {
      h1: {
        fontSize: "36px",
        fontWeight: 700,
        lineHeight: "1.4",
        letterSpacing: "-0.5px",
      },
      h2: {
        fontSize: "28px",
        fontWeight: 700,
        lineHeight: "1.4",
        letterSpacing: "-0.3px",
      },
      h3: {
        fontSize: "22px",
        fontWeight: 600,
        lineHeight: "1.5",
        letterSpacing: "0px",
      },
      h4: {
        fontSize: "18px",
        fontWeight: 600,
        lineHeight: "1.5",
      },
      h5: {
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "1.5",
      },
      h6: {
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "1.5",
      },
    },

    // Body Text Styles
    body: {
      large: {
        fontSize: "18px",
        fontWeight: 400,
        lineHeight: "1.6",
      },
      base: {
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "1.6",
      },
      small: {
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "1.5",
      },
      tiny: {
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "1.5",
      },
    },

    // Label & Input Text
    label: {
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "1.5",
    },

    caption: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "1.4",
    },
  },

  // ====== SPACING ======
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
    section: "48px",
    pagePadding: "24px",
    sectionSpacing: "60px",

    // Common padding combinations
    cardPadding: "20px",
    buttonPadding: "12px 24px",
  },

  // ====== BORDER RADIUS ======
  radius: {
    none: "0px",
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    xxl: "20px",
    full: "9999px",

    // Component-specific
    button: "8px",
    card: "12px",
    input: "8px",
    modal: "16px",
    pill: "9999px",
  },

  // ====== SHADOWS ======
  shadows: {
    none: "none",
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
    xxl: "0 25px 50px rgba(0, 0, 0, 0.25)",
    inset: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",

    // Component-specific
    card: "0 4px 12px rgba(0, 0, 0, 0.1)",
    button: "0 2px 8px rgba(0, 0, 0, 0.08)",
    buttonHover: "0 4px 16px rgba(0, 0, 0, 0.12)",
    modal: "0 20px 60px rgba(0, 0, 0, 0.15)",
    input: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
  },

  // ====== TRANSITIONS & ANIMATIONS ======
  transitions: {
    fast: "0.15s ease-in-out",
    base: "0.3s ease-in-out",
    slow: "0.5s ease-in-out",

    // Component-specific
    button: "0.2s ease-in-out",
    hover: "0.15s ease-in-out",
    modal: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // ====== Z-INDEX SCALE ======
  zIndex: {
    hidden: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ====== BREAKPOINTS ======
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    xxl: "1536px",

    // Media queries
    mobile: "(max-width: 639px)",
    tablet: "(min-width: 640px) and (max-width: 1023px)",
    desktop: "(min-width: 1024px)",
  },

  // ====== COMPONENT-SPECIFIC VARIANTS ======
  button: {
    base: {
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 600,
      transition: "0.2s ease-in-out",
      cursor: "pointer",
      border: "none",
    },
    small: {
      padding: "8px 16px",
      fontSize: "14px",
    },
    large: {
      padding: "14px 32px",
      fontSize: "18px",
    },
  },

  card: {
    borderRadius: "12px",
    padding: "20px",
    shadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    border: "1px solid #E0E0E0",
    backgroundColor: "#FFFFFF",
  },

  input: {
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #E0E0E0",
    transition: "0.2s ease-in-out",
  },

  // ====== LAYOUT ======
  layout: {
    navbarHeight: "64px",
    sidebarWidth: "280px",
    maxContentWidth: "1400px",
    containerPadding: "24px",
  },
};

// ====== UTILITY FUNCTIONS ======

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return "0, 0, 0";
};

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (mobile: string, tablet: string, desktop: string) => {
  return {
    mobile: mobile,
    tablet: tablet,
    desktop: desktop,
  };
};

/**
 * Create a combined font style
 */
export const getFontStyle = (type: keyof typeof theme.typography.heading | keyof typeof theme.typography.body) => {
  if (type in theme.typography.heading) {
    return theme.typography.heading[type as keyof typeof theme.typography.heading];
  }
  if (type in theme.typography.body) {
    return theme.typography.body[type as keyof typeof theme.typography.body];
  }
  return null;
};

export default theme;
